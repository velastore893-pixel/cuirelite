"use client";

import { useStore } from "@/lib/store-context";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CartSidebar() {
  const {
    cart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    language,
    settings,
    t,
  } = useStore();

  if (!isCartOpen) return null;

  const extraText = {
    en: {
      shoppingCart: "Shopping Cart",
      startShopping: "Start shopping to add items",
      shippingCheckout:
        "Shipping and taxes calculated at checkout",
      wishlistRemove: "Remove item",
    },

    ar: {
      shoppingCart: "سلة التسوق",
      startShopping: "ابدأ التسوق لإضافة منتجات",
      shippingCheckout:
        "يتم احتساب الشحن والضرائب عند الدفع",
      wishlistRemove: "حذف المنتج",
    },
  };

  const txt = extraText[language];

  return (
    <div
      className="fixed inset-0 z-50"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`absolute top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col ${
          language === "ar" ? "left-0" : "right-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag
              size={22}
              className="text-accent"
            />

            <h2 className="text-lg font-bold tracking-wider">
              {txt.shoppingCart}
            </h2>

            <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag
                size={64}
                className="text-gray-200 mb-4"
              />

              <p className="text-gray-400 font-medium mb-2">
                {t("emptyCart")}
              </p>

              <p className="text-sm text-gray-300 mb-6">
                {txt.startShopping}
              </p>

              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-brand text-white px-6 py-3 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors"
              >
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 bg-gray-50 rounded-xl p-3"
                >
                  {/* Product Image */}
                  <div
                    className="w-20 h-24 bg-cover bg-center rounded-lg flex-shrink-0"
                    style={{
                      backgroundImage: `url(${item.image})`,
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-brand truncate">
                      {language === "ar"
                        ? item.nameAr || item.name
                        : item.name}
                    </h3>

                    {/* Size + Color */}
                    <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-1">
                      {item.size && (
                        <span>
                          {t("size")}: {item.size}
                        </span>
                      )}

                      {item.size && item.color && (
                        <span>|</span>
                      )}

                      {item.color && (
                        <span>
                          {t("color")}: {item.color}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <p
                      className="text-accent font-bold mt-1"
                      dir="ltr"
                    >
                      {settings.currency_symbol || "DH"}
                      {item.price.toFixed(2)}
                    </p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.size,
                              item.color
                            )
                          }
                          className="p-1.5 hover:text-accent transition-colors"
                          aria-label={
                            language === "ar"
                              ? "تقليل الكمية"
                              : "Decrease quantity"
                          }
                        >
                          <Minus size={14} />
                        </button>

                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.size,
                              item.color
                            )
                          }
                          className="p-1.5 hover:text-accent transition-colors"
                          aria-label={
                            language === "ar"
                              ? "زيادة الكمية"
                              : "Increase quantity"
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(
                            item.productId,
                            item.size,
                            item.color
                          )
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={txt.wishlistRemove}
                        title={t("remove")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">
                {t("subtotal")}
              </span>

              <span
                className="text-xl font-bold text-brand"
                dir="ltr"
              >
                {settings.currency_symbol || "DH"}
                {cartTotal.toFixed(2)}
              </span>
            </div>

            {/* Shipping Message */}
            <p className="text-xs text-gray-400">
              {txt.shippingCheckout}
            </p>

            {/* Checkout */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-brand hover:bg-accent text-white text-center py-4 rounded-xl font-semibold tracking-wider uppercase text-sm transition-colors btn-shine flex items-center justify-center gap-2"
            >
              {t("checkout")}

              <ArrowRight
                size={16}
                className={
                  language === "ar"
                    ? "rotate-180"
                    : ""
                }
              />
            </Link>

            {/* Trust */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 pt-1">
              <span>
                💰 {t("cashOnDelivery")}
              </span>

              <span>•</span>

              <span>
                ✅ {t("secureOrder")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
