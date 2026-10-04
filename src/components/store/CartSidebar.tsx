"use client";

import { useStore } from "@/lib/store-context";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
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
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-accent" />
            <h2 className="text-lg font-bold tracking-wider">
              {language === "en" ? "Shopping Cart" : "سلة التسوق"}
            </h2>
            <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium mb-2">
                {language === "en"
                  ? "Your cart is empty"
                  : "سلة التسوق فارغة"}
              </p>
              <p className="text-sm text-gray-300 mb-6">
                {language === "en"
                  ? "Start shopping to add items"
                  : "ابدأ التسوق لإضافة منتجات"}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-brand text-white px-6 py-3 rounded-full text-sm font-medium tracking-wider uppercase hover:bg-accent transition-colors"
              >
                {language === "en" ? "Continue Shopping" : "متابعة التسوق"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 bg-gray-50 rounded-xl p-3"
                >
                  <div
                    className="w-20 h-24 bg-cover bg-center rounded-lg flex-shrink-0"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-brand truncate">
                      {language === "ar" ? item.nameAr || item.name : item.name}
                    </h3>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && " | "}
                      {item.color && `Color: ${item.color}`}
                    </div>
                    <p className="text-accent font-bold mt-1">
                      {settings.currency_symbol || "$"}{item.price.toFixed(2)}
                    </p>
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
            <div className="flex justify-between items-center">
              <span className="text-gray-500">
                {language === "en" ? "Subtotal" : "المجموع الفرعي"}
              </span>
              <span className="text-xl font-bold text-brand">
                {settings.currency_symbol || "$"}{cartTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {language === "en"
                ? "Shipping and taxes calculated at checkout"
                : "يتم احتساب الشحن والضرائب عند الدفع"}
            </p>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-brand hover:bg-accent text-white text-center py-4 rounded-xl font-semibold tracking-wider uppercase text-sm transition-colors btn-shine flex items-center justify-center gap-2"
            >
              {language === "en" ? "Checkout" : "إتمام الشراء"}
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
