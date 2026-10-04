-- ============================================================
-- 003_functions.sql
-- Secure PostgreSQL functions for the COD order flow
-- - generate_order_number
-- - calc_shipping_cost
-- - create_cod_order  (transactional: validates stock, recalculates
--                      totals server-side, creates customer+order+items)
-- - restore_stock_for_order
-- - admin_dashboard_stats
-- ============================================================

-- ------------------------------------------------------------
-- Unique order number
-- ------------------------------------------------------------
create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num text;
  v_seq bigint;
begin
  v_seq := nextval('public.orders_id_seq');
  v_num := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_seq::text, 6, '0');
  return v_num;
end;
$$;

-- ------------------------------------------------------------
-- Shipping calculation
-- - looks at active shipping_config rows
-- - by_city uses the city-specific zone cost when available
-- - free method -> 0
-- - free_over threshold on the base config makes shipping 0
-- ------------------------------------------------------------
create or replace function public.calc_shipping_cost(
  p_city text,
  p_subtotal numeric
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cfg public.shipping_config%rowtype;
  v_zone_cost numeric;
begin
  select * into v_cfg
  from public.shipping_config
  where active
  order by id
  limit 1;

  if not found then
    return 0;
  end if;

  if v_cfg.method = 'free' then
    return 0;
  end if;

  if v_cfg.method = 'by_city' and p_city is not null then
    select cost into v_zone_cost
    from public.shipping_zones
    where city = p_city and active
    order by id
    limit 1;
    if found then
      return v_zone_cost;
    end if;
  end if;

  if v_cfg.free_over is not null and p_subtotal >= v_cfg.free_over then
    return 0;
  end if;

  return v_cfg.base_cost;
end;
$$;

-- ------------------------------------------------------------
-- COD order creation (the main function)
-- Accepts a JSON payload, recalculates everything server-side,
-- validates and decrements stock in the same transaction.
-- ------------------------------------------------------------
create or replace function public.create_cod_order(
  p_full_name text,
  p_phone text,
  p_address text,
  p_city text default null,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb,
  p_offer_id integer default null,
  p_offer_quantity integer default 1,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id integer;
  v_order_number text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_offer public.product_offers%rowtype;
  v_subtotal numeric := 0;
  v_shipping numeric;
  v_discount numeric := 0;
  v_total numeric;
  v_customer_id integer;
  v_existing_customer public.customers%rowtype;
  v_product_id integer;
  v_qty integer;
  v_price numeric;
  v_variant text;
  v_line_subtotal numeric;
  v_name_snapshot text;
  v_rows jsonb := '[]'::jsonb;
  v_coupon public.coupons%rowtype;
begin
  -- =========================================================
  -- VALIDATION
  -- =========================================================
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    raise exception 'VALIDATION: name required';
  end if;
  if p_phone is null or length(trim(p_phone)) < 8 then
    raise exception 'VALIDATION: valid phone required';
  end if;
  if p_address is null or length(trim(p_address)) < 5 then
    raise exception 'VALIDATION: address required';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    if p_offer_id is null then
      raise exception 'VALIDATION: order has no items';
    end if;
  end if;

  -- =========================================================
  -- CUSTOMER: find by phone or create
  -- =========================================================
  select * into v_existing_customer
  from public.customers
  where phone = trim(p_phone);

  if found then
    v_customer_id := v_existing_customer.id;
  else
    insert into public.customers (full_name, phone, address, city)
    values (trim(p_full_name), trim(p_phone), trim(p_address), nullif(trim(p_city), ''))
    returning id into v_customer_id;
  end if;

  -- =========================================================
  -- OFFER MODE: single product with a quantity offer
  -- =========================================================
  if p_offer_id is not null then
    select * into v_offer
    from public.product_offers
    where id = p_offer_id and active
    for update;

    if not found then
      raise exception 'STOCK: offer unavailable';
    end if;

    v_qty := greatest(1, coalesce(p_offer_quantity, v_offer.quantity));

    select * into v_product
    from public.products
    where id = v_offer.product_id and status = 'active'
    for update;

    if not found then
      raise exception 'STOCK: product unavailable';
    end if;

    if v_product.stock_quantity < v_qty then
      raise exception 'STOCK: not enough stock for %', v_product.name;
    end if;

    v_price := v_offer.price;                       -- offer price per bundle unit
    v_line_subtotal := round(v_offer.price * v_qty, 2);
    v_name_snapshot := v_product.name;
    v_variant := null;
    v_subtotal := v_subtotal + v_line_subtotal;

    v_rows := v_rows || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'product_name_snapshot', v_name_snapshot,
      'product_price_snapshot', v_price,
      'quantity', v_qty,
      'variant', v_variant,
      'subtotal', v_line_subtotal
    ));
  else
    -- =======================================================
    -- NORMAL MODE: explicit product list from the frontend
    -- Prices are ALWAYS read from the database, never trusted.
    -- =======================================================
    for v_item in select * from jsonb_array_elements(p_items) loop
      v_product_id := (v_item->>'productId')::integer;
      v_qty := greatest(1, coalesce((v_item->>'quantity')::integer, 1));
      v_variant := v_item->>'variant';

      select * into v_product
      from public.products
      where id = v_product_id and status = 'active'
      for update;

      if not found then
        raise exception 'STOCK: product % unavailable', v_product_id;
      end if;

      if v_product.stock_quantity < v_qty then
        raise exception 'STOCK: not enough stock for %', v_product.name;
      end if;

      -- Server-side price from DB (never trust frontend price)
      if v_offer_id is null then
        v_price := v_product.price;
      end if;

      v_line_subtotal := round(v_price * v_qty, 2);
      v_name_snapshot := v_product.name;
      v_subtotal := v_subtotal + v_line_subtotal;

      v_rows := v_rows || jsonb_build_array(jsonb_build_object(
        'product_id', v_product.id,
        'product_name_snapshot', v_name_snapshot,
        'product_price_snapshot', v_price,
        'quantity', v_qty,
        'variant', v_variant,
        'subtotal', v_line_subtotal
      ));
    end loop;
  end if;

  -- =========================================================
  -- COUPON (optional)
  -- =========================================================
  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon
    from public.coupons
    where upper(code) = upper(trim(p_coupon_code))
      and is_active
      and (start_date is null or start_date <= now())
      and (end_date is null or end_date >= now())
      and (max_uses is null or used_count < max_uses)
      and (min_order_amount is null or min_order_amount <= v_subtotal);

    if found then
      if v_coupon.type = 'percentage' then
        v_discount := round(v_subtotal * (v_coupon.value / 100), 2);
      else
        v_discount := least(v_coupon.value, v_subtotal);
      end if;

      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    end if;
  end if;

  -- =========================================================
  -- SHIPPING + TOTAL
  -- =========================================================
  v_shipping := public.calc_shipping_cost(p_city, v_subtotal);
  v_total := greatest(0, round(v_subtotal + v_shipping - v_discount, 2));

  -- =========================================================
  -- STOCK UPDATE (locked above with FOR UPDATE => no race)
  -- =========================================================
  if p_offer_id is not null then
    update public.products
    set stock_quantity = stock_quantity - v_qty
    where id = v_offer.product_id;
  else
    for v_item in select * from jsonb_array_elements(v_rows) loop
      update public.products
      set stock_quantity = stock_quantity - (v_item->>'quantity')::integer
      where id = (v_item->>'product_id')::integer;
    end loop;
  end if;

  -- =========================================================
  -- ORDER + ITEMS
  -- =========================================================
  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, customer_id, full_name, phone, address, city, notes,
    subtotal, shipping_cost, discount, total, currency,
    payment_method, payment_status, order_status, confirmation_status,
    coupon_code
  )
  values (
    v_order_number, v_customer_id, trim(p_full_name), trim(p_phone),
    trim(p_address), nullif(trim(p_city), ''), nullif(trim(p_notes), ''),
    v_subtotal, v_shipping, v_discount, v_total, 'MAD',
    'cod', 'pending', 'new', 'pending',
    nullif(trim(p_coupon_code), '')
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(v_rows) loop
    insert into public.order_items (
      order_id, product_id, product_name_snapshot, product_price_snapshot,
      quantity, variant, subtotal
    )
    values (
      v_order_id,
      (v_item->>'product_id')::integer,
      v_item->>'product_name_snapshot',
      (v_item->>'product_price_snapshot')::numeric,
      (v_item->>'quantity')::integer,
      v_item->>'variant',
      (v_item->>'subtotal')::numeric
    );
  end loop;

  -- Update customer aggregate
  update public.customers
  set total_orders = total_orders + 1,
      total_spent = total_spent + v_total,
      last_order_at = now(),
      full_name = trim(p_full_name),
      address = trim(p_address),
      city = coalesce(nullif(trim(p_city), ''), city)
  where id = v_customer_id;

  -- =========================================================
  -- AUDIT
  -- =========================================================
  insert into public.audit_logs (action, entity_type, entity_id, new_data)
  values ('order_created', 'order', v_order_id::text,
    jsonb_build_object(
      'order_number', v_order_number,
      'total', v_total,
      'items', v_rows
    ));

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping,
    'discount', v_discount,
    'total', v_total,
    'items', v_rows
  );

exception
  when others then
    -- Roll back the whole transaction, return a clean error
    raise;
end;
$$;

-- ------------------------------------------------------------
-- Restore stock when an order is cancelled / returned
-- ------------------------------------------------------------
create or replace function public.restore_stock_for_order(
  p_order_id integer,
  p_admin_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item public.order_items%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return false;
  end if;

  for v_item in select * from public.order_items where order_id = p_order_id loop
    if v_item.product_id is not null then
      update public.products
      set stock_quantity = stock_quantity + v_item.quantity
      where id = v_item.product_id;
    end if;
  end loop;

  update public.orders
  set order_status = case
        when order_status in ('new','pending_confirmation','confirmed','preparing','shipped')
          then 'cancelled'
        else 'returned'
      end,
      payment_status = case
        when payment_status = 'paid' then 'refunded'
        else payment_status
      end,
      updated_at = now()
  where id = p_order_id;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, new_data)
  values (p_admin_id, 'stock_restored', 'order', p_order_id::text,
    jsonb_build_object('order_status', 'cancelled_or_returned'));

  return true;
end;
$$;

-- ------------------------------------------------------------
-- Admin dashboard statistics (computed, never hardcoded)
-- ------------------------------------------------------------
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'total_orders',        (select count(*) from public.orders),
    'new_orders',          (select count(*) from public.orders where order_status = 'new'),
    'pending_confirm',     (select count(*) from public.orders where confirmation_status = 'pending'),
    'confirmed',           (select count(*) from public.orders where order_status in ('confirmed','preparing')),
    'shipped',             (select count(*) from public.orders where order_status = 'shipped'),
    'delivered',           (select count(*) from public.orders where order_status = 'delivered'),
    'cancelled',           (select count(*) from public.orders where order_status = 'cancelled'),
    'returned',            (select count(*) from public.orders where order_status = 'returned'),
    'total_revenue',       coalesce((select sum(total) from public.orders where payment_status in ('paid','pending') and order_status not in ('cancelled','returned')), 0),
    'revenue_30d',         coalesce((select sum(total) from public.orders where created_at >= now() - interval '30 days' and order_status not in ('cancelled','returned')), 0),
    'total_customers',     (select count(*) from public.customers),
    'active_products',     (select count(*) from public.products where status = 'active'),
    'low_stock_products',  (select count(*) from public.products where status = 'active' and stock_quantity <= 5),
    'best_selling',        (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select oi.product_name_snapshot as name,
               sum(oi.quantity)::int as sold,
               sum(oi.subtotal) as revenue
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        where o.order_status not in ('cancelled','returned')
        group by oi.product_name_snapshot
        order by sum(oi.quantity) desc
        limit 10
      ) t
    ),
    'orders_by_city',      (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select city, count(*)::int as orders
        from public.orders
        where city is not null
        group by city
        order by count(*) desc
        limit 10
      ) t
    ),
    'orders_by_date',      (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select to_char(created_at, 'YYYY-MM-DD') as day, count(*)::int as orders
        from public.orders
        where created_at >= now() - interval '30 days'
        group by 1 order by 1
      ) t
    )
  ) into v_result;

  return v_result;
end;
$$;
