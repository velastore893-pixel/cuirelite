# CUIR ELITE — Premium Leather COD E-Commerce Store

A production-ready, bilingual (Arabic / English) **Cash-on-Delivery**
e-commerce platform built with **Next.js (App Router)** + **Supabase**
(PostgreSQL, Auth, Storage) and Drizzle ORM.

The storefront design, the product page with its direct COD order form, and
the full admin dashboard are all connected to a real Supabase backend.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, React 19) |
| Database | Supabase PostgreSQL |
| ORM (server routes) | Drizzle ORM |
| Backend client | `@supabase/supabase-js` |
| Auth | Supabase Auth + `admin_profiles` roles |
| Storage | Supabase Storage (`product-images`, `store-assets`) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

---

## Quick start

```bash
npm install
cp .env.example .env      # fill in your values
npm run dev               # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

---

## Environment variables

Copy `.env.example` → `.env` and fill in real values.

| Variable | Where | Required |
|----------|-------|----------|
| `DATABASE_URL` | server | ✅ (Drizzle, points at Supabase Postgres) |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | ✅ (never expose) |
| `GOOGLE_SHEETS_*` | server | optional |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` must never be committed or sent to the browser.

---

## Database

- **Canonical schema:** [`supabase-schema.sql`](./supabase-schema.sql)
- **Migrations:** [`supabase/migrations/`](./supabase/migrations/) (run 001 → 006 in order)
- **Guide:** [`supabase/README.md`](./supabase/README.md)

```bash
# via Supabase SQL Editor: paste 001 → 006 in order
# via CLI:
supabase link --project-ref <ref>
supabase db push
```

**Tables:** `admin_profiles`, `categories`, `products`, `product_offers`,
`customers`, `orders`, `order_items`, `coupons`, `shipping_config`,
`shipping_zones`, `store_settings`, `audit_logs`.

---

## Supabase setup

1. Create a project at **supabase.com**.
2. Copy the **Project URL** + **anon** + **service_role** keys.
3. Run the migrations (see above).
4. **Storage:** the `004_storage.sql` migration creates the
   `product-images` and `store-assets` buckets with their policies.
5. **First admin:** Authentication → Users → Add user, then insert a row
   into `admin_profiles` with that user's `uuid`
   (see [`supabase/README.md`](./supabase/README.md)).

---

## Cod order flow (security)

```
Customer clicks "اطلب الآن" on the product page
        ↓
POST /api/orders  →  { productId, quantity, customer info }
        ↓
BEGIN TRANSACTION
  • SELECT ... FOR UPDATE on the product      (prevents race conditions)
  • price is read from the DATABASE           (never trusted from client)
  • stock is validated                        (rejects if insufficient)
  • stock_quantity -= quantity
  • subtotal + shipping − discount = total    (server-side)
  • find-or-create customer by phone
  • INSERT orders + order_items (name/price snapshots)
  • INSERT audit_logs
COMMIT
        ↓
order_number returned → confirmation message → order visible in Admin
```

---

## Project structure

```
├── src/
│   ├── app/                  # App Router pages + API routes
│   ├── components/store/     # Storefront components
│   ├── lib/supabase.ts       # Supabase client (browser + server)
│   ├── types/database.ts     # Types matching the SQL schema
│   └── db/                   # Drizzle schema + seed
├── supabase-schema.sql       # Canonical consolidated schema
├── supabase/migrations/      # 001 → 006
├── .env.example
└── vercel.json
```

Full tree: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## Documentation

| File | Content |
|------|---------|
| [README_AR.md](./README_AR.md) | النسخة العربية |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Vercel + Supabase deployment |
| [SUPABASE_INTEGRATION_GUIDE.md](./SUPABASE_INTEGRATION_GUIDE.md) | Full Supabase integration |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | What was built & verified |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | File tree |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
