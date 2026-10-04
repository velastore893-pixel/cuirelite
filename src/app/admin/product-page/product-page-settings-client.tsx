"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, RefreshCw, Eye, EyeOff, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Settings {
  [key: string]: string;
}

const sections = [
  {
    title: "📋 عناصر صفحة المنتج",
    description: "تحكم في العناصر اللي كتظهر في صفحة المنتج",
    items: [
      { key: "pp_show_size_selector", label: "اختيار المقاس", desc: "إظهار/إخفاء أزرار المقاسات" },
      { key: "pp_show_color_selector", label: "اختيار اللون", desc: "إظهار/إخفاء أزرار الألوان" },
      { key: "pp_show_quantity", label: "الكمية", desc: "إظهار/إخفاء اختيار الكمية" },
      { key: "pp_show_material", label: "المادة", desc: "إظهار/إخفاء معلومات المادة" },
      { key: "pp_show_description", label: "الوصف", desc: "إظهار/إخفاء وصف المنتج" },
      { key: "pp_show_stock_info", label: "معلومات المخزون", desc: "إظهار/إخفاء عدد القطع المتبقية" },
      { key: "pp_show_wishlist", label: "زر المفضلة", desc: "إظهار/إخفاء زر القلب" },
      { key: "pp_show_breadcrumbs", label: "التنقل", desc: "إظهار/إخفاء مسار التنقل" },
      { key: "pp_show_social_share", label: "المشاركة", desc: "إظهار/إخفاء أزرار المشاركة" },
    ],
  },
  {
    title: "📦 معلومات الشحن والضمان",
    description: "ال badges اللي كتظهر تحت زر الطلب",
    items: [
      { key: "pp_show_shipping_info", label: "معلومات الشحن", desc: "إظهار/إخفاء معلومات الشحن" },
      { key: "pp_show_cod_badge", label: "badge الدفع عند الاستلام", desc: "💰 الدفع عند الاستلام" },
      { key: "pp_show_free_shipping_badge", label: "badge الشحن المجاني", desc: "🚚 شحن سريع" },
      { key: "pp_show_guarantee_badge", label: "badge الضمان", desc: "✅ ضمان" },
    ],
  },
  {
    title: "🛒 منتجات مشابهة",
    description: "إظهار/إخفاء قسم المنتجات المشابهة في أسفل الصفحة",
    items: [
      { key: "pp_show_related_products", label: "المنتجات المشابهة", desc: "إظهار قسم المنتجات المشابهة" },
    ],
  },
];

export default function ProductPageSettingsClient() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/product-page-settings");
      const data = await res.json();
      setSettings(data.settings || {});
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/product-page-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات صفحة المنتج</h1>
          <p className="text-gray-500 mt-1">تحكم كامل في العناصر اللي كتظهر في صفحة المنتج</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/products"
            target="_blank"
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            معاينة
          </Link>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle size={18} />
                تم الحفظ!
              </>
            ) : (
              <>
                <Save size={18} />
                {saving ? "جاري الحفظ..." : "حفظ جميع التغييرات"}
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{section.description}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {section.items.map((item) => {
                  const isEnabled = settings[item.key] === "true";
                  return (
                    <div key={item.key} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? "bg-green-100" : "bg-gray-100"}`}>
                          {isEnabled ? (
                            <Eye size={18} className="text-green-600" />
                          ) : (
                            <EyeOff size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(item.key)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${isEnabled ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isEnabled ? "translate-x-7" : "translate-x-0.5"}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
