-- ============================================================
-- 005_indexes.sql
-- Performance indexes for search, filtering, sorting and joins.
-- Most core indexes already live in 001_initial_schema.sql;
-- this file adds the remaining ones required by the admin
-- dashboard (search / filter / pagination).
-- ============================================================

-- ------------------------------------------------------------
-- PRODUCTS: search + filter + sort
-- ------------------------------------------------------------
-- Partial index: only active products are shown on the storefront
create index if not exists products_active_created_idx
  on public.products (created_at desc)
  where status = 'active';

-- Featured / new-arrival merchandising filters
create index if not exists products_featured_status_idx
  on public.products (status, featured)
  where status = 'active';

create index if not exists products_new_arrival_status_idx
  on public.products (status, new_arrival)
  where status = 'active';

-- Price sorting / filtering
create index if not exists products_price_idx on public.products (price);

-- Stock monitoring (low-stock dashboard widget)
create index if not exists products_low_stock_idx
  on public.products (stock_quantity)
  where status = 'active' and stock_quantity <= 10;

-- Trigram search support (requires pg_trgm)
create extension if not exists pg_trgm;
create index if not exists products_name_trgm_idx
  on public.products using gin (name gin_trgm_ops);
create index if not exists products_name_ar_trgm_idx
  on public.products using gin (name_ar gin_trgm_ops);

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
create index if not exists categories_active_idx
  on public.categories (active, sort_order);

-- ------------------------------------------------------------
-- ORDERS: admin dashboard queries
-- ------------------------------------------------------------
-- Status filtering (the most common admin filter)
create index if not exists orders_status_created_idx
  on public.orders (order_status, created_at desc);

-- Confirmation queue
create index if not exists orders_confirmation_idx
  on public.orders (confirmation_status)
  where confirmation_status = 'pending';

-- City-based filtering
create index if not exists orders_city_created_idx
  on public.orders (city, created_at desc);

-- Customer history lookups
create index if not exists orders_customer_created_idx
  on public.orders (customer_id, created_at desc);

-- Order number lookup (already unique, but keeps the planner happy)
create index if not exists orders_order_number_idx on public.orders (order_number);

-- ------------------------------------------------------------
-- ORDER ITEMS: best-seller aggregation
-- ------------------------------------------------------------
create index if not exists order_items_product_qty_idx
  on public.order_items (product_id, quantity);

-- ------------------------------------------------------------
-- CUSTOMERS: admin search
-- ------------------------------------------------------------
create index if not exists customers_phone_idx on public.customers (phone);
create index if not exists customers_name_idx on public.customers using gin (full_name gin_trgm_ops);
create index if not exists customers_city_idx on public.customers (city);

-- ------------------------------------------------------------
-- COUPONS: validation lookups
-- ------------------------------------------------------------
create index if not exists coupons_code_active_idx
  on public.coupons (code)
  where is_active;

-- ------------------------------------------------------------
-- PRODUCT OFFERS: storefront + admin
-- ------------------------------------------------------------
create index if not exists product_offers_active_idx
  on public.product_offers (product_id, sort_order)
  where active;

-- ------------------------------------------------------------
-- AUDIT LOGS: admin timeline
-- ------------------------------------------------------------
create index if not exists audit_logs_action_created_idx
  on public.audit_logs (action, created_at desc);
