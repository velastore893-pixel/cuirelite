# Supabase — Database Migrations

This directory contains the **canonical database migrations** for the
CUIR ELITE COD e-commerce store.

> **Rule:** there is exactly ONE database schema. It lives here, in the
> numbered migrations, and is mirrored by the consolidated
> [`supabase-schema.sql`](../supabase-schema.sql) at the project root.
> Never create alternate/conflicting schema files.

## Migrations (run in order)

| # | File | Purpose |
|---|------|---------|
| 1 | `001_initial_schema.sql` | Tables, constraints, `updated_at` triggers |
| 2 | `002_rls_policies.sql` | Helper functions + Row Level Security |
| 3 | `003_functions_and_triggers.sql` | Order/stock/shipping/dashboard functions |
| 4 | `004_storage.sql` | `product-images` + `store-assets` buckets & policies |
| 5 | `005_indexes.sql` | Search/filter/sort indexes |
| 6 | `006_seed_data.sql` | Store settings, shipping, categories, products, offers |

## Tables

- `admin_profiles` — Supabase Auth users + role (`super_admin` / `admin` / `manager`)
- `categories`, `products`, `product_offers`
- `customers`, `orders`, `order_items`
- `coupons`, `shipping_config`, `shipping_zones`
- `store_settings`, `audit_logs`

## How to run

**Option A — Supabase Dashboard (recommended for first setup)**

1. Open your project → **SQL Editor**
2. Paste each migration file in order (`001` → `006`) and press **Run**

**Option B — CLI**

```bash
supabase link --project-ref <your-ref>
supabase db push
```

**Option C — single file**

Paste the whole of `../supabase-schema.sql` into the SQL Editor and run once.
It produces the identical structure.

## Security model

| Table | anon (storefront) | authenticated (admin) |
|-------|-------------------|-----------------------|
| products / categories / offers | `SELECT` (active only) | full |
| customers / orders / order_items | `INSERT` only | read / update / delete |
| store_settings / shipping | `SELECT` | full |
| admin_profiles | none | read own / super_admin CRUD |
| audit_logs | none | insert + read |

There are **no `USING (true)` policies on any sensitive table**. Order
creation goes through `security definer` functions so the public can place
a COD order without ever being able to read customer or order data back.

## Creating the first admin

1. **Authentication → Users → Add user** → create email/password (Auto Confirm).
2. Copy the user's `uuid`.
3. In the SQL Editor:

```sql
INSERT INTO admin_profiles (id, email, full_name, role, is_active)
VALUES ('<the-uuid>', 'you@example.com', 'Your Name', 'super_admin', true);
```
