import { db } from "./index";
import { categories, products, storeSettings, heroSlides } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.execute(`TRUNCATE TABLE hero_slides, products, categories, store_settings RESTART IDENTITY CASCADE`);

  // Insert categories
  const insertedCategories = await db
    .insert(categories)
    .values([
      {
        name: "Leather Jackets",
        nameAr: "جاكيتات جلد",
        slug: "leather-jackets",
        description: "Premium leather jackets for women",
        image: "/images/cat-jackets.jpg",
        isActive: true,
      },
      {
        name: "Blazers",
        nameAr: "بلايزر",
        slug: "blazers",
        description: "Elegant blazers for women",
        image: "/images/cat-blazers.jpg",
        isActive: true,
      },
      {
        name: "Vests",
        nameAr: "سترات",
        slug: "vests",
        description: "Stylish vests for women",
        image: "/images/cat-vests.jpg",
        isActive: true,
      },
      {
        name: "Accessories",
        nameAr: "إكسسوارات",
        slug: "accessories",
        description: "Leather accessories",
        image: "/images/cat-accessories.jpg",
        isActive: true,
      },
    ])
    .returning();

  console.log(`✅ Inserted ${insertedCategories.length} categories`);

  // Insert products
  const insertedProducts = await db
    .insert(products)
    .values([
      {
        name: "Classic Black Leather Jacket",
        nameAr: "جاكيت جلد أسود كلاسيكي",
        slug: "classic-black-leather-jacket",
        description: "Timeless black leather jacket crafted from premium genuine leather. Features a classic cut with zip closure and multiple pockets.",
        descriptionAr: "جاكيت جلد أسود خالد مصنوع من الجلد الطبيعي الفاخر. يتميز بقصة كلاسيكية مع سحاب وإغلاق وجيوب متعددة.",
        price: "299.99",
        comparePrice: "399.99",
        categoryId: insertedCategories[0].id,
        images: ["/images/prod-1.jpg", "/images/prod-1b.jpg"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Black", hex: "#000000" },
          { name: "Dark Brown", hex: "#3C1414" },
        ],
        stock: 25,
        isActive: true,
        isFeatured: true,
        isNewArrival: false,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
      {
        name: "Brown Biker Leather Jacket",
        nameAr: "جاكيت جلد بني بايكر",
        slug: "brown-biker-leather-jacket",
        description: "Edgy brown leather biker jacket with asymmetrical zip and quilted shoulder panels. Perfect for the modern woman.",
        descriptionAr: "جاكيت جلد بني حاد مع سحاب غير متماثل وألواح كتف مخيوطة. مثالي للمرأة العصرية.",
        price: "349.99",
        comparePrice: "449.99",
        categoryId: insertedCategories[0].id,
        images: ["/images/prod-2.jpg", "/images/prod-2b.jpg"],
        sizes: ["S", "M", "L", "XL"],
        colors: [
          { name: "Brown", hex: "#8B4513" },
          { name: "Black", hex: "#000000" },
        ],
        stock: 15,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
      {
        name: "White Cropped Leather Jacket",
        nameAr: "جاكيت جلد أبيض قصير",
        slug: "white-cropped-leather-jacket",
        description: "Stunning white cropped leather jacket. A modern twist on the classic leather jacket with a cropped silhouette.",
        descriptionAr: "جاكيت جلد أبيض مذهل. لمسة عصرية على الجاكيت الكلاسيكي مع محيط قصير.",
        price: "279.99",
        comparePrice: null,
        categoryId: insertedCategories[0].id,
        images: ["/images/prod-3.jpg"],
        sizes: ["XS", "S", "M", "L"],
        colors: [
          { name: "White", hex: "#FFFFFF" },
          { name: "Cream", hex: "#FFFDD0" },
        ],
        stock: 10,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
      {
        name: "Red Leather Moto Jacket",
        nameAr: "جاكيت جلد أحمر موتو",
        slug: "red-leather-moto-jacket",
        description: "Bold red leather motorcycle jacket that makes a statement. Premium quality with satin lining.",
        descriptionAr: "جاكيت جلد أحمر جريء يلفت الأنظار. جودة فاخرة مع بطانة ساتان.",
        price: "389.99",
        comparePrice: "499.99",
        categoryId: insertedCategories[0].id,
        images: ["/images/prod-4.jpg"],
        sizes: ["S", "M", "L"],
        colors: [
          { name: "Red", hex: "#FF0000" },
          { name: "Burgundy", hex: "#800020" },
        ],
        stock: 8,
        isActive: true,
        isFeatured: false,
        isNewArrival: true,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
      {
        name: "Beige Leather Blazer",
        nameAr: "بلايزر جلد بيج",
        slug: "beige-leather-blazer",
        description: "Sophisticated beige leather blazer. Combines the elegance of a blazer with the luxury of leather.",
        descriptionAr: "بلايزر جلد بيج راقي. يجمع بين أناقة البلايزر وفخامة الجلد.",
        price: "319.99",
        comparePrice: null,
        categoryId: insertedCategories[1].id,
        images: ["/images/prod-5.jpg"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Beige", hex: "#F5F5DC" },
          { name: "Tan", hex: "#D2B48C" },
        ],
        stock: 20,
        isActive: true,
        isFeatured: true,
        isNewArrival: false,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
      {
        name: "Black Leather Vest",
        nameAr: "سترة جلد سوداء",
        slug: "black-leather-vest",
        description: "Sleek black leather vest. Perfect layering piece for any outfit.",
        descriptionAr: "سترة جلد سوداء أنيقة. قطعة طبقة مثالية لأي ملابس.",
        price: "199.99",
        comparePrice: "249.99",
        categoryId: insertedCategories[2].id,
        images: ["/images/prod-6.jpg"],
        sizes: ["S", "M", "L"],
        colors: [
          { name: "Black", hex: "#000000" },
        ],
        stock: 30,
        isActive: true,
        isFeatured: false,
        isNewArrival: false,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
      {
        name: "Leather Crossbody Bag",
        nameAr: "حقيبة كروس بودي جلد",
        slug: "leather-crossbody-bag",
        description: "Elegant leather crossbody bag. Handcrafted with attention to detail.",
        descriptionAr: "حقيبة كروس بودي جلد أنيقة. مصنوعة يدوياً باهتمام بالتفاصيل.",
        price: "149.99",
        comparePrice: "199.99",
        categoryId: insertedCategories[3].id,
        images: ["/images/prod-7.jpg"],
        sizes: ["One Size"],
        colors: [
          { name: "Black", hex: "#000000" },
          { name: "Brown", hex: "#8B4513" },
        ],
        stock: 40,
        isActive: true,
        isFeatured: true,
        isNewArrival: false,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
      {
        name: "Oversized Leather Trench",
        nameAr: "ترنش جلد واسع",
        slug: "oversized-leather-trench",
        description: "Luxurious oversized leather trench coat. A statement piece for the fashion-forward woman.",
        descriptionAr: "معطف ترنش جلد واسع فاخر. قطعة مميزة للمرأة العصرية المحبة للأزياء.",
        price: "499.99",
        comparePrice: "599.99",
        categoryId: insertedCategories[0].id,
        images: ["/images/prod-8.jpg"],
        sizes: ["S", "M", "L", "XL"],
        colors: [
          { name: "Black", hex: "#000000" },
          { name: "Camel", hex: "#C19A6B" },
        ],
        stock: 5,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        material: "Genuine Leather",
        materialAr: "جلد طبيعي",
      },
    ])
    .returning();

  console.log(`✅ Inserted ${insertedProducts.length} products`);

  // Insert store settings
  await db.insert(storeSettings).values([
    { key: "store_name", value: "CUIR ELITE" },
    { key: "store_name_ar", value: "كوار إيليت" },
    { key: "store_description", value: "Premium Leather Jackets for Women" },
    { key: "store_description_ar", value: "جاكيتات جلد فاخرة للنساء" },
    { key: "store_email", value: "contact@cuirelite.com" },
    { key: "store_phone", value: "+1 234 567 890" },
    { key: "store_address", value: "123 Fashion Street, Paris, France" },
    { key: "currency", value: "USD" },
    { key: "currency_symbol", value: "$" },
    { key: "shipping_cost", value: "15.00" },
    { key: "free_shipping_threshold", value: "200.00" },
    { key: "hero_title", value: "New Collection 2025" },
    { key: "hero_title_ar", value: "مجموعة جديدة 2025" },
    { key: "hero_subtitle", value: "Discover our premium leather jackets" },
    { key: "hero_subtitle_ar", value: "اكتشفي جاكيتات الجلد الفاخرة" },
  ]);

  console.log("✅ Inserted store settings");

  // Insert hero slides
  await db.insert(heroSlides).values([
    {
      title: "New Collection 2025",
      titleAr: "مجموعة جديدة 2025",
      subtitle: "Discover our premium leather jackets crafted from the finest materials",
      subtitleAr: "اكتشفي جاكيتات الجلد الفاخرة المصنوعة من أجود المواد",
      image: "/images/hero-1.jpg",
      link: "/products",
      isActive: true,
      order: 1,
    },
    {
      title: "Exclusive Biker Collection",
      titleAr: "مجموعة بايكر الحصرية",
      subtitle: "Bold styles for the modern woman",
      subtitleAr: "أنماط جريئة للمرأة العصرية",
      image: "/images/hero-2.jpg",
      link: "/products?category=leather-jackets",
      isActive: true,
      order: 2,
    },
  ]);

  console.log("✅ Inserted hero slides");
  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
