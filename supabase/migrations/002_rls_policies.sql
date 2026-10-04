-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security for every table
-- Public users: read-only storefront data + create orders
-- Admins: full access via Supabase Auth + admin_profiles role
-- ============================================================

-- Helper: is the current user an active admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.is_active = true
  );
$$;

-- Helper: admin role in ('super_admin','admin')
create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.is_active = true
      and ap.role in ('super_admin','admin','manager')
  );
$$;

-- ============================================================
-- Enable RLS on every table
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
alter table public.audit_logs enable row level security;

-- ============================================================
-- admin_profiles
-- ============================================================
drop policy if exists "admins read own profile" on public.admin_profiles;
create policy "admins read own profile"
  on public.admin_profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "super admins manage profiles" on public.admin_profiles;
create policy "super admins manage profiles"
  on public.admin_profiles for all
  to authenticated
  using (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.role = 'super_admin' and ap.is_active
    )
  )
  with check (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.role = 'super_admin' and ap.is_active
    )
  );

-- ============================================================
-- categories (public read, admin write)
-- ============================================================
drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select
  to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- products (public read active, admin full)
-- ============================================================
drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select
  to anon, authenticated
  using (status = 'active' or public.is_admin());

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- product_offers (public read active, admin full)
-- ============================================================
drop policy if exists "public read offers" on public.product_offers;
create policy "public read offers"
  on public.product_offers for select
  to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists "admins manage offers" on public.product_offers;
create policy "admins manage offers"
  on public.product_offers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- customers
-- Public: INSERT only (used by the checkout function, not directly)
-- Admin: full
-- Public users must NEVER read customer data
-- ============================================================
drop policy if exists "public create customers" on public.customers;
create policy "public create customers"
  on public.customers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins read customers" on public.customers;
create policy "admins read customers"
  on public.customers for select
  to authenticated
  using (public.is_admin_or_manager());

drop policy if exists "admins update customers" on public.customers;
create policy "admins update customers"
  on public.customers for update
  to authenticated
  using (public.is_admin_or_manager())
  with check (public.is_admin_or_manager());

drop policy if exists "admins delete customers" on public.customers;
create policy "admins delete customers"
  on public.customers for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- orders
-- Public: INSERT only (via the security definer function)
-- Admin: full
-- Public users must NEVER read order data
-- ============================================================
drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders"
  on public.orders for select
  to authenticated
  using (public.is_admin_or_manager());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin_or_manager())
  with check (public.is_admin_or_manager());

drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- order_items
-- ============================================================
drop policy if exists "public insert order_items" on public.order_items;
create policy "public insert order_items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins read order_items" on public.order_items;
create policy "admins read order_items"
  on public.order_items for select
  to authenticated
  using (public.is_admin_or_manager());

drop policy if exists "admins delete order_items" on public.order_items;
create policy "admins delete order_items"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- shipping_config (public read active, admin full)
-- ============================================================
drop policy if exists "public read shipping" on public.shipping_config;
create policy "public read shipping"
  on public.shipping_config for select
  to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists "admins manage shipping" on public.shipping_config;
create policy "admins manage shipping"
  on public.shipping_config for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public read shipping zones" on public.shipping_zones;
create policy "public read shipping zones"
  on public.shipping_zones for select
  to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists "admins manage shipping zones" on public.shipping_zones;
create policy "admins manage shipping zones"
  on public.shipping_zones for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- store_settings
-- Public can read (needed for storefront), admin can write
-- ============================================================
drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admins manage settings" on public.store_settings;
create policy "admins manage settings"
  on public.store_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- audit_logs
-- Only admins can read/write. Never exposed publicly.
-- ============================================================
drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "admins read audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins insert audit logs" on public.audit_logs;
create policy "admins insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_admin());
