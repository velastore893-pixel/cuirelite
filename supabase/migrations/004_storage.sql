-- ============================================================
-- 004_storage.sql
-- Supabase Storage buckets + policies
-- product-images : public read, admin write
-- store-assets   : public read, admin write
-- ============================================================

-- Buckets (created if they do not exist)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 26214400, array['image/jpeg','image/png','image/webp','image/gif']),
  ('store-assets', 'store-assets', true, 26214400, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- product-images
-- ------------------------------------------------------------
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.is_active)
  );

drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.is_active)
  );

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.role = 'super_admin')
  );

-- ------------------------------------------------------------
-- store-assets
-- ------------------------------------------------------------
drop policy if exists "public read store assets" on storage.objects;
create policy "public read store assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'store-assets');

drop policy if exists "admins manage store assets" on storage.objects;
create policy "admins manage store assets"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'store-assets'
    and exists (select 1 from public.admin_profiles ap where ap.id = auth.uid() and ap.is_active)
  );
