"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Star, MessageSquare } from "lucide-react";

interface Testimonial {
  id: number;
  customerName: string;
  customerCity: string | null;
  rating: number | null;
  text: string;
  isActive: boolean | null;
  sortOrder: number | null;
}

export default function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerCity: "",
    rating: "5",
    text: "",
    isActive: true,
    sortOrder: "0",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item?: Testimonial) => {
    if (item) {
      setEditing(item);
      setForm({
        customerName: item.customerName,
        customerCity: item.customerCity || "",
        rating: (item.rating || 5).toString(),
        text: item.text,
        isActive: item.isActive ?? true,
        sortOrder: (item.sortOrder || 0).toString(),
      });
    } else {
      setEditing(null);
      setForm({ customerName: "", customerCity: "", rating: "5", text: "", isActive: true, sortOrder: "0" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.customerName || !form.text) { alert("يرجى ملء الحقول المطلوبة"); return; }
    setSaving(true);
    const payload = {
      ...(editing ? { id: editing.id } : {}),
      customerName: form.customerName,
      customerCity: form.customerCity || null,
      rating: parseInt(form.rating),
      text: form.text,
      isActive: form.isActive,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { await fetchData(); setIsModalOpen(false); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقييمات الزبائن</h1>
          <p className="text-gray-500 mt-1">إدارة تقييمات وآراء الزبائن</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-lg shadow-amber-500/20">
            <Plus size={18} /> إضافة تقييم
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد تقييمات بعد</h3>
          <p className="text-gray-400 mb-4">أضف أول تقييم من زبون</p>
          <button onClick={() => openModal()} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-medium text-sm">إضافة تقييم</button>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className={`bg-white rounded-xl p-5 shadow-sm flex items-start gap-4 ${!t.isActive ? "opacity-50" : ""}`}>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-lg flex-shrink-0">
                {t.customerName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{t.customerName}</h3>
                  {t.customerCity && <span className="text-xs text-gray-400">📍 {t.customerCity}</span>}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < (t.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">"{t.text}"</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(t)} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? "تعديل التقييم" : "تقييم جديد"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم الزبون *</label>
                  <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" placeholder="fatima el amrani" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">المدينة</label>
                  <input type="text" value={form.customerCity} onChange={(e) => setForm({ ...form, customerCity: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" placeholder="الدار البيضاء" dir="rtl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">التقييم</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setForm({ ...form, rating: r.toString() })}>
                      <Star size={24} className={r <= parseInt(form.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">نص التقييم *</label>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" rows={3} dir="rtl" placeholder="جاكيت ممتاز، الجودة خيالية والتوصيل سريع!" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-amber-500 rounded" />
                <span className="text-sm font-medium text-gray-700">مفعّل</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                <Save size={16} /> {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
