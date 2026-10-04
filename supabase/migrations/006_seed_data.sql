-- ============================================================
-- 005_seed.sql
-- Optional demo data. NO fake admin credentials are created here.
-- Admins must be created securely through Supabase Auth.
-- ============================================================

-- ------------------------------------------------------------
-- Store settings (defaults)
-- ------------------------------------------------------------
insert into public.store_settings (key, value) values
  ('store_name',        'CUIR ELITE'),
  ('store_name_ar',     'كوار إيليت'),
  ('store_description', 'Premium Leather Jackets for Women'),
  ('store_email',       'contact@cuirelite.com'),
  ('store_phone',       '+212 600 000 000'),
  ('store_address',     'Casablanca, Morocco'),
  ('currency',          'MAD'),
  ('currency_symbol',   'DH'),
  ('cod_enabled',       'true'),
  ('cod_button_text',   'اطلب الآن'),
  ('cod_success_message','تم الطلب بنجاح! سنتواصل معك قريباً'),
  ('checkout_enabled',  'true'),
  ('maintenance_mode',  'false'),
  ('default_shipping_cost', '20'),
  ('free_shipping_enabled', 'true'),
  ('free_shipping_threshold', '500')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- Shipping configuration
-- ------------------------------------------------------------
insert into public.shipping_config (label, label_ar, method, base_cost, free_over, active)
values ('default', 'شحن افتراضي', 'fixed', 20, 500, true)
on conflict do nothing;

insert into public.shipping_zones (config_id, city, cost, active)
select sc.id, z.city, z.cost, true
from public.shipping_config sc,
(values ('الدار البيضاء',15),('الرباط',15),('فاس',20),('مراكش',20),('طنجة',25),('أكادير',25)) as z(city, cost)
where sc.label = 'default'
on conflict do nothing;

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
insert into public.categories (name, name_ar, slug, description, active, sort_order)
values
  ('Leather Jackets', 'جاكيتات جلد', 'leather-jackets', 'Premium leather jackets', true, 1),
  ('Blazers', 'بلايزر', 'blazers', 'Elegant blazers', true, 2),
  ('Vests', 'سترات', 'vests', 'Stylish vests', true, 3),
  ('Accessories', 'إكسسوارات', 'accessories', 'Leather accessories', true, 4)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Products
-- ------------------------------------------------------------
insert into public.products (name, name_ar, slug, description, short_description, price, compare_at_price, currency, stock_quantity, sku, category_id, status, featured, new_arrival, images, sizes, colors, material, material_ar)
select
  p.name, p.name_ar, p.slug, p.description, p.short_description, p.price, p.compare_at_price,
  'MAD', p.stock, p.sku, c.id, 'active', p.featured, p.new_arrival, p.images, p.sizes, p.colors, p.material, p.material_ar
from (values
  ('Classic Black Leather Jacket','جاكيت جلد أسود كلاسيكي','classic-black-leather-jacket','Timeless black leather jacket crafted from premium genuine leather.','Premium genuine leather',2499,3499,'CE-BLK-001',true,false,'["/images/prod-1.jpg"]','["XS","S","M","L","XL"]','[{"name":"Black","hex":"#000000"}]','Genuine Leather','جلد طبيعي'),
  ('Brown Biker Leather Jacket','جاكيت جلد بني بايكر','brown-biker-leather-jacket','Edgy brown leather biker jacket with asymmetrical zip.','Asymmetrical zip',2999,3999,'CE-BRN-001',true,true,'["/images/prod-2.jpg"]','["S","M","L","XL"]','[{"name":"Brown","hex":"#8B4513"}]','Genuine Leather','جلد طبيعي'),
  ('White Cropped Leather Jacket','جاكيت جلد أبيض قصير','white-cropped-leather-jacket','Stunning white cropped leather jacket.','Cropped silhouette',2299,null,'CE-WHT-001',false,true,'["/images/prod-3.jpg"]','["XS","S","M","L"]','[{"name":"White","hex":"#FFFFFF"}]','Genuine Leather','جلد طبيعي'),
  ('Red Leather Moto Jacket','جاكيت جلد أحمر موتو','red-leather-moto-jacket','Bold red leather motorcycle jacket with satin lining.','Satin lined',3299,4299,'CE-RED-001',true,false,'["/images/prod-4.jpg"]','["S","M","L"]','[{"name":"Red","hex":"#FF0000"}]','Genuine Leather','جلد طبيعي'),
  ('Beige Leather Blazer','بلايزر جلد بيج','beige-leather-blazer','Sophisticated beige leather blazer.','Leather blazer',2699,null,'CE-BGE-001',false,false,'["/images/prod-5.jpg"]','["XS","S","M","L","XL"]','[{"name":"Beige","hex":"#F5F5DC"}]','Genuine Leather','جلد طبيعي'),
  ('Black Leather Vest','سترة جلد سوداء','black-leather-vest','Sleek black leather vest for layering.','Layering piece',1699,2199,'CE-VST-001',true,false,'["/images/prod-6.jpg"]','["S","M","L"]','[{"name":"Black","hex":"#000000"}]','Genuine Leather','جلد طبيعي'),
  ('Leather Crossbody Bag','حقيبة كروس بودي جلد','leather-crossbody-bag','Elegant handcrafted leather crossbody bag.','Handcrafted',1299,1699,'CE-BAG-001',true,false,'["/images/prod-7.jpg"]','["One Size"]','[{"name":"Black","hex":"#000000"},{"name":"Brown","hex":"#8B4513"}]','Genuine Leather','جلد طبيعي'),
  ('Oversized Leather Trench','ترنش جلد واسع','oversized-leather-trench','Luxurious oversized leather trench coat.','Statement piece',4299,5299,'CE-TRN-001',false,true,'["/images/prod-8.jpg"]','["S","M","L","XL"]','[{"name":"Black","hex":"#000000"}]','Genuine Leather','جلد طبيعي')
) as p(name,name_ar,slug,description,short_description,price,compare_at_price,stock,sku,featured,new_arrival,images,sizes,colors,material,material_ar)
left join public.categories c on c.slug = 'leather-jackets'
where not exists (select 1 from public.products x where x.slug = p.slug);

-- ------------------------------------------------------------
-- Product offers (buy 1 / buy 2 / buy 3 bundles)
-- ------------------------------------------------------------
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
