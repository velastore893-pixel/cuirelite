"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: number;
  name: string;
  nameAr?: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface StoreSettings {
  store_name: string;
  store_name_ar: string;
  store_description: string;
  store_description_ar: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
  currency_symbol: string;
  shipping_cost: string;
  free_shipping_threshold: string;
  hero_title: string;
  hero_title_ar: string;
  hero_subtitle: string;
  hero_subtitle_ar: string;
  facebook_pixel_id: string;
  tiktok_pixel_id: string;
  cod_enabled: string;
  cod_label: string;
  cod_button_text: string;
  cod_success_message: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  favicon_url: string;
  [key: string]: string;
}

type Language = "en" | "ar";

const translations = {
  en: {
    // General
    home: "Home",
    shop: "Shop",
    products: "Products",
    categories: "Categories",
    about: "About",
    contact: "Contact",
    search: "Search",
    menu: "Menu",
    close: "Close",
    loading: "Loading...",
    viewAll: "View All",
    viewProduct: "View Product",
    learnMore: "Learn More",
    back: "Back",
    continue: "Continue",

    // Product
    product: "Product",
    price: "Price",
    oldPrice: "Old Price",
    newArrival: "New Arrival",
    featured: "Featured",
    description: "Description",
    color: "Color",
    size: "Size",
    quantity: "Quantity",
    material: "Material",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    onlyLeft: "Only {count} left in stock",
    relatedProducts: "Related Products",
    chooseOffer: "Choose an offer",
    chooseColor: "Choose a color",
    chooseSize: "Choose a size",

    // Quantity discount
    quantityDiscount: "Quantity Discount",
    youSaved: "You saved {amount} DH 🎉",
    extraItemDiscount: "Save 50 DH for every additional item",
    subtotalBeforeDiscount: "Subtotal before discount",
    totalAfterDiscount: "Total after discount",

    // Cart
    cart: "Cart",
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty",
    addToCart: "Add to Cart",
    remove: "Remove",
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    cartItems: "Cart Items",

    // Offers
    offers: "Offers",
    offer: "Offer",
    bestOffer: "Best Offer",
    bestSeller: "Best Seller",
    save: "Save",
    discount: "Discount",

    // Order form
    orderNow: "Order Now",
    completeOrderInfo: "Complete your information to order",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    phone: "Phone Number",
    phonePlaceholder: "+212 600 000 000",
    address: "Address",
    addressPlaceholder: "Street, neighborhood, building...",
    city: "City",
    cityPlaceholder: "Enter your city",
    notes: "Notes",
    optional: "Optional",
    notesPlaceholder: "Any additional notes...",
    confirmOrder: "Confirm Order",
    confirmingOrder: "Confirming order...",
    required: "Required",

    // Order success
    orderSuccess: "Order placed successfully! ✅",
    orderSuccessMessage:
      "We will contact you shortly to confirm your order.",
    thankYou: "Thank you for your order",
    orderReceived: "Your order has been received successfully",

    // Validation
    fillRequiredFields: "Please fill in all required fields",
    enterFullName: "Please enter your full name",
    enterValidPhone: "Please enter a valid phone number",
    enterFullAddress: "Please enter your full address",
    enterCity: "Please enter your city",
    orderFailed: "Unable to create the order. Please try again.",
    serverConnectionFailed:
      "Unable to connect to the server. Please try again.",

    // Delivery / trust
    cashOnDelivery: "Cash on Delivery",
    freeShipping: "Free Shipping",
    shipping: "Shipping",
    guarantee: "Guarantee",
    secureOrder: "Secure Order",
    fastDelivery: "Fast Delivery",

    // Navbar / account
    language: "Language",
    english: "English",
    arabic: "Arabic",

    // Footer
    customerService: "Customer Service",
    quickLinks: "Quick Links",
    followUs: "Follow Us",
    email: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
    allRightsReserved: "All rights reserved",

    // Product listing
    allProducts: "All Products",
    filter: "Filter",
    sortBy: "Sort By",
    newest: "Newest",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    noProducts: "No products found",
    clearFilters: "Clear Filters",

    // Checkout
    checkoutTitle: "Checkout",
    orderSummary: "Order Summary",
    customerInformation: "Customer Information",
    shippingInformation: "Shipping Information",
    placeOrder: "Place Order",
    paymentMethod: "Payment Method",

    // Common
    yes: "Yes",
    no: "No",
    optionalLabel: "(optional)",
  },

  ar: {
    // General
    home: "الرئيسية",
    shop: "المتجر",
    products: "المنتجات",
    categories: "التصنيفات",
    about: "من نحن",
    contact: "اتصل بنا",
    search: "بحث",
    menu: "القائمة",
    close: "إغلاق",
    loading: "جاري التحميل...",
    viewAll: "عرض الكل",
    viewProduct: "عرض المنتج",
    learnMore: "اعرف المزيد",
    back: "رجوع",
    continue: "متابعة",

    // Product
    product: "المنتج",
    price: "السعر",
    oldPrice: "السعر القديم",
    newArrival: "وصل حديثاً",
    featured: "مميز",
    description: "الوصف",
    color: "اللون",
    size: "المقاس",
    quantity: "الكمية",
    material: "الخامة",
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    onlyLeft: "فقط {count} متبقي في المخزون",
    relatedProducts: "منتجات مشابهة",
    chooseOffer: "اختر العرض",
    chooseColor: "اختر اللون",
    chooseSize: "اختر المقاس",

    // Quantity discount
    quantityDiscount: "خصم الكمية",
    youSaved: "وفرت {amount} درهم 🎉",
    extraItemDiscount: "وفر 50 درهم مع كل قطعة إضافية",
    subtotalBeforeDiscount: "المجموع قبل الخصم",
    totalAfterDiscount: "المجموع بعد الخصم",

    // Cart
    cart: "السلة",
    yourCart: "سلة التسوق",
    emptyCart: "سلة التسوق فارغة",
    addToCart: "أضف إلى السلة",
    remove: "حذف",
    subtotal: "المجموع الفرعي",
    total: "المجموع",
    checkout: "إتمام الطلب",
    continueShopping: "متابعة التسوق",
    cartItems: "منتجات السلة",

    // Offers
    offers: "العروض",
    offer: "عرض",
    bestOffer: "أفضل عرض",
    bestSeller: "الأكثر مبيعاً",
    save: "وفر",
    discount: "خصم",

    // Order form
    orderNow: "اطلب الآن",
    completeOrderInfo: "أكمل معلوماتك للطلب",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    phone: "رقم الهاتف",
    phonePlaceholder: "+212 600 000 000",
    address: "العنوان",
    addressPlaceholder: "الشارع، الحي، العمارة...",
    city: "المدينة",
    cityPlaceholder: "أدخل مدينتك",
    notes: "ملاحظات",
    optional: "اختياري",
    notesPlaceholder: "أي ملاحظات إضافية...",
    confirmOrder: "تأكيد الطلب",
    confirmingOrder: "جاري تأكيد الطلب...",
    required: "مطلوب",

    // Order success
    orderSuccess: "تم الطلب بنجاح! ✅",
    orderSuccessMessage: "سنتواصل معك قريباً لتأكيد الطلب.",
    thankYou: "شكراً لطلبك",
    orderReceived: "تم استلام طلبك بنجاح",

    // Validation
    fillRequiredFields: "يرجى ملء جميع الحقول المطلوبة",
    enterFullName: "يرجى إدخال الاسم الكامل",
    enterValidPhone: "يرجى إدخال رقم هاتف صحيح",
    enterFullAddress: "يرجى إدخال العنوان الكامل",
    enterCity: "يرجى إدخال المدينة",
    orderFailed: "تعذّر إنشاء الطلب. حاول مرة أخرى.",
    serverConnectionFailed: "تعذّر الاتصال بالخادم. حاول مرة أخرى.",

    // Delivery / trust
    cashOnDelivery: "الدفع عند الاستلام",
    freeShipping: "شحن مجاني",
    shipping: "الشحن",
    guarantee: "ضمان",
    secureOrder: "طلب آمن",
    fastDelivery: "توصيل سريع",

    // Navbar
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",

    // Footer
    customerService: "خدمة العملاء",
    quickLinks: "روابط سريعة",
    followUs: "تابعنا",
    email: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    addressLabel: "العنوان",
    allRightsReserved: "جميع الحقوق محفوظة",

    // Product listing
    allProducts: "جميع المنتجات",
    filter: "تصفية",
    sortBy: "ترتيب حسب",
    newest: "الأحدث",
    priceLowHigh: "السعر: من الأقل إلى الأعلى",
    priceHighLow: "السعر: من الأعلى إلى الأقل",
    noProducts: "لا توجد منتجات",
    clearFilters: "مسح الفلاتر",

    // Checkout
    checkoutTitle: "إتمام الطلب",
    orderSummary: "ملخص الطلب",
    customerInformation: "معلومات العميل",
    shippingInformation: "معلومات التوصيل",
    placeOrder: "تأكيد الطلب",
    paymentMethod: "طريقة الدفع",

    // Common
    yes: "نعم",
    no: "لا",
    optionalLabel: "(اختياري)",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface StoreContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (
    productId: number,
    size?: string,
    color?: string
  ) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    size?: string,
    color?: string
  ) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  language: Language;
  setLanguage: (lang: Language) => void;

  t: (
    key: TranslationKey,
    variables?: Record<string, string | number>
  ) => string;

  settings: StoreSettings;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: StoreSettings = {
  store_name: "CUIR ELITE",
  store_name_ar: "كوار إيليت",
  store_description: "Premium Leather Jackets for Women",
  store_description_ar: "جاكيتات جلد فاخرة للنساء",
  store_email: "contact@cuirelite.com",
  store_phone: "+1 234 567 890",
  store_address: "123 Fashion Street, Paris, France",
  currency: "USD",
  currency_symbol: "$",
  shipping_cost: "0",
  free_shipping_threshold: "0",
  hero_title: "New Collection 2025",
  hero_title_ar: "مجموعة جديدة 2025",
  hero_subtitle: "Discover our premium leather jackets",
  hero_subtitle_ar: "اكتشفي جاكيتات الجلد الفاخرة",
  facebook_pixel_id: "",
  tiktok_pixel_id: "",
  cod_enabled: "true",
  cod_label: "الدفع عند الاستلام",
  cod_button_text: "اطلب الآن",
  cod_success_message: "تم الطلب بنجاح! سنتواصل معك قريباً",
  primary_color: "#c9a96e",
  secondary_color: "#1a1a1a",
  logo_url: "",
  favicon_url: "",
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [language, setLanguageState] = useState<Language>("en");
  const [settings, setSettings] =
    useState<StoreSettings>(defaultSettings);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();

      if (
        data.settings &&
        Object.keys(data.settings).length > 0
      ) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "store_language"
    ) as Language | null;

    if (
      savedLanguage === "en" ||
      savedLanguage === "ar"
    ) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Apply language + page direction
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);

    if (typeof window !== "undefined") {
      localStorage.setItem("store_language", lang);
    }
  }, []);

  const t = useCallback(
    (
      key: TranslationKey,
      variables?: Record<string, string | number>
    ) => {
      let text: string =
        translations[language][key] ||
        translations.en[key] ||
        key;

      if (variables) {
        Object.entries(variables).forEach(
          ([variable, value]) => {
            text = text.replace(
              new RegExp(`{${variable}}`, "g"),
              String(value)
            );
          }
        );
      }

      return text;
    },
    [language]
  );

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) =>
          c.productId === item.productId &&
          c.size === item.size &&
          c.color === item.color
      );

      if (existing) {
        return prev.map((c) =>
          c.productId === item.productId &&
          c.size === item.size &&
          c.color === item.color
            ? {
                ...c,
                quantity:
                  c.quantity + item.quantity,
              }
            : c
        );
      }

      return [...prev, item];
    });

    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback(
    (
      productId: number,
      size?: string,
      color?: string
    ) => {
      setCart((prev) =>
        prev.filter(
          (c) =>
            !(
              c.productId === productId &&
              c.size === size &&
              c.color === color
            )
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (
      productId: number,
      quantity: number,
      size?: string,
      color?: string
    ) => {
      if (quantity <= 0) {
        removeFromCart(
          productId,
          size,
          color
        );
        return;
      }

      setCart((prev) =>
        prev.map((c) =>
          c.productId === productId &&
          c.size === size &&
          c.color === color
            ? { ...c, quantity }
            : c
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(
    () => setCart([]),
    []
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        language,
        setLanguage,
        t,
        settings,
        refreshSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore must be used within a StoreProvider"
    );
  }

  return context;
}
