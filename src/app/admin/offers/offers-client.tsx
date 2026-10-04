"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Star,
  Package,
  Tag,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Offer {
  id: number;
  name: string;
  nameAr: string | null;
  quantity: number;
  price: string;
  originalPrice: string | null;
  badge: string | null;
  badgeAr: string | null;
  isActive: boolean | null;
  isDefault: boolean | null;
  sortOrder: number | null;
}

export default function OffersClient() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    quantity: "1",
    price: "",
    originalPrice: "",
    badge: "",
    badgeAr: "",
    isActive: true,
    isDefault: false,
    sortOrder: "0",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers");
      const data = await res.json();
      setOffers(data.offers || []);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        name: offer.name,
        nameAr: offer.nameAr || "",
        quantity: String(offer.quantity),
        price: offer.price,
        originalPrice: offer.originalPrice || "",
        badge: offer.badge || "",
        badgeAr: offer.badgeAr || "",
        isActive: offer.isActive ?? true,
        isDefault: offer.isDefault ?? false,
        sortOrder: String(offer.sortOrder || 0),
      });
    } else {
      setEditingOffer(null);
      setFormData({
        name: "",
        nameAr: "",
        quantity: String(offers.length + 1),
        price: "",
        originalPrice: "",
        badge: "",
        badgeAr: "",
        isActive: true,
        isDefault: offers.length === 0,
        sortOrder: String(offers.length),
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert("يرجى ملء الحقول المطلوبة");
      return;
    }
    setSaving(true);
    const payload = {
      ...(editingOffer ? { id: editingOffer.id } : {}),
      name: formData.name,
      nameAr: formData.nameAr || null,
      quantity: parseInt(formData.quantity) || 1,
      price: formData.price,
      originalPrice: formData.originalPrice || null,
      badge: formData.badge || null,
      badgeAr: formData.badgeAr || null,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
      sortOrder: parseInt(formData.sortOrder) || 0,
    };
    const method = editingOffer ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/offers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const toggleOffer = async (offer: Offer) => {
    try {
      await fetch("/api/admin/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offer.id, isActive: !offer.isActive }),
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  };

  const setDefault = async (offer: Offer) => {
    try {
      await fetch("/api/admin/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offer.id, isDefault: !offer.isDefault }),
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to toggle default:", err);
    }
  };

  const moveSlide = async (offer: Offer, direction: "up" | "down") => {
    const idx = offers.findIndex((o) => o.id === offer.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= offers.length) return;
    const other = offers[swapIdx];
    try {
      await Promise.all([
        fetch("/api/admin/offers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: offer.id, sortOrder: other.sortOrder }),
        }),
        fetch("/api/admin/offers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: other.id, sortOrder: offer.sortOrder }),
        }),
      ]);
      await fetchData();
    } catch (err) {
      console.error("Failed to reorder:", err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة العروض</h1>
          <p className="text-gray-500 mt-1">تحكم كامل في العروض اللي كتظهر للزبائن</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-amber-500/20">
            <Plus size={18} />
            إضافة عرض جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
          <p className="text-sm text-gray-400">إجمالي العروض</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{offers.filter(o => o.isActive).length}</p>
          <p className="text-sm text-gray-400">عروض مفعلة</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-500">{offers.filter(o => !o.isActive).length}</p>
          <p className="text-sm text-gray-400">عروض معطلة</p>
        </div>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Tag size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد عروض بعد</h3>
          <p className="text-gray-400 mb-4">ابدأ بإنشاء أول عرض</p>
          <button onClick={() => openModal()} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-amber-600 transition-colors">
            إضافة عرض
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                !offer.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Order Buttons */}
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveSlide(offer, "up")} className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30" disabled={offer.sortOrder === 0}>
                    <ChevronUp size={16} />
                  </button>
                  <button onClick={() => moveSlide(offer, "down")} className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30">
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Quantity Badge */}
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 flex-shrink-0">
                  <div className="text-center">
                    <Package size={20} className="mx-auto" />
                    <span className="text-xs font-bold">{offer.quantity}x</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{offer.name}</h3>
                    {offer.isDefault && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} /> افتراضي
                      </span>
                    )}
                    {offer.badge && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {offer.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-amber-600">${offer.price}</span>
                    {offer.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${offer.originalPrice}</span>
                    )}
                  </div>
                  {offer.nameAr && <p className="text-sm text-gray-400" dir="rtl">{offer.nameAr}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Toggle Active */}
                  <button
                    onClick={() => toggleOffer(offer)}
                    className={`p-2 rounded-lg transition-colors ${offer.isActive ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"}`}
                    title={offer.isActive ? "تعطيل" : "تفعيل"}
                  >
                    {offer.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>

                  {/* Toggle Default */}
                  <button
                    onClick={() => setDefault(offer)}
                    className={`p-2 rounded-lg transition-colors ${offer.isDefault ? "text-amber-600 bg-amber-50 hover:bg-amber-100" : "text-gray-400 hover:bg-gray-100"}`}
                    title="تعيين كافتراضي"
                  >
                    <Star size={18} className={offer.isDefault ? "fill-amber-500" : ""} />
                  </button>

                  {/* Edit */}
                  <button onClick={() => openModal(offer)} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 size={18} />
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(offer.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingOffer ? "تعديل العرض" : "عرض جديد"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم العرض (EN) *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" placeholder="2 Pieces" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم العرض (AR) *</label>
                  <input type="text" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" dir="rtl" placeholder="قطعتان" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الكمية *</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">السعر *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">السعر القديم</label>
                  <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" step="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">نص Badge (EN)</label>
                  <input type="text" value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" placeholder="Save 20%" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">نص Badge (AR)</label>
                  <input type="text" value={formData.badgeAr} onChange={(e) => setFormData({ ...formData, badgeAr: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" dir="rtl" placeholder="خصم 20%" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الترتيب</label>
                  <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-amber-500 rounded" />
                    <span className="text-sm font-medium text-gray-700">مفعل</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="w-4 h-4 text-amber-500 rounded" />
                    <span className="text-sm font-medium text-gray-700">افتراضي</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingOffer ? "تحديث" : "إنشاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
