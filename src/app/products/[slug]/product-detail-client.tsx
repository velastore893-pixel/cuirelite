"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StoreProvider, useStore } from "@/lib/store-context";
import Navbar from "@/components/store/Navbar";
import ProductCard from "@/components/store/ProductCard";
import CartSidebar from "@/components/store/CartSidebar";
import Footer from "@/components/store/Footer";
import {
  Star,
  Heart,
  Zap,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Check,
  User,
  Phone,
  MapPin,
  Building,
  Loader2,
  CheckCircle,
  Package,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  price: string;
  comparePrice: string | null;
  images: string[] | null;
  colors: { name: string; hex: string }[] | null;
  sizes: string[] | null;
  stock: number | null;
  description: string | null;
  descriptionAr: string | null;
  material: string | null;
  materialAr: string | null;
  isFeatured: boolean | null;
  isNewArrival: boolean | null;
  isActive: boolean | null;
  categoryId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Category {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
}

interface Props {
  product: Product;
  category: Category | null;
  relatedProducts: Product[];
}

function ProductDetailContent({ product, category, relatedProducts }: Props) {
  const { language, settings } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [pageSettings, setPageSettings] = useState<Record<string, string>>({});
  const [productOffers, setProductOffers] = useState<Array<{
    id: number;
    name: string;
    nameAr: string | null;
    quantity: number;
    price: string;
    originalPrice: string | null;
    badge: string | null;
    badgeAr: string | null;
    isDefault: boolean | null;
  }>>([]);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/admin/product-page-settings")
      .then((res) => res.json())
      .then((data) => setPageSettings(data.settings || {}))
      .catch(() => {});
    fetch("/api/offers")
      .then((res) => res.json())
      .then((data) => {
        const offers = data.offers || [];
        setProductOffers(offers);
        const defaultOffer = offers.find((o: { isDefault: boolean }) => o.isDefault);
        if (defaultOffer) {
          setSelectedOffer(defaultOffer.id);
        } else if (offers.length > 0) {
          setSelectedOffer(offers[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const show = (key: string) => pageSettings[key] !== "false";

  const images = product.images?.length
    ? product.images
    : ["/images/placeholder.jpg"];

  const discount =
    product.comparePrice &&
    parseFloat(product.comparePrice) > parseFloat(product.price)
      ? Math.round(
          ((parseFloat(product.comparePrice) - parseFloat(product.price)) /
            parseFloat(product.comparePrice)) *
            100
        )
      : 0;

  const getSelectedOfferData = () => {
    if (selectedOffer) {
      return productOffers.find((o) => o.id === selectedOffer);
    }
    return null;
  };

  const orderQuantity = getSelectedOfferData()?.quantity || quantity;
  const orderPrice = getSelectedOfferData()
    ? parseFloat(getSelectedOfferData()!.price)
    : parseFloat(product.price);

  const submitOrder = async () => {
    // Prevent duplicate submissions — the button is also disabled while submitting
    if (orderSubmitting) return;

    // Validate required fields
    const trimmedName = orderForm.fullName.trim();
    const trimmedPhone = orderForm.phone.trim();
    const trimmedAddress = orderForm.address.trim();
    const trimmedCity = orderForm.city.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress || !trimmedCity) {
      setOrderError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (trimmedName.length < 2) {
      setOrderError("يرجى إدخال الاسم الكامل");
      return;
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(trimmedPhone)) {
      setOrderError("يرجى إدخال رقم هاتف صحيح");
      return;
    }
    if (trimmedAddress.length < 5) {
      setOrderError("يرجى إدخال العنوان الكامل");
      return;
    }

    setOrderError(null);
    setOrderSubmitting(true);
    try {
      const offer = getSelectedOfferData();
      // NOTE: only productId + quantity + customer info are sent.
      // The server reads the real price from the database.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: trimmedName,
          customerPhone: trimmedPhone,
          shippingAddress: trimmedAddress,
          city: trimmedCity,
          notes: orderForm.notes?.trim() || undefined,
          offerId: offer ? offer.id : undefined,
          offerQuantity: offer ? orderQuantity : undefined,
          items: [
            {
              productId: product.id,
              quantity: orderQuantity,
              size: selectedSize || undefined,
              color: selectedColor || undefined,
            },
          ],
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to the professional success page.
        // NOTE: the order number is NOT sent to the customer — it is
        // stored in the database and visible only in the admin panel.
        const order = data.order;
        const params = new URLSearchParams({
          product: order.items?.[0]?.name || product.name,
          qty: String(order.items?.[0]?.quantity || orderQuantity),
          total: String(order.total),
          city: order.city || trimmedCity,
        });
        window.location.href = `/order-success?${params.toString()}`;
      } else {
        setOrderError(
          data.error || "تعذّر إنشاء الطلب. حاول مرة أخرى."
        );
      }
    } catch (err) {
      console.error("Order failed:", err);
      setOrderError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <CartSidebar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-accent transition-colors">
              {language === "en" ? "Home" : "الرئيسية"}
            </Link>
            <ChevronRight size={14} />
            <Link
              href="/products"
              className="hover:text-accent transition-colors"
            >
              {language === "en" ? "Shop" : "المتجر"}
            </Link>
            <ChevronRight size={14} />
            {category && (
              <>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {language === "en" ? category.name : category.nameAr}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-brand font-medium truncate">
              {language === "ar" ? product.nameAr || product.name : product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-4">
              {product.isNewArrival && (
                <span className="absolute top-4 left-4 z-10 bg-accent text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  NEW
                </span>
              )}
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${images[selectedImage]})` }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden bg-cover bg-center border-2 transition-all ${
                      selectedImage === index
                        ? "border-accent"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    style={{ backgroundImage: `url(${img})` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.isNewArrival && (
              <span className="text-accent font-medium text-sm tracking-wider uppercase mb-2 block">
                {language === "en" ? "New Arrival" : "وصل حديثاً"}
              </span>
            )}

            <h1
              className="text-3xl md:text-4xl font-bold text-brand mb-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {language === "ar" ? product.nameAr || product.name : product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-accent text-accent"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">(4.8) · 124 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-brand">
                {settings.currency_symbol || "$"}{product.price}
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {settings.currency_symbol || "$"}{product.comparePrice}
                  </span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {show("pp_show_description") && (
              <p className="text-gray-600 leading-relaxed mb-8">
                {language === "ar"
                  ? product.descriptionAr || product.description
                  : product.description}
              </p>
            )}

            {/* Colors */}
            {show("pp_show_color_selector") && product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-brand mb-3 block">
                  {language === "en" ? "Color" : "اللون"}:{" "}
                  {selectedColor && (
                    <span className="text-accent font-normal">
                      {selectedColor}
                    </span>
                  )}
                </label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedColor === color.name
                          ? "border-accent scale-110"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.name && (
                        <Check
                          size={14}
                          className={
                            color.hex === "#FFFFFF" || color.hex === "#FFFDD0"
                              ? "text-brand"
                              : "text-white"
                          }
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {show("pp_show_size_selector") && product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-brand mb-3 block">
                  {language === "en" ? "Size" : "المقاس"}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-12 px-4 rounded-xl text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "bg-brand text-white"
                          : "bg-gray-100 text-brand hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Offers */}
            {productOffers.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-brand mb-3 block flex items-center gap-2">
                  🎁 اختر العرض
                </label>
                <div className="space-y-3">
                  {productOffers.map((offer) => {
                    const isSelected = selectedOffer === offer.id;
                    const discount = offer.originalPrice
                      ? Math.round(
                          ((parseFloat(offer.originalPrice) - parseFloat(offer.price)) /
                            parseFloat(offer.originalPrice)) *
                            100
                        )
                      : 0;
                    return (
                      <button
                        key={offer.id}
                        onClick={() => setSelectedOffer(offer.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-amber-500" : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 bg-amber-500 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-gray-900">
                              {language === "ar" ? offer.nameAr || offer.name : offer.name}
                            </span>
                            {discount > 0 && (
                              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                خصم {discount}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-xl font-bold text-amber-600">
                              {settings.currency_symbol || "$"}{offer.price}
                            </span>
                            {offer.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {settings.currency_symbol || "$"}{offer.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-center flex-shrink-0">
                          <span className="text-lg font-bold text-brand">{offer.quantity}x</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
                    {show("pp_show_quantity") && !getSelectedOfferData() && (<div className="mb-6">
              <label className="text-sm font-semibold text-brand mb-3 block">
                {language === "en" ? "Quantity" : "الكمية"}
              </label>
              <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:text-accent transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:text-accent transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              {product.stock !== null && product.stock < 10 && (
                <p className="text-sm text-orange-500 mt-2">
                  {language === "en"
                    ? `Only ${product.stock} left in stock`
                    : `فقط ${product.stock} متبقي في المخزون`}
                </p>
              )}
            </div>)}

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* ===== OFFERS SECTION ===== */}
            {productOffers.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-brand mb-3 block flex items-center gap-2">
                  🎯 اختر العرض
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {productOffers.map((offer) => {
                    const isSelected = selectedOffer === offer.id;
                    const savings = offer.originalPrice
                      ? Math.round(
                          ((parseFloat(offer.originalPrice) - parseFloat(offer.price)) /
                            parseFloat(offer.originalPrice)) *
                            100
                        )
                      : 0;
                    return (
                      <button
                        key={offer.id}
                        onClick={() => setSelectedOffer(offer.id)}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Radio */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-amber-500" : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 bg-amber-500 rounded-full" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {language === "ar" ? offer.nameAr || offer.name : offer.name}
                            </span>
                            {offer.badge && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {language === "ar" ? offer.badgeAr || offer.badge : offer.badge}
                              </span>
                            )}
                            {savings > 0 && (
                              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                وفر {savings}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold text-amber-600">
                              {settings.currency_symbol || "$"}{offer.price}
                            </span>
                            {offer.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {settings.currency_symbol || "$"}{offer.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-center">
                          <span className="text-lg font-bold text-brand">{offer.quantity}x</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* ===== ORDER FORM - Directly Below ===== */}
            <div id="order">
              {/* Form Header */}
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3">
                  <Zap size={12} />
                  اطلب الآن
                </div>
                <h3 className="text-xl font-bold text-brand">
                  أكمل معلوماتك للطلب
                </h3>
              </div>

              {/* Success Message */}
              {orderSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold text-green-800 text-lg">تم الطلب بنجاح! ✅</h4>
                  <p className="text-green-600 text-sm mt-1">سنتواصل معك قريباً لتأكيد الطلب</p>
                </div>
              ) : (
                <>
                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <User size={12} className="inline ml-1" />
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        value={orderForm.fullName}
                        onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Phone size={12} className="inline ml-1" />
                        رقم الهاتف *
                      </label>
                      <input
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                        placeholder="+212 600 000 000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <MapPin size={12} className="inline ml-1" />
                        العنوان *
                      </label>
                      <input
                        type="text"
                        value={orderForm.address}
                        onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                        placeholder="الشارع، الحي، العمارة..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Building size={12} className="inline ml-1" />
                        المدينة *
                      </label>
                      <input
                        type="text"
                        value={orderForm.city}
                        onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                        placeholder="المدينة"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        ملاحظات (اختياري)
                      </label>
                      <textarea
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
                        rows={2}
                        placeholder="أي ملاحظات إضافية..."
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  {orderError && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center font-medium">
                      {orderError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={submitOrder}
                    disabled={orderSubmitting}
                    className="w-full mt-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-xl font-bold text-base tracking-wide transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {orderSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        جاري تأكيد الطلب...
                      </>
                    ) : (
                      <>
                        <Package size={20} />
                        تأكيد الطلب - {settings.currency_symbol || "$"}{(orderPrice * orderQuantity).toFixed(2)}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400">
                    <span>💰 الدفع عند الاستلام</span>
                    <span>🚚 شحن مجاني</span>
                    <span>✅ ضمان</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default function ProductDetailClient(props: Props) {
  return (
    <StoreProvider>
      <ProductDetailContent {...props} />
    </StoreProvider>
  );
}
