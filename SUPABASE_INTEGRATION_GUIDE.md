# Supabase Integration Guide

How the CUIR ELITE COD store is integrated with Supabase — real backend
functionality, not mock data.

---

## Architecture

```
┌───────────────────────────────────────────────┐
│  Next.js (App Router)                         │
│  ┌─────────────┐  ┌────────────────────────┐  │
│  │ Storefront  │  │ Admin Dashboard        │  │
│  │ /products   │  │ /admin/*               │  │
│  └──────┬──────┘  └───────────┬────────────┘  │
│         │  /api/* routes (Drizzle + SQL)      │
│         └──────────┬───────────┘              │
└────────────────────┼──────────────────────────┘
                     ▼
        Supabase PostgreSQL
        ├── RLS policies
        ├── security definer functions
        └── Storage buckets
```

- **Storefront reads** products/categories/offers/settings via RLS `SELECT`
  (active rows only).
- **Orders are created** through `POST /api/orders`, which uses `SELECT ...
  FOR UPDATE` transactions — prices always come from the database.
- **Admin access** requires Supabase Auth + a row in `admin_profiles`.

---

## Files

| File | Role |
|------|------|
| `src/lib/supabase.ts` | Browser client (anon key) + server client (service role) |
| `src/types/database.ts` | TypeScript types matching the SQL schema |
| `supabase/migrations/*` | The canonical schema |
| `src/app/api/auth/supabase-login/route.ts` | Admin sign-in via Supabase Auth |
| `src/app/api/orders/route.ts` | Secure COD order creation |
| `src/app/api/settings/route.ts` | Store settings (public read) |

---

## Supabase client

```ts
// Browser (anon key — safe to expose)
import { supabase } from "@/lib/supabase";

// Server only (service_role — NEVER ship to the browser)
import { createSupabaseClient } from "@/lib/supabase";
```

Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL      → browser + server
NEXT_PUBLIC_SUPABASE_ANON_KEY → browser + server
SUPABASE_SERVICE_ROLE_KEY     → server only
```

---

## Admin authentication

1. **Login page:** `/admin/login`
2. POST `/api/auth/supabase-login` → `auth.signInWithPassword()`
3. Server verifies the user exists in `admin_profiles` and `is_active = true`
4. An **HttpOnly cookie** (`admin_token`) is set — the Supabase token is
   stored server-side, not in `localStorage`
5. The admin layout checks the cookie on every route

Roles:

| Role | Permissions |
|------|-------------|
| `super_admin` | everything, including admin_profiles + storage delete |
| `admin` | products, orders, customers, settings, offers |
| `manager` | read orders/customers + update order status |

---

## COD order flow (what the server does)

`POST /api/orders` accepts only:

```json
{
  "customerName": "...", "customerPhone": "...",
  "shippingAddress": "...", "city": "...",
  "items": [{ "productId": 1, "quantity": 2 }],
  "offerId": null,
  "couponCode": null
}
```

The server then:

1. Validates name/phone/address/city
2. `BEGIN` transaction
3. `SELECT ... FOR UPDATE` on each product → **reads the real price**
4. Validates `stock_quantity >= quantity`
5. Decrements stock
6. Reads shipping config from `store_settings`
7. Validates the coupon (if any)
8. `total = subtotal + shipping − discount`
9. Finds or creates the customer by phone
10. Inserts the order + `order_items` (name & price snapshots)
11. Writes an `audit_logs` entry
12. `COMMIT`
13. Returns `{ orderNumber, total, ... }`

Prices and totals are **never** taken from the client.

---

## Stock management

- Stock is validated with `SELECT ... FOR UPDATE` → no race conditions
- Insufficient stock → `ROLLBACK` + friendly Arabic error message
- `public.restore_stock_for_order(order_id)` restores stock when an order is
  cancelled or returned
- The admin dashboard reads `admin_dashboard_stats()` for live numbers

---

## RLS summary

| Table | Public | Admin |
|-------|--------|-------|
| products / categories / offers | SELECT active | CRUD |
| customers / orders / order_items | INSERT only | read / update / delete |
| store_settings / shipping | SELECT | CRUD |
| admin_profiles | — | read own / super_admin CRUD |
| audit_logs | — | insert + read |

No sensitive table has `USING (true)` for public write access.

---

## Storage

Buckets created by `004_storage.sql`:

- `product-images` — public read, admin upload/update/delete
- `store-assets` — public read, admin manage

Image upload from the admin uses `/api/upload` (server-side), which stores
the file and returns a URL that the storefront can render.

---

## Migrations

Run in order (or paste `supabase-schema.sql` once):

```
001_initial_schema.sql
002_rls_policies.sql
003_functions_and_triggers.sql
004_storage.sql
005_indexes.sql
006_seed_data.sql
```

See [`supabase/README.md`](./supabase/README.md) for details.
