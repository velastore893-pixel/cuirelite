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

interface StoreContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, size?: string, color?: string) => void;
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
  language: "en" | "ar";
  setLanguage: (lang: "en" | "ar") => void;
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
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings && Object.keys(data.settings).length > 0) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

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
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback(
    (productId: number, size?: string, color?: string) => {
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
    (productId: number, quantity: number, size?: string, color?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, size, color);
        return;
      }
      setCart((prev) =>
        prev.map((c) =>
          c.productId === productId && c.size === size && c.color === color
            ? { ...c, quantity }
            : c
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
