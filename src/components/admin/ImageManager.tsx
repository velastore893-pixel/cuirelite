"use client";

import { useState, useRef, useCallback } from "react";
import {
  ImagePlus,
  Trash2,
  Star,
  Loader2,
  X,
  Upload,
  Eye,
  GripVertical,
} from "lucide-react";

interface ImageManagerProps {
  /** Main image URL (null/empty = not set) */
  mainImage: string;
  /** Gallery image URLs */
  galleryImages: string[];
  /** Called when main image changes */
  onMainImageChange: (url: string) => void;
  /** Called when gallery images change */
  onGalleryImagesChange: (urls: string[]) => void;
  /** Optional: called when images are uploaded (for DB tracking) */
  onUpload?: (urls: string[]) => void;
  disabled?: boolean;
}

export default function ImageManager({
  mainImage,
  galleryImages,
  onMainImageChange,
  onGalleryImagesChange,
  onUpload,
  disabled = false,
}: ImageManagerProps) {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  // ----------------------------------------------------------
  // Upload handler — uploads to /api/upload and returns the URL
  // ----------------------------------------------------------
  const uploadFiles = useCallback(
    async (files: FileList | File[]): Promise<string[]> => {
      const fileArray = Array.from(files);
      const urls: string[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        // Validate type
        const allowed = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/svg+xml",
        ];
        if (!allowed.includes(file.type)) {
          errors.push(`${file.name}: نوع الملف غير مدعوم`);
          continue;
        }

        // Validate size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          errors.push(`${file.name}: الحجم يتجاوز 20MB`);
          continue;
        }

        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (data.success && data.url) {
            urls.push(data.url);
          } else {
            errors.push(`${file.name}: ${data.error || "فشل الرفع"}`);
          }
        } catch {
          errors.push(`${file.name}: خطأ في الاتصال`);
        }
      }

      if (errors.length > 0) {
        setUploadError(errors.join(" | "));
      } else {
        setUploadError(null);
      }

      return urls;
    },
    []
  );

  // ----------------------------------------------------------
  // Main image upload
  // ----------------------------------------------------------
  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const urls = await uploadFiles([files[0]]);
    if (urls.length > 0) {
      onMainImageChange(urls[0]);
      if (onUpload) onUpload(urls);
    }
    setUploading(false);
    e.target.value = "";
  };

  // ----------------------------------------------------------
  // Gallery upload (multiple)
  // ----------------------------------------------------------
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const urls = await uploadFiles(files);
    if (urls.length > 0) {
      onGalleryImagesChange([...galleryImages, ...urls]);
      if (onUpload) onUpload(urls);
    }
    setUploading(false);
    e.target.value = "";
  };

  // ----------------------------------------------------------
  // Drag & Drop (desktop)
  // ----------------------------------------------------------
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newImages = [...galleryImages];
    const [moved] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, moved);
    onGalleryImagesChange(newImages);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------
  const deleteGalleryImage = (index: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    onGalleryImagesChange(galleryImages.filter((_, i) => i !== index));
  };

  const setAsMain = (index: number) => {
    const newMain = galleryImages[index];
    const newGallery = [...galleryImages];
    newGallery.splice(index, 1);
    // If there was a main image, add it to the gallery
    if (mainImage) {
      newGallery.unshift(mainImage);
    }
    onMainImageChange(newMain);
    onGalleryImagesChange(newGallery);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...galleryImages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[index],
    ];
    onGalleryImagesChange(newImages);
  };

  const openReplace = (index: number) => {
    setReplaceIndex(index);
    galleryInputRef.current?.click();
  };

  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || replaceIndex === null) return;

    setUploading(true);
    const urls = await uploadFiles([files[0]]);
    if (urls.length > 0) {
      const newImages = [...galleryImages];
      newImages[replaceIndex] = urls[0];
      onGalleryImagesChange(newImages);
    }
    setUploading(false);
    setReplaceIndex(null);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* MAIN PRODUCT IMAGE                                    */}
      {/* ==================================================== */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          الصورة الرئيسية للمنتج
        </label>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Preview */}
          <div className="w-full sm:w-48 h-48 sm:h-48 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex-shrink-0 relative group">
            {mainImage ? (
              <>
                <img
                  src={mainImage}
                  alt="الصورة الرئيسية"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(mainImage)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                    title="معاينة"
                  >
                    <Eye size={16} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMainImageChange("")}
                    disabled={disabled}
                    className="p-2 bg-red-500/80 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    title="حذف"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImagePlus size={32} className="mb-2" />
                <span className="text-xs">لا توجد صورة رئيسية</span>
              </div>
            )}
          </div>

          {/* Upload button */}
          <div className="flex-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              disabled={uploading || disabled}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  رفع الصورة الرئيسية
                </>
              )}
            </button>
            {mainImage && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("هل تريد استبدال الصورة الرئيسية؟")) {
                    mainInputRef.current?.click();
                  }
                }}
                disabled={uploading || disabled}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                استبدال الصورة
              </button>
            )}
            <p className="text-xs text-gray-400">
              JPG, PNG, WEBP, GIF, SVG — حد أقصى 20MB
            </p>
          </div>
        </div>

        <input
          ref={mainInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleMainUpload}
          className="hidden"
        />
      </div>

      {/* ==================================================== */}
      {/* GALLERY IMAGES                                        */}
      {/* ==================================================== */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            الصور الإضافية (معرض المنتج)
            {galleryImages.length > 0 && (
              <span className="mr-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {galleryImages.length} صور
              </span>
            )}
          </label>
        </div>

        {/* Upload button */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={uploading || disabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <ImagePlus size={18} />
              + إضافة صور
            </>
          )}
        </button>

        {/* Upload error */}
        {uploadError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {uploadError}
          </div>
        )}

        {/* Gallery grid */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {galleryImages.map((img, index) => (
              <div
                key={`${img}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 group cursor-move transition-all ${
                  dragOverIndex === index && dragIndex !== index
                    ? "border-amber-400 scale-105"
                    : dragIndex === index
                    ? "border-amber-400 opacity-50"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={img}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Drag handle */}
                <div className="absolute top-1 left-1 p-1 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={12} className="text-white" />
                </div>

                {/* Order number */}
                <div className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">
                    {index + 1}
                  </span>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 flex-wrap p-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(img)}
                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30"
                    title="معاينة"
                  >
                    <Eye size={14} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAsMain(index)}
                    className="p-1.5 bg-amber-500/80 rounded-lg hover:bg-amber-600"
                    title="تعيين كصورة رئيسية"
                  >
                    <Star size={14} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openReplace(index)}
                    className="p-1.5 bg-blue-500/80 rounded-lg hover:bg-blue-600"
                    title="استبدال"
                  >
                    <Upload size={14} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteGalleryImage(index)}
                    className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-600"
                    title="حذف"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>

                {/* Move buttons (touch-friendly) */}
                <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0}
                    className="p-1 bg-white/20 rounded hover:bg-white/30 disabled:opacity-30"
                    title="تحريك للأعلى"
                  >
                    <span className="text-white text-xs">↑</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, "down")}
                    disabled={index === galleryImages.length - 1}
                    className="p-1 bg-white/20 rounded hover:bg-white/30 disabled:opacity-30"
                    title="تحريك للأسفل"
                  >
                    <span className="text-white text-xs">↓</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          onChange={replaceIndex !== null ? handleReplaceUpload : handleGalleryUpload}
          className="hidden"
        />
      </div>

      {/* ==================================================== */}
      {/* IMAGE PREVIEW MODAL                                   */}
      {/* ==================================================== */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="معاينة"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
