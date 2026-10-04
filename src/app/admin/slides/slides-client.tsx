"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Image,
  RefreshCw,
  GripVertical,
  ImagePlus,
  Loader2,
} from "lucide-react";

interface Slide {
  id: number;
  title: string | null;
  titleAr: string | null;
  subtitle: string | null;
  subtitleAr: string | null;
  image: string | null;
  link: string | null;
  isActive: boolean | null;
  order: number | null;
}

export default function AdminSlidesClient() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slideForm, setSlideForm] = useState({
    title: "",
    titleAr: "",
    subtitle: "",
    subtitleAr: "",
    image: "",
    link: "",
    isActive: true,
    order: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/slides");
      const data = await res.json();
      setSlides(data.slides || []);
    } catch (err) {
      console.error("Failed to fetch slides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteImage = async () => {
    if (!slideForm.image) return;
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    try {
      const filename = slideForm.image.split("/").pop();
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      setSlideForm((prev) => ({ ...prev, image: "" }));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSlideForm((prev) => ({ ...prev, image: data.url }));
      } else {
        alert(data.error || "Failed to upload");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const openModal = (slide?: Slide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideForm({
        title: slide.title || "",
        titleAr: slide.titleAr || "",
        subtitle: slide.subtitle || "",
        subtitleAr: slide.subtitleAr || "",
        image: slide.image || "",
        link: slide.link || "",
        isActive: slide.isActive ?? true,
        order: slide.order || 0,
      });
    } else {
      setEditingSlide(null);
      setSlideForm({
        title: "",
        titleAr: "",
        subtitle: "",
        subtitleAr: "",
        image: "",
        link: "",
        isActive: true,
        order: slides.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...(editingSlide ? { id: editingSlide.id } : {}),
      ...slideForm,
    };
    const method = editingSlide ? "PUT" : "POST";

    try {
      const res = await fetch("/api/admin/slides", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchData();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save slide:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    try {
      const res = await fetch(`/api/admin/slides?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete slide:", err);
    }
  };

  const toggleActive = async (slide: Slide) => {
    try {
      const res = await fetch("/api/admin/slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id, isActive: !slide.isActive }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Failed to toggle slide:", err);
    }
  };

  const moveSlide = async (slide: Slide, direction: "up" | "down") => {
    const currentIdx = slides.findIndex((s) => s.id === slide.id);
    const swapIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1;
    if (swapIdx < 0 || swapIdx >= slides.length) return;

    const other = slides[swapIdx];
    try {
      await Promise.all([
        fetch("/api/admin/slides", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: slide.id, order: other.order }),
        }),
        fetch("/api/admin/slides", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: other.id, order: slide.order }),
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
          <h1 className="text-3xl font-bold text-gray-900">Hero Slider</h1>
          <p className="text-gray-500 mt-1">Manage your homepage slider images and content</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={18} />
            Add New Slide
          </button>
        </div>
      </div>

      {/* Slides List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading slides...</span>
          </div>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No slides yet</h3>
          <p className="text-gray-400 mb-6">Create your first hero slide to get started</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={18} />
            Create First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
                !slide.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-stretch">
                {/* Drag Handle */}
                <div className="w-12 bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <GripVertical size={16} className="text-gray-300" />
                </div>

                {/* Image Preview */}
                <div
                  className="w-48 h-36 bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url(${slide.image || "/images/placeholder.jpg"})`,
                  }}
                />

                {/* Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          Slide #{index + 1}
                        </span>
                        {slide.isActive ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Eye size={10} /> Active
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <EyeOff size={10} /> Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {slide.title || "No title"}
                      </h3>
                      {slide.titleAr && (
                        <p className="text-gray-500 mt-0.5" dir="rtl">
                          {slide.titleAr}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                        {slide.subtitle || "No subtitle"}
                      </p>
                      {slide.link && (
                        <p className="text-xs text-amber-600 mt-2">
                          🔗 {slide.link}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => moveSlide(slide, "up")}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move Up"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => moveSlide(slide, "down")}
                        disabled={index === slides.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move Down"
                      >
                        <ChevronDown size={18} />
                      </button>
                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      <button
                        onClick={() => toggleActive(slide)}
                        className={`p-2 rounded-lg transition-colors ${
                          slide.isActive
                            ? "text-green-600 hover:bg-green-50"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                        title={slide.isActive ? "Deactivate" : "Activate"}
                      >
                        {slide.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => openModal(slide)}
                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSlide ? "Edit Slide" : "Add New Slide"}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {editingSlide ? "Update slide content and settings" : "Create a new hero slide"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Image Preview with Delete */}
              {slideForm.image && (
                <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${slideForm.image})` }}
                  />
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صورة السلايدر *</label>
                {/* Preview */}
                {slideForm.image && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 mb-3">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${slideForm.image})` }} />
                  </div>
                )}
                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all text-sm font-medium text-gray-600 mb-3">
                  {uploadingImage ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-amber-500" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <ImagePlus size={20} />
                      اضغط هنا لاختيار صورة من الحاسوب
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                </label>
                <span className="text-xs text-gray-400 block mb-3">JPG, PNG, WebP (حد أقصى 20MB)</span>
                {/* Manual URL */}
                <input
                  type="text"
                  value={slideForm.image}
                  onChange={(e) => setSlideForm({ ...slideForm, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all"
                  placeholder="أو الصق رابط الصورة هنا"
                />
              </div>

              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={slideForm.title}
                    onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                    placeholder="New Collection 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title (Arabic)
                  </label>
                  <input
                    type="text"
                    value={slideForm.titleAr}
                    onChange={(e) => setSlideForm({ ...slideForm, titleAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                    dir="rtl"
                    placeholder="مجموعة جديدة 2025"
                  />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtitle (English)
                  </label>
                  <textarea
                    value={slideForm.subtitle}
                    onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
                    rows={2}
                    placeholder="Discover our premium leather jackets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtitle (Arabic)
                  </label>
                  <textarea
                    value={slideForm.subtitleAr}
                    onChange={(e) => setSlideForm({ ...slideForm, subtitleAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
                    rows={2}
                    dir="rtl"
                    placeholder="اكتشفي جاكيتات الجلد الفاخرة"
                  />
                </div>
              </div>

              {/* Link & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={slideForm.link}
                    onChange={(e) => setSlideForm({ ...slideForm, link: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                    placeholder="/products"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={slideForm.order}
                    onChange={(e) => setSlideForm({ ...slideForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                    min="0"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSlideForm({ ...slideForm, isActive: !slideForm.isActive })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    slideForm.isActive ? "bg-amber-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      slideForm.isActive ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {slideForm.isActive ? "Active" : "Inactive"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {slideForm.isActive
                      ? "This slide is visible on the homepage"
                      : "This slide is hidden from the homepage"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !slideForm.image}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                <Save size={16} />
                {saving ? "Saving..." : editingSlide ? "Update Slide" : "Create Slide"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
