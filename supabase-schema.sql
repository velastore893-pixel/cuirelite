-- ============================================================
-- supabase-schema.sql
-- CANONICAL CONSOLIDATED SCHEMA for the CUIR ELITE COD store.
-- This file is the single source of truth for documentation.
--
-- It mirrors, exactly, the ordered migrations in
--   supabase/migrations/
--     001_initial_schema.sql
--     002_rls_policies.sql
--     003_functions_and_triggers.sql
--     004_storage.sql
--     005_indexes.sql
--     006_seed_data.sql
--
-- HOW TO USE
--   Option A (recommended): run the migrations in order via the
--                            Supabase SQL Editor or `supabase db push`.
--   Option B (single shot):  paste this whole file into the Supabase
--                            SQL Editor and run it once.
--
-- Both options produce the SAME database structure.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ============================================================
-- 1. TABLES
-- ============================================================

-- ------------------------------------------------------------
-- ADMIN PROFILES (linked to Supabase Auth users)
-- ------------------------------------------------------------
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'admin'
    check (role in ('super_admin','admin','manager')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
create table if not exists public.categories (
  id serial primary key,
  name text not null,
  name_ar text,
  slug text not null unique,
  description text,
  image text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
create table if not exists public.products (
  id serial primary key,
  name text not null,
  name_ar text,
  slug text not null unique,
  description text,
  short_description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price numeric(10,2) check (cost_price is null or cost_price >= 0),
  currency text not null default 'MAD',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text,
  category_id integer references public.categories(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive','draft')),
  featured boolean not null default false,
  new_arrival boolean not null default false,
  images jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  material text,
  material_ar text,
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRODUCT OFFERS / BUNDLES
-- ------------------------------------------------------------
create table if not exists public.product_offers (
  id serial primary key,
  product_id integer not null references public.products(id) on delete cascade,
  name text not null,
  name_ar text,
  quantity integer not null default 1 check (quantity >= 1),
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price is null or original_price >= 0),
  promo_text text,
  promo_text_ar text,
  active boolean not null default true,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------
create table if not exists public.customers (
  id serial primary key,
  full_name text not null,
  phone text not null,
  email text,
  address text,
  city text,
  notes text,
  total_orders integer not null default 0,
  total_spent numeric(12,2) not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- COUPONS
-- ------------------------------------------------------------
create table if not exists public.coupons (
  id serial primary key,
  code text not null unique,
  type text not null check (type in ('percentage','fixed')),
  value numeric(10,2) not null check (value >= 0),
  min_order_amount numeric(10,2),
  max_uses integer,
  used_count integer not null default 0,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ORDERS (COD)
-- ------------------------------------------------------------
create table if not exists public.orders (
  id serial primary key,
  order_number text not null unique,
  customer_id integer references public.customers(id) on delete set null,
  full_name text not null,
  phone text not null,
  address text not null,
  city text,
  notes text,
  internal_notes text,
  subtotal numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  currency text not null default 'MAD',
  payment_method text not null default 'cod'
    check (payment_method in ('cod','card','paypal','transfer')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'new'
    check (order_status in ('new','pending_confirmation','confirmed','preparing','shipped','delivered','cancelled','returned')),
  confirmation_status text not null default 'pending'
    check (confirmation_status in ('pending','confirmed','rejected','unreachable')),
  assigned_admin uuid references public.admin_profiles(id) on delete set null,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ORDER ITEMS (historical snapshots)
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id serial primary key,
  order_id integer not null references public.orders(id) on delete cascade,
  product_id integer references public.products(id) on delete set null,
  product_name_snapshot text not null,
  product_price_snapshot numeric(10,2) not null,
  quantity integer not null check (quantity >= 1),
  variant text,
  subtotal numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SHIPPING CONFIGURATION
-- ------------------------------------------------------------
create table if not exists public.shipping_config (
  id serial primary key,
  label text not null default 'default',
  label_ar text,
  method text not null default 'fixed' check (method in ('free','fixed','by_city')),
  base_cost numeric(10,2) not null default 0,
  free_over numeric(10,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_zones (
  id serial primary key,
  config_id integer references public.shipping_config(id) on delete cascade,
  city text not null,
  cost numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- STORE SETTINGS (key / value)
-- ------------------------------------------------------------
create table if not exists public.store_settings (
  id serial primary key,
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- AUDIT LOGS
-- ------------------------------------------------------------
create table if not exists public.audit_logs (
  id serial primary key,
  admin_id uuid references public.admin_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. TRIGGERS (updated_at)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_offers_updated_at on public.product_offers;
create trigger trg_offers_updated_at before update on public.product_offers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_shipping_updated_at on public.shipping_config;
create trigger trg_shipping_updated_at before update on public.shipping_config
  for each row execute function public.set_updated_at();

drop trigger if exists trg_admin_profiles_updated_at on public.admin_profiles;
create trigger trg_admin_profiles_updated_at before update on public.admin_profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. INDEXES
-- ============================================================
create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_active_idx on public.categories (active, sort_order);

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_active_created_idx on public.products (created_at desc) where status = 'active';
create index if not exists products_featured_status_idx on public.products (status, featured) where status = 'active';
create index if not exists products_new_arrival_status_idx on public.products (status, new_arrival) where status = 'active';
create index if not exists products_low_stock_idx on public.products (stock_quantity) where status = 'active' and stock_quantity <= 10;
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index if not exists products_name_ar_trgm_idx on public.products using gin (name_ar gin_trgm_ops);

create index if not exists product_offers_product_idx on public.product_offers(product_id);
create index if not exists product_offers_active_idx on public.product_offers (product_id, sort_order) where active;

create index if not exists customers_phone_idx on public.customers (phone);
create index if not exists customers_name_idx on public.customers using gin (full_name gin_trgm_ops);
create index if not exists customers_city_idx on public.customers (city);

create index if not exists coupons_code_active_idx on public.coupons (code) where is_active;

create index if not exists orders_status_created_idx on public.orders (order_status, created_at desc);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_phone_idx on public.orders(phone);
create index if not exists orders_city_idx on public.orders(city);
create index if not exists orders_city_created_idx on public.orders (city, created_at desc);
create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index if not exists orders_confirmation_idx on public.orders (confirmation_status) where confirmation_status = 'pending';
create index if not exists orders_order_number_idx on public.orders (order_number);

create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);
create index if not exists order_items_product_qty_idx on public.order_items (product_id, quantity);

create index if not exists shipping_zones_city_idx on public.shipping_zones(city);

create index if not exists audit_logs_admin_idx on public.audit_logs(admin_id);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_action_created_idx on public.audit_logs (action, created_at desc);

-- ============================================================
-- 4. HELPER / SECURITY FUNCTIONS
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_profiles ap
    where ap.id = auth.uid() and ap.is_active = true
  );
$$;

create or replace function public.is_admin_or_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_profiles ap
    where ap.id = auth.uid() and ap.is_active = true
      and ap.role in ('super_admin','admin','manager')
  );
$$;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_offers enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipping_config enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.store_settings enable row level security;
alter table public.coupons enable row level security;
alter table public.audit_logs enable row level security;

-- admin_profiles
drop policy if exists "admins read own profile" on public.admin_profiles;
create policy "admins read own profile" on public.admin_profiles for select
  to authenticated using (id = auth.uid());

drop policy if exists "super admins manage profiles" on public.admin_profiles;
create policy "super admins manage profiles" on public.admin_profiles for all
  to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.role = 'super_admin' and ap.is_active))
  with check (exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.role = 'super_admin' and ap.is_active));

-- categories
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select
  to anon, authenticated using (active = true or public.is_admin());

drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select
  to anon, authenticated using (status = 'active' or public.is_admin());

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- product_offers
drop policy if exists "public read offers" on public.product_offers;
create policy "public read offers" on public.product_offers for select
  to anon, authenticated using (active = true or public.is_admin());

drop policy if exists "admins manage offers" on public.product_offers;
create policy "admins manage offers" on public.product_offers for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- customers
drop policy if exists "public create customers" on public.customers;
create policy "public create customers" on public.customers for insert
  to anon, authenticated with check (true);

drop policy if exists "admins read customers" on public.customers;
create policy "admins read customers" on public.customers for select
  to authenticated using (public.is_admin_or_manager());

drop policy if exists "admins update customers" on public.customers;
create policy "admins update customers" on public.customers for update
  to authenticated using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());

drop policy if exists "admins delete customers" on public.customers;
create policy "admins delete customers" on public.customers for delete
  to authenticated using (public.is_admin());

-- orders
drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders" on public.orders for insert
  to anon, authenticated with check (true);

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders for select
  to authenticated using (public.is_admin_or_manager());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders for update
  to authenticated using (public.is_admin_or_manager()) with check (public.is_admin_or_manager());

drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders for delete
  to authenticated using (public.is_admin());

-- order_items
drop policy if exists "public insert order_items" on public.order_items;
create policy "public insert order_items" on public.order_items for insert
  to anon, authenticated with check (true);

drop policy if exists "admins read order_items" on public.order_items;
create policy "admins read order_items" on public.order_items for select
  to authenticated using (public.is_admin_or_manager());

drop policy if exists "admins delete order_items" on public.order_items;
create policy "admins delete order_items" on public.order_items for delete
  to authenticated using (public.is_admin());

-- shipping
drop policy if exists "public read shipping" on public.shipping_config;
create policy "public read shipping" on public.shipping_config for select
  to anon, authenticated using (active = true or public.is_admin());

drop policy if exists "admins manage shipping" on public.shipping_config;
create policy "admins manage shipping" on public.shipping_config for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read shipping zones" on public.shipping_zones;
create policy "public read shipping zones" on public.shipping_zones for select
  to anon, authenticated using (active = true or public.is_admin());

drop policy if exists "admins manage shipping zones" on public.shipping_zones;
create policy "admins manage shipping zones" on public.shipping_zones for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- store_settings
drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings for select
  to anon, authenticated using (true);

drop policy if exists "admins manage settings" on public.store_settings;
create policy "admins manage settings" on public.store_settings for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- coupons
drop policy if exists "public read active coupons" on public.coupons;
create policy "public read active coupons" on public.coupons for select
  to anon, authenticated using (is_active = true);

drop policy if exists "admins manage coupons" on public.coupons;
create policy "admins manage coupons" on public.coupons for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- audit_logs
drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "admins read audit logs" on public.audit_logs for select
  to authenticated using (public.is_admin());

drop policy if exists "admins insert audit logs" on public.audit_logs;
create policy "admins insert audit logs" on public.audit_logs for insert
  to authenticated with check (public.is_admin());

-- ============================================================
-- 6. BUSINESS FUNCTIONS
-- ============================================================
create or replace function public.generate_order_number()
returns text language plpgsql security definer set search_path = public as $$
declare
  v_seq bigint;
begin
  v_seq := nextval('public.orders_id_seq');
  return 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_seq::text, 6, '0');
end;
$$;

create or replace function public.calc_shipping_cost(p_city text, p_subtotal numeric)
returns numeric language plpgsql security definer set search_path = public as $$
declare
  v_cfg public.shipping_config%rowtype;
  v_zone_cost numeric;
begin
  select * into v_cfg from public.shipping_config where active order by id limit 1;
  if not found then return 0; end if;
  if v_cfg.method = 'free' then return 0; end if;
  if v_cfg.method = 'by_city' and p_city is not null then
    select cost into v_zone_cost from public.shipping_zones
    where city = p_city and active order by id limit 1;
    if found then return v_zone_cost; end if;
  end if;
  if v_cfg.free_over is not null and p_subtotal >= v_cfg.free_over then return 0; end if;
  return v_cfg.base_cost;
end;
$$;

create or replace function public.restore_stock_for_order(p_order_id integer, p_admin_id uuid default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_item public.order_items%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return false; end if;

  for v_item in select * from public.order_items where order_id = p_order_id loop
    if v_item.product_id is not null then
      update public.products set stock_quantity = stock_quantity + v_item.quantity where id = v_item.product_id;
    end if;
  end loop;

  update public.orders
  set order_status = case when order_status in ('new','pending_confirmation','confirmed','preparing','shipped') then 'cancelled' else 'returned' end,
      payment_status = case when payment_status = 'paid' then 'refunded' else payment_status end,
      updated_at = now()
  where id = p_order_id;

  insert into public.audit_logs (admin_id, action, entity_type, entity_id, new_data)
  values (p_admin_id, 'stock_restored', 'order', p_order_id::text, jsonb_build_object('order_id', p_order_id));

  return true;
end;
$$;

create or replace function public.admin_dashboard_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'total_orders', (select count(*) from public.orders),
    'new_orders', (select count(*) from public.orders where order_status = 'new'),
    'pending_confirm', (select count(*) from public.orders where confirmation_status = 'pending'),
    'confirmed', (select count(*) from public.orders where order_status in ('confirmed','preparing')),
    'shipped', (select count(*) from public.orders where order_status = 'shipped'),
    'delivered', (select count(*) from public.orders where order_status = 'delivered'),
    'cancelled', (select count(*) from public.orders where order_status = 'cancelled'),
    'returned', (select count(*) from public.orders where order_status = 'returned'),
    'total_revenue', coalesce((select sum(total) from public.orders where payment_status in ('paid','pending') and order_status not in ('cancelled','returned')), 0),
    'revenue_30d', coalesce((select sum(total) from public.orders where created_at >= now() - interval '30 days' and order_status not in ('cancelled','returned')), 0),
    'total_customers', (select count(*) from public.customers),
    'active_products', (select count(*) from public.products where status = 'active'),
    'low_stock_products', (select count(*) from public.products where status = 'active' and stock_quantity <= 5),
    'best_selling', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select oi.product_name_snapshot as name, sum(oi.quantity)::int as sold, sum(oi.subtotal) as revenue
      from public.order_items oi join public.orders o on o.id = oi.order_id
      where o.order_status not in ('cancelled','returned')
      group by oi.product_name_snapshot order by sum(oi.quantity) desc limit 10) t),
    'orders_by_city', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select city, count(*)::int as orders from public.orders
      where city is not null group by city order by count(*) desc limit 10) t),
    'orders_by_date', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
      select to_char(created_at, 'YYYY-MM-DD') as day, count(*)::int as orders
      from public.orders where created_at >= now() - interval '30 days'
      group by 1 order by 1) t)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.create_cod_order(
  p_full_name text, p_phone text, p_address text,
  p_city text default null, p_notes text default null,
  p_items jsonb default '[]'::jsonb,
  p_offer_id integer default null, p_offer_quantity integer default 1,
  p_coupon_code text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order_id integer; v_order_number text; v_item jsonb;
  v_product public.products%rowtype; v_offer public.product_offers%rowtype;
  v_subtotal numeric := 0; v_shipping numeric; v_discount numeric := 0; v_total numeric;
  v_customer_id integer; v_existing public.customers%rowtype;
  v_qty integer; v_price numeric; v_line numeric; v_rows jsonb := '[]'::jsonb;
  v_coupon public.coupons%rowtype;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then raise exception 'VALIDATION: name required'; end if;
  if p_phone is null or length(trim(p_phone)) < 8 then raise exception 'VALIDATION: valid phone required'; end if;
  if p_address is null or length(trim(p_address)) < 5 then raise exception 'VALIDATION: address required'; end if;
  if (p_items is null or jsonb_array_length(p_items) = 0) and p_offer_id is null then
    raise exception 'VALIDATION: order has no items';
  end if;

  select * into v_existing from public.customers where phone = trim(p_phone);
  if found then
    v_customer_id := v_existing.id;
  else
    insert into public.customers (full_name, phone, address, city)
    values (trim(p_full_name), trim(p_phone), trim(p_address), nullif(trim(p_city), ''))
    returning id into v_customer_id;
  end if;

  if p_offer_id is not null then
    select * into v_offer from public.product_offers where id = p_offer_id and active for update;
    if not found then raise exception 'STOCK: offer unavailable'; end if;
    v_qty := greatest(1, coalesce(p_offer_quantity, v_offer.quantity));
    select * into v_product from public.products where id = v_offer.product_id and status = 'active' for update;
    if not found then raise exception 'STOCK: product unavailable'; end if;
    if v_product.stock_quantity < v_qty then raise exception 'STOCK: not enough stock for %', v_product.name; end if;
    v_price := v_offer.price;
    v_line := round(v_offer.price * v_qty, 2);
    v_subtotal := v_subtotal + v_line;
    v_rows := v_rows || jsonb_build_array(jsonb_build_object('product_id', v_product.id, 'product_name_snapshot', v_product.name, 'product_price_snapshot', v_price, 'quantity', v_qty, 'variant', null, 'subtotal', v_line));
  else
    for v_item in select * from jsonb_array_elements(p_items) loop
      select * into v_product from public.products where id = (v_item->>'productId')::integer and status = 'active' for update;
      if not found then raise exception 'STOCK: product % unavailable', v_item->>'productId'; end if;
      v_qty := greatest(1, coalesce((v_item->>'quantity')::integer, 1));
      if v_product.stock_quantity < v_qty then raise exception 'STOCK: not enough stock for %', v_product.name; end if;
      v_price := v_product.price;
      v_line := round(v_price * v_qty, 2);
      v_subtotal := v_subtotal + v_line;
      v_rows := v_rows || jsonb_build_array(jsonb_build_object('product_id', v_product.id, 'product_name_snapshot', v_product.name, 'product_price_snapshot', v_price, 'quantity', v_qty, 'variant', v_item->>'variant', 'subtotal', v_line));
    end loop;
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
    where upper(code) = upper(trim(p_coupon_code)) and is_active
      and (start_date is null or start_date <= now())
      and (end_date is null or end_date >= now())
      and (max_uses is null or used_count < max_uses)
      and (min_order_amount is null or min_order_amount <= v_subtotal);
    if found then
      if v_coupon.type = 'percentage' then v_discount := round(v_subtotal * (v_coupon.value / 100), 2);
      else v_discount := least(v_coupon.value, v_subtotal); end if;
      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    end if;
  end if;

  v_shipping := public.calc_shipping_cost(p_city, v_subtotal);
  v_total := greatest(0, round(v_subtotal + v_shipping - v_discount, 2));

  update public.products set stock_quantity = stock_quantity - ((r->>'quantity')::integer)
  from jsonb_array_elements(v_rows) r where id = (r->>'product_id')::integer;

  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, customer_id, full_name, phone, address, city, notes,
    subtotal, shipping_cost, discount, total, currency,
    payment_method, payment_status, order_status, confirmation_status, coupon_code
  ) values (
    v_order_number, v_customer_id, trim(p_full_name), trim(p_phone),
    trim(p_address), nullif(trim(p_city), ''), nullif(trim(p_notes), ''),
    v_subtotal, v_shipping, v_discount, v_total, 'MAD',
    'cod', 'pending', 'new', 'pending', nullif(trim(p_coupon_code), '')
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(v_rows) loop
    insert into public.order_items (order_id, product_id, product_name_snapshot, product_price_snapshot, quantity, variant, subtotal)
    values (v_order_id, (v_item->>'product_id')::integer, v_item->>'product_name_snapshot', (v_item->>'product_price_snapshot')::numeric, (v_item->>'quantity')::integer, v_item->>'variant', (v_item->>'subtotal')::numeric);
  end loop;

  update public.customers
  set total_orders = total_orders + 1, total_spent = total_spent + v_total,
      last_order_at = now(), full_name = trim(p_full_name), address = trim(p_address),
      city = coalesce(nullif(trim(p_city), ''), city)
  where id = v_customer_id;

  insert into public.audit_logs (action, entity_type, entity_id, new_data)
  values ('order_created', 'order', v_order_id::text, jsonb_build_object('order_number', v_order_number, 'total', v_total, 'items', v_rows));

  return jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number, 'subtotal', v_subtotal, 'shipping_cost', v_shipping, 'discount', v_discount, 'total', v_total, 'items', v_rows);
exception when others then raise;
end;
$$;

-- ============================================================
-- 7. STORAGE
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 26214400, array['image/jpeg','image/png','image/webp','image/gif']),
  ('store-assets', 'store-assets', true, 26214400, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select
  to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects for insert
  to authenticated with check (bucket_id = 'product-images' and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.is_active));

drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects for update
  to authenticated using (bucket_id = 'product-images' and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.is_active));

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects for delete
  to authenticated using (bucket_id = 'product-images' and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.role = 'super_admin'));

drop policy if exists "public read store assets" on storage.objects;
create policy "public read store assets" on storage.objects for select
  to anon, authenticated using (bucket_id = 'store-assets');

drop policy if exists "admins manage store assets" on storage.objects;
create policy "admins manage store assets" on storage.objects for all
  to authenticated using (bucket_id = 'store-assets' and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.is_active));

-- ============================================================
-- 8. SEED DATA
-- ============================================================
insert into public.store_settings (key, value) values
  ('store_name','CUIR ELITE'),
  ('store_name_ar','كوار إيليت'),
  ('store_description','Premium Leather Jackets for Women'),
  ('store_email','contact@cuirelite.com'),
  ('store_phone','+212 600 000 000'),
  ('store_address','Casablanca, Morocco'),
  ('currency','MAD'),
  ('currency_symbol','DH'),
  ('cod_enabled','true'),
  ('cod_button_text','اطلب الآن'),
  ('cod_success_message','تم الطلب بنجاح! سنتواصل معك قريباً'),
  ('checkout_enabled','true'),
  ('maintenance_mode','false'),
  ('default_shipping_cost','20'),
  ('free_shipping_enabled','true'),
  ('free_shipping_threshold','500')
on conflict (key) do nothing;

insert into public.shipping_config (label, label_ar, method, base_cost, free_over, active)
values ('default','شحن افتراضي','fixed',20,500,true) on conflict do nothing;

insert into public.shipping_zones (config_id, city, cost, active)
select sc.id, z.city, z.cost, true
from public.shipping_config sc,
(values ('الدار البيضاء',15),('الرباط',15),('فاس',20),('مراكش',20),('طنجة',25),('أكادير',25)) as z(city, cost)
where sc.label = 'default' on conflict do nothing;

insert into public.categories (name, name_ar, slug, description, active, sort_order) values
  ('Leather Jackets','جاكيتات جلد','leather-jackets','Premium leather jackets',true,1),
  ('Blazers','بلايزر','blazers','Elegant blazers',true,2),
  ('Vests','سترات','vests','Stylish vests',true,3),
  ('Accessories','إكسسوارات','accessories','Leather accessories',true,4)
on conflict (slug) do nothing;

insert into public.products (name,name_ar,slug,description,short_description,price,compare_at_price,currency,stock_quantity,sku,category_id,status,featured,new_arrival,images,sizes,colors,material,material_ar)
select p.name,p.name_ar,p.slug,p.description,p.short_description,p.price,p.compare_at_price,'MAD',p.stock,p.sku,c.id,'active',p.featured,p.new_arrival,p.images::jsonb,p.sizes::jsonb,p.colors::jsonb,p.material,p.material_ar
from (values
  ('Classic Black Leather Jacket','جاكيت جلد أسود كلاسيكي','classic-black-leather-jacket','Timeless black leather jacket crafted from premium genuine leather.','Premium genuine leather',2499,3499,20,'CE-BLK-001',true,false,'["/images/prod-1.jpg"]','["XS","S","M","L","XL"]','[{"name":"Black","hex":"#000000"}]','Genuine Leather','جلد طبيعي'),
  ('Brown Biker Leather Jacket','جاكيت جلد بني بايكر','brown-biker-leather-jacket','Edgy brown leather biker jacket with asymmetrical zip.','Asymmetrical zip',2999,3999,20,'CE-BRN-001',true,true,'["/images/prod-2.jpg"]','["S","M","L","XL"]','[{"name":"Brown","hex":"#8B4513"}]','Genuine Leather','جلد طبيعي'),
  ('White Cropped Leather Jacket','جاكيت جلد أبيض قصير','white-cropped-leather-jacket','Stunning white cropped leather jacket.','Cropped silhouette',2299,null,20,'CE-WHT-001',false,true,'["/images/prod-3.jpg"]','["XS","S","M","L"]','[{"name":"White","hex":"#FFFFFF"}]','Genuine Leather','جلد طبيعي'),
  ('Red Leather Moto Jacket','جاكيت جلد أحمر موتو','red-leather-moto-jacket','Bold red leather motorcycle jacket with satin lining.','Satin lined',3299,4299,20,'CE-RED-001',true,false,'["/images/prod-4.jpg"]','["S","M","L"]','[{"name":"Red","hex":"#FF0000"}]','Genuine Leather','جلد طبيعي'),
  ('Beige Leather Blazer','بلايزر جلد بيج','beige-leather-blazer','Sophisticated beige leather blazer.','Leather blazer',2699,null,20,'CE-BGE-001',false,false,'["/images/prod-5.jpg"]','["XS","S","M","L","XL"]','[{"name":"Beige","hex":"#F5F5DC"}]','Genuine Leather','جلد طبيعي'),
  ('Black Leather Vest','سترة جلد سوداء','black-leather-vest','Sleek black leather vest for layering.','Layering piece',1699,2199,20,'CE-VST-001',true,false,'["/images/prod-6.jpg"]','["S","M","L"]','[{"name":"Black","hex":"#000000"}]','Genuine Leather','جلد طبيعي'),
  ('Leather Crossbody Bag','حقيبة كروس بودي جلد','leather-crossbody-bag','Elegant handcrafted leather crossbody bag.','Handcrafted',1299,1699,20,'CE-BAG-001',true,false,'["/images/prod-7.jpg"]','["One Size"]','[{"name":"Black","hex":"#000000"},{"name":"Brown","hex":"#8B4513"}]','Genuine Leather','جلد طبيعي'),
  ('Oversized Leather Trench','ترنش جلد واسع','oversized-leather-trench','Luxurious oversized leather trench coat.','Statement piece',4299,5299,20,'CE-TRN-001',false,true,'["/images/prod-8.jpg"]','["S","M","L","XL"]','[{"name":"Black","hex":"#000000"}]','Genuine Leather','جلد طبيعي')
) as p(name,name_ar,slug,description,short_description,price,compare_at_price,stock,sku,featured,new_arrival,images,sizes,colors,material,material_ar)
left join public.categories c on c.slug = 'leather-jackets'
where not exists (select 1 from public.products x where x.slug = p.slug);

insert into public.product_offers (product_id, name, name_ar, quantity, price, original_price, promo_text, promo_text_ar, active, is_default, sort_order)
select p.id, o.name, o.name_ar, o.quantity, o.price, o.original_price, o.promo_text, o.promo_text_ar, true, o.is_default, o.sort_order
from public.products p,
lateral (values
  ('Single Piece','قطعة واحدة',1, p.price, p.compare_at_price, null, null, true, 1),
  ('Two Pieces','قطعتان',2, round(p.price * 1.8,2), round(p.compare_at_price * 2, 2), 'Best Value','الأفضل قيمة', false, 2),
  ('Three Pieces','3 قطع',3, round(p.price * 2.5,2), round(p.compare_at_price * 3, 2), 'Best Deal','أفضل صفقة', false, 3)
) as o(name,name_ar,quantity,price,original_price,promo_text,promo_text_ar,is_default,sort_order)
where p.slug in ('classic-black-leather-jacket','brown-biker-leather-jacket')
  and not exists (select 1 from public.product_offers po where po.product_id = p.id and po.quantity = o.quantity);
