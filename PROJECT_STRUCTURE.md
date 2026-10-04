# Project Structure

CUIR ELITE — COD e-commerce store (Next.js App Router + Supabase).

```
/
├── README.md                      # English overview
├── README_AR.md                   # Arabic overview
├── DEPLOYMENT_GUIDE.md            # Vercel + Supabase deployment
├── SUPABASE_INTEGRATION_GUIDE.md  # How Supabase is integrated
├── IMPLEMENTATION_SUMMARY.md      # What was built & verified
├── PROJECT_STRUCTURE.md           # This file
├── supabase-schema.sql            # CANONICAL consolidated schema
│
├── .env.example                   # Environment variable placeholders
├── vercel.json                    # Vercel deployment config
├── package.json
├── tsconfig.json
├── next.config.ts
├── drizzle.config.json
│
├── supabase/
│   ├── README.md                  # Migration + security model docs
│   └── migrations/
│       ├── 001_initial_schema.sql            # Tables, constraints, triggers
│       ├── 002_rls_policies.sql              # RLS helper + policies
│       ├── 003_functions_and_triggers.sql    # Order/stock/shipping functions
│       ├── 004_storage.sql                   # Storage buckets + policies
│       ├── 005_indexes.sql                   # Search/filter indexes
│       └── 006_seed_data.sql                 # Settings, products, offers
│
├── public/                        # Static assets (images)
│   ├── images/
│   └── uploads/
│
└── src/
    ├── app/                       # Next.js App Router
    │   ├── layout.tsx             # Root layout (RTL, fonts)
    │   ├── page.tsx               # Storefront homepage
    │   ├── client-page.tsx        # Homepage client component
    │   ├── checkout/page.tsx      # Checkout page
    │   ├── about/page.tsx         # About page
    │   ├── products/
    │   │   ├── page.tsx           # Product listing
    │   │   ├── products-client.tsx
    │   │   └── [slug]/
    │   │       ├── page.tsx       # Product detail (SSR)
    │   │       └── product-detail-client.tsx  # COD order form
    │   ├── admin/
    │   │   ├── layout.tsx         # Admin layout (RTL sidebar)
    │   │   ├── page.tsx           # Dashboard
    │   │   ├── dashboard-client.tsx
    │   │   ├── login/page.tsx     # Admin login
    │   │   ├── account/page.tsx   # Account settings
    │   │   ├── products/          # Product management
    │   │   ├── orders/            # Order management
    │   │   ├── categories/        # Category management
    │   │   ├── slides/            # Hero slider management
    │   │   ├── offers/            # Offers management
    │   │   ├── product-offers/    # Product-level offers
    │   │   ├── product-page/      # Product page settings
    │   │   ├── customers/         # Customer management
    │   │   ├── coupons/           # Coupons management
    │   │   ├── analytics/         # Analytics dashboard
    │   │   ├── settings/          # Store settings
    │   │   ├── google-sheets/     # Google Sheets integration
    │   │   ├── testimonials/      # Testimonials management
    │   │   └── vercel/            # Deployment info page
    │   └── api/                   # API routes
    │       ├── health/route.ts
    │       ├── settings/route.ts
    │       ├── orders/route.ts    # Secure COD order creation
    │       ├── offers/route.ts
    │       ├── upload/route.ts    # Image upload (base64 → DB)
    │       ├── uploads/[filename]/route.ts
    │       ├── testimonials/route.ts
    │       ├── sheets/route.ts
    │       ├── validate-coupon/route.ts
    │       ├── auth/
    │       │   ├── supabase-login/route.ts   # Supabase Auth login
    │       │   ├── change-password/route.ts
    │       │   └── logout/route.ts
    │       └── admin/             # Admin-only API routes
    │           ├── analytics/route.ts
    │           ├── banners/route.ts
    │           ├── categories/route.ts
    │           ├── coupons/route.ts
    │           ├── customers/route.ts
    │           ├── offers/route.ts
    │           ├── orders/route.ts
    │           ├── pages/route.ts
    │           ├── product-offers/route.ts
    │           ├── product-page-settings/route.ts
    │           ├── products/route.ts
    │           ├── settings/route.ts
    │           ├── slides/route.ts
    │           └── testimonials/route.ts
    │
    ├── components/
    │   └── store/                 # Storefront components
    │       ├── Navbar.tsx         # Header + 4-click admin access
    │       ├── HeroSection.tsx    # Hero slider
    │       ├── ProductCard.tsx
    │       ├── CategoryCard.tsx
    │       ├── CartSidebar.tsx
    │       ├── FeaturesSection.tsx
    │       ├── TestimonialSection.tsx
    │       ├── Footer.tsx
    │       ├── TrackingPixels.tsx
    │       └── AdminSidebar.tsx
    │
    ├── lib/
    │   ├── supabase.ts            # Supabase client (anon + service role)
    │   ├── store-context.tsx      # Cart + settings context
    │   └── google-sheets.ts       # Google Sheets sync
    │
    ├── types/
    │   └── database.ts            # TypeScript types matching SQL schema
    │
    └── db/
        ├── index.ts               # Drizzle client
        ├── schema.ts              # Drizzle schema (mirrors SQL)
        └── seed.ts                # Local dev seed
```

## Key conventions

- **Canonical DB schema:** `supabase-schema.sql` (mirrors the migrations —
  never create alternate schema files)
- **Currency:** prices are stored as `numeric(10,2)` in `MAD`
- **Orders:** `order_items` stores `product_name_snapshot` and
  `product_price_snapshot` so historical orders never change
- **Settings:** `store_settings` is a key/value table; storefront reads it
  through `/api/settings`
- **Uploads:** images are stored as base64 in `uploaded_files` and served
  through `/api/uploads/[filename]`
- **Admin access:** `/admin/login` (Supabase Auth) — also reachable by
  clicking the store logo 4 times
