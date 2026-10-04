"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  Truck,
  Phone,
  ArrowLeft,
  Loader2,
  MapPin,
} from "lucide-react";

interface OrderInfo {
  productName: string;
  quantity: number;
  total: string;
  city: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the real order information returned by the server.
    // NOTE: the order number is intentionally NOT shown to the
    // customer — it lives only in the database / admin panel.
    const productName = searchParams.get("product");
    const quantity = searchParams.get("qty");
    const total = searchParams.get("total");
    const city = searchParams.get("city");

    if (total) {
      setOrder({
        productName: productName || "",
        quantity: quantity ? parseInt(quantity) : 1,
        total,
        city: city || "",
      });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 pt-16 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle size={48} className="text-white" strokeWidth={2.5} />
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            شكراً لك على طلبك!
          </h1>
          <p className="text-white/90 text-lg sm:text-xl mb-2">
            تم استلام طلبك بنجاح.
          </p>
          <p className="text-white/75 text-sm sm:text-base max-w-xl mx-auto">
            سنتواصل معك قريباً لتأكيد طلبك قبل شحنه إليك.
          </p>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center gap-3">
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
              <Package size={22} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">تفاصيل الطلب</h2>
              <p className="text-sm text-gray-400">معلومات طلبك المسجلة</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            {order ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Quantity */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    الكمية
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {order.quantity}
                  </p>
                </div>

                {/* City */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    المدينة
                  </p>
                  <p className="font-bold text-gray-900 text-lg truncate">
                    {order.city}
                  </p>
                </div>

                {/* Product */}
                {order.productName && (
                  <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      المنتج
                    </p>
                    <p className="font-bold text-gray-900">
                      {order.productName}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="col-span-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4">
                  <p className="text-xs text-white/80 font-medium mb-1">
                    المبلغ الإجمالي
                  </p>
                  <p className="font-bold text-white text-2xl">
                    {order.total} درهم
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  تم تسجيل طلبك. ستظهر تفاصيل الطلب عبر الهاتف مع فريقنا.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
        {/* Registration confirmed */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={22} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              تم تسجيل طلبك بنجاح
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              الخطوة التالية: سنتواصل معك هاتفياً لتأكيد الطلب، وبعد تأكيده
              سيتم شحنه إليك.
            </p>
          </div>
        </div>

        {/* COD */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 flex items-start gap-4 border border-amber-200/50">
          <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              الدفع عند الاستلام
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              لن تدفع أي مبلغ إلا عند استلام طلبك.
            </p>
          </div>
        </div>

        {/* Keep phone available */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone size={22} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              يرجى إبقاء هاتفك متاحاً
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              حتى نتمكن من التواصل معك لتأكيد الطلب.
            </p>
          </div>
        </div>
      </div>

      {/* Back to store */}
      <div className="max-w-3xl mx-auto px-4 mt-8 pb-16">
        <Link
          href="/"
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-xl font-bold text-base tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={20} />
          العودة إلى المتجر
        </Link>

        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Truck size={14} />
            شحن سريع
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={14} />
            دعم عبر الهاتف
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            توصيل لباب المنزل
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
