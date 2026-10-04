"use client";

import { useState } from "react";
import { StoreProvider, useStore } from "@/lib/store-context";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import {
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Home,
} from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const { cart, cartTotal, cartCount, clearCart, language, settings } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCostVal = parseFloat(settings.shipping_cost) || 0;
  const freeShippingThreshold = parseFloat(settings.free_shipping_threshold) || 0;
  const isFreeShipping = shippingCostVal === 0 || cartTotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : shippingCostVal;
  const total = cartTotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);

    const orderData = {
      customerName: form.get("firstName")
        ? `${form.get("firstName")} ${form.get("lastName")}`
        : form.get("name") as string,
      customerEmail: form.get("email") as string,
      customerPhone: form.get("phone") as string,
      shippingAddress: `${form.get("address")}, ${form.get("apartment") || ""}`.trim(),
      city: form.get("city") as string,
      totalAmount: total.toFixed(2),
      paymentMethod: form.get("payment") as string,
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Order failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4 py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-brand mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
              {language === "en" ? "Order Placed Successfully!" : "تم الطلب بنجاح!"}
            </h1>
            <p className="text-gray-400 mb-2">
              {language === "en" ? "Order Number:" : "رقم الطلب:"}
            </p>
            <p className="text-accent font-bold text-xl mb-6">CE-{Date.now().toString(36).toUpperCase()}</p>
            <p className="text-gray-400 mb-8">
              {language === "en"
                ? "Thank you for your order. We'll send you a confirmation email shortly."
                : "شكراً لك على طلبك. سنرسل لك بريد تأكيد قريباً."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:bg-accent transition-colors"
            >
              {language === "en" ? "Continue Shopping" : "متابعة التسوق"}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand mb-4">
              {language === "en" ? "Your cart is empty" : "سلة التسوق فارغة"}
            </h1>
            <Link href="/products" className="text-accent hover:underline font-medium">
              {language === "en" ? "Start Shopping" : "ابدأ التسوق"}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Header */}
      <div className="bg-brand pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            {language === "en" ? "Continue Shopping" : "متابعة التسوق"}
          </Link>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
            {language === "en" ? "Checkout" : "إتمام الشراء"}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-brand mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <User size={20} className="text-accent" />
                  </div>
                  {language === "en" ? "Customer Information" : "معلومات الزبون"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "en" ? "First Name" : "الاسم الأول"} *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        placeholder={language === "en" ? "John" : "محمد"}
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "en" ? "Last Name" : "اسم العائلة"} *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                      placeholder={language === "en" ? "Doe" : "الحسني"}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "en" ? "Email Address" : "البريد الإلكتروني"} *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "en" ? "Phone Number" : "رقم الهاتف"} *
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        placeholder="+212 600 000 000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-brand mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-accent" />
                  </div>
                  {language === "en" ? "Shipping Address" : "عنوان الشحن"}
                </h2>

                <div className="space-y-5">
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "en" ? "Street Address" : "عنوان الشارع"} *
                    </label>
                    <div className="relative">
                      <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        placeholder={language === "en" ? "123 Main Street" : "123 الشارع الرئيسي"}
                      />
                    </div>
                  </div>

                  {/* Apartment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "en" ? "Apartment, Suite, etc. (optional)" : "الشقة، المكتب، إلخ (اختياري)"}
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                      placeholder={language === "en" ? "Apt 4B" : "شقة 4ب"}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === "en" ? "City" : "المدينة"} *
                    </label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="city"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        placeholder={language === "en" ? "Paris" : "الدار البيضاء"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-brand mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <CreditCard size={20} className="text-accent" />
                  </div>
                  {language === "en" ? "Payment Method" : "طريقة الدفع"}
                </h2>

                <div className="space-y-3">
                  {[
                    { value: "cod", label: "Cash on Delivery", labelAr: "الدفع عند الاستلام", desc: "Pay when you receive your order", descAr: "ادفعي عند استلام طلبك" },
                    { value: "credit_card", label: "Credit / Debit Card", labelAr: "بطاقة ائتمان / خصم", desc: "Visa, Mastercard accepted", descAr: "فيزا، ماستركارد مقبولة" },
                    { value: "paypal", label: "PayPal", labelAr: "باي بال", desc: "Pay securely with PayPal", descAr: "ادفعي بأمان عبر باي بال" },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-accent/50 transition-all has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        defaultChecked={method.value === "cod"}
                        className="w-5 h-5 text-accent border-gray-300 focus:ring-accent"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {language === "en" ? method.label : method.labelAr}
                        </p>
                        <p className="text-sm text-gray-400">
                          {language === "en" ? method.desc : method.descAr}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-brand mb-6">
                  {language === "en" ? "Order Summary" : "ملخص الطلب"}
                </h2>

                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex gap-3"
                    >
                      <div
                        className="w-16 h-20 bg-cover bg-center rounded-lg flex-shrink-0 border border-gray-100"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">
                          {language === "ar" ? item.nameAr || item.name : item.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {item.size && `${language === "en" ? "Size" : "المقاس"}: ${item.size}`}
                          {item.size && item.color && " · "}
                          {item.color && `${language === "en" ? "Color" : "اللون"}: ${item.color}`}
                        </p>
                        <p className="text-sm mt-1">
                          {item.quantity} × {settings.currency_symbol || "$"}{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        {settings.currency_symbol || "$"}{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {language === "en" ? "Subtotal" : "المجموع الفرعي"} ({cartCount} {language === "en" ? "items" : "منتجات"})
                    </span>
                    <span>{settings.currency_symbol || "$"}{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {language === "en" ? "Shipping" : "الشحن"}
                    </span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">
                          {language === "en" ? "FREE" : "مجاني"}
                        </span>
                      ) : (
                        `${settings.currency_symbol || "$"}${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-accent">
                      {language === "en"
                        ? `Free shipping on orders over ${settings.currency_symbol || "$"}${freeShippingThreshold}`
                        : `شحن مجاني للطلبات فوق ${settings.currency_symbol || "$"}${freeShippingThreshold}`}
                    </p>
                  )}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">
                        {language === "en" ? "Total" : "المجموع"}
                      </span>
                      <span className="font-bold text-lg text-accent">
                        {settings.currency_symbol || "$"}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand hover:bg-accent text-white py-4 rounded-xl font-semibold tracking-wider uppercase text-sm transition-all duration-300 btn-shine mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {language === "en" ? "Processing..." : "جاري المعالجة..."}
                    </>
                  ) : (
                    language === "en" ? "Place Order" : "تأكيد الطلب"
                  )}
                </button>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Shield size={12} />
                    {language === "en" ? "Secure Checkout" : "دفع آمن"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck size={12} />
                    {language === "en" ? "Tracked Shipping" : "شحن مع التتبع"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <StoreProvider>
      <CheckoutContent />
    </StoreProvider>
  );
}
