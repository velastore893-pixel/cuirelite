# Deployment Guide — Vercel + Supabase

Step-by-step guide to deploy the CUIR ELITE COD store to production.

---

## 1. Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**.
2. Choose a region close to your customers (e.g. `eu-central-1`).
3. Wait for the project to finish provisioning.
4. Open **Project Settings → API** and copy:
   - `Project URL`
   - `anon` public key
   - `service_role` secret key  ⚠️ **server-only, never commit**

---

## 2. Run the database migrations

**Option A — Supabase SQL Editor (easiest)**

Open **SQL Editor** and run each file in order, one at a time:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_functions_and_triggers.sql
supabase/migrations/004_storage.sql
supabase/migrations/005_indexes.sql
supabase/migrations/006_seed_data.sql
```

**Option B — CLI**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option C — single consolidated file**

Paste the entire `supabase-schema.sql` at the project root into the SQL
Editor and run it once. It produces the identical structure.

---

## 3. Create the first admin (securely)

1. Supabase Dashboard → **Authentication → Users → Add user**.
2. Enter email + password → **Auto Confirm**.
3. Copy the user's `uuid`.
4. Run in the SQL Editor:

```sql
INSERT INTO admin_profiles (id, email, full_name, role, is_active)
VALUES (
  '<paste-uuid-here>',
  'you@example.com',
  'Your Name',
  'super_admin',
  true
);
```

The first admin should always be `super_admin`. Additional staff can be
created with the role `admin` or `manager`.

---

## 4. Environment variables

### Local `.env`

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

Get `DATABASE_URL` from **Project Settings → Database → Connection string**.

### Vercel

Project → **Settings → Environment Variables** → add each variable to
**Production**, **Preview** and **Development**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Supabase connection string (pooled or direct) |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server only) |

> Vercel reads `NEXT_PUBLIC_*` at build time — set them **before** deploying.

---

## 5. Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel: **Add New → Import Git Repository**.
3. Vercel auto-detects **Next.js** (see `vercel.json`).
4. Confirm the build settings:
   - Framework: `Next.js`
   - Build Command: `npm run build`
   - Install Command: `npm install`
5. Add the environment variables (section 4).
6. Click **Deploy**.

After deployment:

- Storefront: `https://your-app.vercel.app`
- Admin: `https://your-app.vercel.app/admin`
- Health check: `https://your-app.vercel.app/api/health`

---

## 6. Storage (product images)

The `004_storage.sql` migration creates two buckets with policies:

| Bucket | Access |
|--------|--------|
| `product-images` | public read, admin upload/update/delete |
| `store-assets` | public read, admin manage |

To use them from the admin dashboard, upload via the Supabase Storage API
using the **anon** key (public buckets) or the **service_role** key
(server-side admin upload).

---

## 7. Verify the deployment

```bash
# health
curl https://your-app.vercel.app/api/health

# storefront
curl -I https://your-app.vercel.app/

# admin (should require login)
curl -I https://your-app.vercel.app/admin
```

Manual checks:

1. ✅ Storefront loads and shows seeded products
2. ✅ Product page shows the COD order form
3. ✅ Submitting an order returns an order number
4. ✅ The order appears in `/admin/orders`
5. ✅ Stock decreased for the ordered product
6. ✅ `/admin/login` accepts the Supabase credentials
7. ✅ Store settings edited in admin appear on the storefront

---

## 8. Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `DATABASE_URL is required` | env var missing | add it in Vercel settings |
| `relation does not exist` | migrations not run | run 001 → 006 in order |
| `invalid login credentials` | wrong password | reset via Supabase Auth |
| `new row violates RLS` | admin_profiles row missing | insert the admin row |
| Images not loading | bucket missing | run `004_storage.sql` |
| Stock not decreasing | function missing | run `003_functions_and_triggers.sql` |
