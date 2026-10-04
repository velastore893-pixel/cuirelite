# CUIR ELITE — متجر جلود نسائية بالدفع عند الاستلام

منصة تجارة إلكترونية جاهزة للإنتاج، ثنائية اللغة (عربي / إنجليزي)،
للدفع عند الاستلام (COD)، مبنية بـ **Next.js (App Router)** و**Supabase**
(PostgreSQL, Auth, Storage) مع Drizzle ORM.

التصميم الحالي للمتجر وصفحة المنتج مع نموذج الطلب المباشر ولوحة التحكم
مربوطة بالكامل بقاعدة بيانات Supabase حقيقية.

---

## التقنيات

| الطبقة | التقنية |
|--------|---------|
| الإطار | Next.js 16 (App Router, React 19) |
| قاعدة البيانات | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| الاتصال | `@supabase/supabase-js` |
| المصادقة | Supabase Auth + `admin_profiles` |
| التخزين | Supabase Storage |
| التصميم | Tailwind CSS v4 |
| النشر | Vercel |

---

## البدء السريع

```bash
npm install
cp .env.example .env      # عبّئ القيم
npm run dev               # http://localhost:3000
```

---

## متغيرات البيئة

انسخ `.env.example` إلى `.env` وعبّئ القيم الحقيقية.

> ⚠️ مفتاح `SUPABASE_SERVICE_ROLE_KEY` لا يُرسل أبداً للواجهة الأمامية.

---

## قاعدة البيانات

- **السكيم الموحد:** [`supabase-schema.sql`](./supabase-schema.sql)
- **الترحيلات:** [`supabase/migrations/`](./supabase/migrations/) (شغّل 001 ← 006 بالترتيب)

```bash
supabase link --project-ref <ref>
supabase db push
```

---

## إعداد Supabase

1. أنشئ مشروع في **supabase.com**
2. انسخ **Project URL** + **anon** + **service_role**
3. شغّل الترحيلات (انظر أعلاه)
4. **التخزين:** الترحيل `004_storage.sql` ينشئ الحسابات والسياسات
5. **أول مدير:** أنشئ مستخدم في Authentication ثم أضف صف في `admin_profiles`

---

## تدفق طلب الدفع عند الاستلام

```
الزبون يضغط "اطلب الآن"
     ↓
POST /api/orders → بيانات المنتج + معلومات الزبون
     ↓
معاملة قاعدة البيانات:
  • قراءة السعر من قاعدة البيانات (لا يُثق بالسعر من الواجهة)
  • التحقق من المخزون
  • حساب الشحن والخصم والمجموع
  • إنشاء الزبون أو تحديثه
  • إنشاء الطلب وعناصره (مع لقطات الاسم والسعر)
  • تسجيل في سجل التدقيق
     ↓
رقم الطلب يظهر فوراً في لوحة التحكم
```

---

## هيكل المشروع

```
├── src/app/                  # الصفحات و API
├── src/components/store/     # مكونات المتجر
├── src/lib/supabase.ts       # كلاينت Supabase
├── src/types/database.ts     # الأنواع
├── src/db/                   # Drizzle
├── supabase-schema.sql       # السكيم الموحد
├── supabase/migrations/      # 001 ← 006
└── .env.example
```

---

## النشر على Vercel

1. ارفع المشروع إلى GitHub
2. استورد المستودع في Vercel
3. أضف متغيرات البيئة (انظر [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md))
4. اضغط **Deploy**
