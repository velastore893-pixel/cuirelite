"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Eye, EyeOff, Star, ArrowUp, ArrowDown, Tag } from "lucide-react";

interface Product {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  price: string;
}

interface Offer {
  id: number;
  productId: number | null;
  name: string;
  nameAr: string | null;
  quantity: number;
  price: string;
  originalPrice: string | null;
  promoText: string | null;
  promoTextAr: string | null;
  isActive: boolean | null;
  isDefault: boolean | null;
  sortOrder: number | null;
}

export default function ProductOffersClient() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    nameAr: "",
    quantity: "1",
    price: "",
    originalPrice: "",
    promoText: "",
    promoTextAr: "",
    isActive: true,
    isDefault: false,
    sortOrder: "0",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = selectedProduct === "all"
        ? "/api/admin/product-offers"
        : `/api/admin/product-offers?productId=${selectedProduct}`;
      const [offersRes, productsRes] = await Promise.all([
        fetch(url),
        fetch("/api/admin/products"),
      ]);
      const offersData = await offersRes.json();
      const productsData = await productsRes.json();
      setOffers(offersData.offers || []);
      setProducts(productsData.products || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProduct]);

  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        productId: offer.productId?.toString() || "",
        name: offer.name,
        nameAr: offer.nameAr || "",
        quantity: offer.quantity.toString(),
        price: offer.price,
        originalPrice: offer.originalPrice || "",
        promoText: offer.promoText || "",
        promoTextAr: offer.promoTextAr || "",
        isActive: offer.isActive ?? true,
        isDefault: offer.isDefault ?? false,
        sortOrder: (offer.sortOrder || 0).toString(),
      });
    } else {
      setEditingOffer(null);
      setFormData({
        productId: selectedProduct !== "all" ? selectedProduct : "",
        name: "",
        nameAr: "",
        quantity: "1",
        price: "",
        originalPrice: "",
        promoText: "",
        promoTextAr: "",
        isActive: true,
        isDefault: false,
        sortOrder: (offers.length).toString(),
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.name || !formData.price) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    const payload = {
      ...(editingOffer ? { id: editingOffer.id } : {}),
      productId: Number(formData.productId),
      name: formData.name,
      nameAr: formData.nameAr || null,
      quantity: Number(formData.quantity),
      price: formData.price,
      originalPrice: formData.originalPrice || null,
      promoText: formData.promoText || null,
      promoTextAr: formData.promoTextAr || null,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
      sortOrder: Number(formData.sortOrder),
    };
    const method = editingOffer ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/product-offers", {
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
      const res = await fetch(`/api/admin/product-offers?id=${id}`, { method: "DELETE" });
      if (res.ok) setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const toggleActive = async (offer: Offer) => {
    try {
      const res = await fetch("/api/admin/product-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offer.id, isActive: !offer.isActive }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  };

  const setAsDefault = async (offer: Offer) => {
    try {
      const res = await fetch("/api/admin/product-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offer.id, isDefault: true, productId: offer.productId }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Failed to set default:", err);
    }
  };

  const getProductName = (productId: number | null) => {
    if (!productId) return "غير محدد";
    const product = products.find((p) => p.id === productId);
    return product ? (product.nameAr || product.name) : "غير معروف";
  };

  // Group offers by product
  const groupedOffers = offers.reduce((acc, offer) => {
    const pid = offer.productId || 0;
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(offer);
    return acc;
  }, {} as Record<number, Offer[]>);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">العروض والباقات</h1>
          <p className="text-gray-500 mt-1">أنشئ عروض متنوعة لكل منتج وتحكم فيها</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-lg shadow-amber-500/20">
            <Plus size={18} />
            إضافة عرض جديد
          </button>
        </div>
      </div>

      {/* Filter by Product */}
      <div className="mb-6">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="all">جميع المنتجات</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.nameAr || p.name}</option>
          ))}
        </select>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Tag size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد عروض بعد</h3>
          <p className="text-gray-400 mb-6">أنشئ أول عرض لبدء العرض على المنتجات</p>
          <button onClick={() => openModal()} className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-medium text-sm">
            <Plus size={16} /> إضافة عرض
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedOffers).map(([productId, productOffers]) => (
            <div key={productId} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Tag size={16} className="text-amber-500" />
                  {getProductName(Number(productId))}
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {productOffers.map((offer) => (
                  <div key={offer.id} className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${!offer.isActive ? "opacity-50" : ""}`}>
                    {/* Quantity Badge */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${offer.isActive ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
                      {offer.quantity}x
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{offer.name}</h4>
                        {offer.isDefault && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">افتراضي</span>
                        )}
                      </div>
                      {offer.nameAr && <p className="text-sm text-gray-400">{offer.nameAr}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-bold text-amber-600">${offer.price}</span>
                        {offer.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">${offer.originalPrice}</span>
                        )}
                        {offer.promoText && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{offer.promoTextAr || offer.promoText}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(offer)} className={`p-2 rounded-lg transition-colors ${offer.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                        {offer.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button onClick={() => setAsDefault(offer)} className={`p-2 rounded-lg transition-colors ${offer.isDefault ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}>
                        <Star size={18} className={offer.isDefault ? "fill-current" : ""} />
                      </button>
                      <button onClick={() => openModal(offer)} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(offer.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingOffer ? "تعديل العرض" : "عرض جديد"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Product */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المنتج *</label>
                <select value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500">
                  <option value="">اختر المنتج</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.nameAr || p.name} (${p.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم العرض (EN) *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" placeholder="Single Offer" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم العرض (AR)</label>
                  <input type="text" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" dir="rtl" placeholder="عرض قطعة واحدة" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الكمية *</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">السعر *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" step="0.01" placeholder="299.99" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">السعر القديم</label>
                  <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" step="0.01" placeholder="399.99" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الترتيب</label>
                  <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">النص الترويجي (EN)</label>
                  <input type="text" value={formData.promoText} onChange={(e) => setFormData({ ...formData, promoText: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" placeholder="Best Value" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">النص الترويجي (AR)</label>
                  <input type="text" value={formData.promoTextAr} onChange={(e) => setFormData({ ...formData, promoTextAr: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" dir="rtl" placeholder="الأفضل قيمة" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">مفعّل</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })} className={`relative w-12 h-6 rounded-full transition-colors ${formData.isDefault ? "bg-amber-500" : "bg-gray-300"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isDefault ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">افتراضي</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                <Save size={16} /> {saving ? "جاري الحفظ..." : editingOffer ? "تحديث" : "إنشاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
