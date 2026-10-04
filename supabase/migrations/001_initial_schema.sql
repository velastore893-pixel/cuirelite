-- ============================================================
-- 001_initial_schema.sql
-- Supabase PostgreSQL schema for CUIR ELITE COD e-commerce store
-- Safe to run on an existing database (uses IF NOT EXISTS)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- ADMIN USERS (Supabase Auth based)
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

create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_active_sort_idx on public.categories(active, sort_order);

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

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(featured) where featured;
create index if not exists products_name_trgm_idx on public.products using gin (to_tsvector('simple', name));

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

create index if not exists product_offers_product_idx on public.product_offers(product_id);
create index if not exists product_offers_active_idx on public.product_offers(product_id) where active;

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

create unique index if not exists customers_phone_idx on public.customers(phone);
create index if not exists customers_name_idx on public.customers(full_name);

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
  payment_method text not null default 'cod' check (payment_method in ('cod','card','paypal','transfer')),
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

create index if not exists orders_status_idx on public.orders(order_status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_phone_idx on public.orders(phone);
create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_city_idx on public.orders(city);

-- ------------------------------------------------------------
-- ORDER ITEMS (with historical snapshots)
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

create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

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

create index if not exists shipping_zones_city_idx on public.shipping_zones(city);

-- ------------------------------------------------------------
-- STORE SETTINGS (key/value)
-- ------------------------------------------------------------
create table if not exists public.store_settings (
  id serial primary key,
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- AUDIT LOG
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

create index if not exists audit_logs_admin_idx on public.audit_logs(admin_id);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

-- ------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_offers_updated_at on public.product_offers;
create trigger trg_offers_updated_at
  before update on public.product_offers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_shipping_updated_at on public.shipping_config;
create trigger trg_shipping_updated_at
  before update on public.shipping_config
  for each row execute function public.set_updated_at();
