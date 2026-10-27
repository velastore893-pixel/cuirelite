"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Search,
  X,
  Save,
  RefreshCw,
  Upload,
  ImagePlus,
  Loader2,
} from "lucide-react";
import ImageManager from "@/components/admin/ImageManager";
import { createClient } from "@supabase/supabase-js";

interface Product {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  price: string;
  comparePrice: string | null;
  images: string[] | null;
  videoUrl: string | null;
  sizes: string[] | null;
  colors: { name: string; hex: string }[] | null;
  stock: number | null;
  quantityDiscount: number | null;
  isActive: boolean | null;
  isFeatured: boolean | null;
  isNewArrival: boolean | null;
  material: string | null;
  materialAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  categoryId: number | null;
}

interface Category {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  parentId: number | null;
  isActive: boolean | null;
  sortOrder: number | null;
}

export default function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    slug: "",
    description: "",
    descriptionAr: "",
    price: "",
    comparePrice: "",
    mainCategoryId: "",
    categoryId: "",
    stock: "0",
    quantityDiscount: "0",
    material: "",
    materialAr: "",
    images: "",
    mainImage: "",
    videoUrl: "",
    sizes: "",
    colors: "[]",
    customColorHex: "#000000",
    customColorName: "",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const currentImages = formData.images
          ? formData.images.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
        const newImages = [...currentImages, ...uploadedUrls];
        setFormData({ ...formData, images: newImages.join(", ") });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };


  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please choose a video file.");
      e.target.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert("Video must be smaller than 100 MB.");
      e.target.value = "";
      return;
    }

    setUploadingVideo(true);

    try {
      const signRes = await fetch("/api/upload-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      const signData = await signRes.json();

      if (
        !signRes.ok ||
        !signData.success ||
        !signData.bucket ||
        !signData.path ||
        !signData.token ||
        !signData.publicUrl ||
        !signData.supabaseUrl ||
        !signData.publicAnonKey
      ) {
        throw new Error(signData.error || "Could not prepare video upload.");
      }

      const supabase = createClient(
        signData.supabaseUrl,
        signData.publicAnonKey
      );

      const { error: uploadError } = await supabase.storage
        .from(signData.bucket)
        .uploadToSignedUrl(signData.path, signData.token, file, {
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      setFormData((prev) => ({
        ...prev,
        videoUrl: signData.publicUrl,
      }));
    } catch (err) {
      console.error("Video upload failed:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to upload product video."
      );
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const currentImages = formData.images
      ? formData.images.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
    currentImages.splice(index, 1);
    setFormData({ ...formData, images: currentImages.join(", ") });
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameAr && p.nameAr.includes(searchQuery))
  );

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        nameAr: product.nameAr || "",
        slug: product.slug,
        description: product.description || "",
        descriptionAr: product.descriptionAr || "",
        price: product.price,
        comparePrice: product.comparePrice || "",
        mainCategoryId: (() => {
          const selectedCategory = categories.find(
            (cat) => cat.id === product.categoryId
          );
          if (!selectedCategory) return "";
          return selectedCategory.parentId
            ? selectedCategory.parentId.toString()
            : selectedCategory.id.toString();
        })(),
        categoryId: (() => {
          const selectedCategory = categories.find(
            (cat) => cat.id === product.categoryId
          );
          return selectedCategory?.parentId
            ? selectedCategory.id.toString()
            : "";
        })(),
        stock: product.stock?.toString() || "0",
        quantityDiscount: product.quantityDiscount?.toString() || "0",
        material: product.material || "",
        materialAr: product.materialAr || "",
        images: product.images?.join(", ") || "",
        mainImage: product.images?.[0] || "",
        videoUrl: product.videoUrl || "",
        sizes: product.sizes?.join(", ") || "",
        colors: JSON.stringify(product.colors || []),
        customColorHex: "#000000",
        customColorName: "",
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isNewArrival: product.isNewArrival ?? false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        nameAr: "",
        slug: "",
        description: "",
        descriptionAr: "",
        price: "",
        comparePrice: "",
        mainCategoryId: "",
        categoryId: "",
        stock: "0",
        quantityDiscount: "0",
        material: "",
        materialAr: "",
        images: "",
        mainImage: "",
        videoUrl: "",
        sizes: "",
        colors: "[]",
        customColorHex: "#000000",
        customColorName: "",
        isActive: true,
        isFeatured: false,
        isNewArrival: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const selectedMainId = formData.mainCategoryId
      ? parseInt(formData.mainCategoryId)
      : null;

    const childCategories = selectedMainId
      ? categories.filter(
          (cat) =>
            cat.parentId === selectedMainId &&
            cat.isActive !== false
        )
      : [];

    if (!selectedMainId) {
      alert("Please select a main category.");
      return;
    }

    if (childCategories.length > 0 && !formData.categoryId) {
      alert("Please select a subcategory.");
      return;
    }

    const finalCategoryId = formData.categoryId
      ? parseInt(formData.categoryId)
      : selectedMainId;

    const quantityDiscountValue = Number(formData.quantityDiscount || 0);

    if (
      !Number.isFinite(quantityDiscountValue) ||
      quantityDiscountValue < 0
    ) {
      alert("Extra item discount must be 0 or greater.");
      return;
    }

    setSaving(true);

    const payload = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: formData.name,
      nameAr: formData.nameAr || null,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description || null,
      descriptionAr: formData.descriptionAr || null,
      price: formData.price,
      comparePrice: formData.comparePrice || null,
      categoryId: finalCategoryId,
      stock: parseInt(formData.stock as string),
      quantityDiscount: Math.round(quantityDiscountValue),
      material: formData.material || null,
      materialAr: formData.materialAr || null,
      videoUrl: formData.videoUrl || null,
      images: (() => {
        const gallery = formData.images
          ? (formData.images as string).split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const main = (formData.mainImage as string) || "";
        // Main image always goes first in the images array
        if (main) {
          return [main, ...gallery.filter((g: string) => g !== main)];
        }
        return gallery;
      })(),
      sizes: formData.sizes
        ? (formData.sizes as string).split(",").map((s) => s.trim())
        : [],
      colors: formData.colors
        ? JSON.parse(formData.colors as string)
        : [],
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
    };

    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refetch all products to ensure consistency
        await fetchData();
        setIsModalOpen(false);
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          isFeatured: !product.isFeatured,
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
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
            className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-14 bg-gray-100 rounded-lg bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.images?.[0] || "/images/placeholder.jpg"})`,
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.nameAr}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">${product.price}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          ${product.comparePrice}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          (product.stock || 0) < 10
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                        {product.isFeatured && (
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFeatured(product)}
                          className="p-2 text-gray-400 hover:text-yellow-500 rounded-lg hover:bg-yellow-50 transition-colors"
                          title="Toggle Featured"
                        >
                          <Star
                            size={16}
                            className={product.isFeatured ? "fill-yellow-400 text-yellow-400" : ""}
                          />
                        </button>
                        <button
                          onClick={() => openModal(product)}
                          className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (AR)</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  placeholder="auto-generated-from-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (AR)</label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra Item Discount (DH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantityDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantityDiscount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                    placeholder="0"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Example: 40 = each extra item saves 40 DH.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Main Category
                  </label>

                  <select
                    value={formData.mainCategoryId}
                    onChange={(e) => {
                      const mainId = e.target.value;

                      setFormData({
                        ...formData,
                        mainCategoryId: mainId,
                        categoryId: "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                  >
                    <option value="">Select main category</option>

                    {categories
                      .filter(
                        (cat) =>
                          cat.parentId == null &&
                          cat.isActive !== false
                      )
                      .sort(
                        (a, b) =>
                          (a.sortOrder ?? 0) -
                            (b.sortOrder ?? 0) ||
                          a.name.localeCompare(b.name)
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>

                  {formData.mainCategoryId &&
                    categories.some(
                      (cat) =>
                        cat.parentId ===
                          parseInt(formData.mainCategoryId) &&
                        cat.isActive !== false
                    ) && (
                      <div className="mt-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subcategory
                        </label>

                        <select
                          value={formData.categoryId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoryId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                        >
                          <option value="">
                            Select subcategory
                          </option>

                          {categories
                            .filter(
                              (cat) =>
                                cat.parentId ===
                                  parseInt(
                                    formData.mainCategoryId
                                  ) &&
                                cat.isActive !== false
                            )
                            .sort(
                              (a, b) =>
                                (a.sortOrder ?? 0) -
                                  (b.sortOrder ?? 0) ||
                                a.name.localeCompare(b.name)
                            )
                            .map((cat) => (
                              <option
                                key={cat.id}
                                value={cat.id}
                              >
                                {cat.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                  {formData.mainCategoryId &&
                    !categories.some(
                      (cat) =>
                        cat.parentId ===
                          parseInt(formData.mainCategoryId) &&
                        cat.isActive !== false
                    ) && (
                      <p className="text-xs text-gray-400 mt-2">
                        This main category has no subcategories,
                        so the product will be assigned directly to it.
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="">Select material</option>
                    <option value="Genuine Leather">Genuine Leather</option>
                    <option value="Faux Leather">Faux Leather</option>
                    <option value="Suede">Suede</option>
                    <option value="Patent Leather">Patent Leather</option>
                    <option value="Nappa Leather">Nappa Leather</option>
                    <option value="Lambskin">Lambskin</option>
                    <option value="Cowhide">Cowhide</option>
                    <option value="Goatskin">Goatskin</option>
                  </select>
                </div>
              </div>

              {/* Images Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  صور المنتج
                </label>
                <ImageManager
                  mainImage={formData.mainImage || ""}
                  galleryImages={
                    formData.images
                      ? (formData.images as string).split(",").map((s) => s.trim()).filter(Boolean)
                      : []
                  }
                  onMainImageChange={(url: string) =>
                    setFormData((prev) => ({ ...prev, mainImage: url }))
                  }
                  onGalleryImagesChange={(urls: string[]) =>
                    setFormData((prev) => ({ ...prev, images: urls.join(", ") }))
                  }
                  disabled={saving}
                />
              </div>

              {/* Product Video */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  فيديو المنتج
                </label>

                {formData.videoUrl ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <video
                      src={formData.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full max-h-[360px] rounded-lg bg-black object-contain"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500 truncate">
                        الفيديو مرفوع وجاهز للظهور داخل معرض المنتج
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            videoUrl: "",
                          }))
                        }
                        className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        حذف الفيديو
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
                      uploadingVideo
                        ? "border-amber-300 bg-amber-50 cursor-wait"
                        : "border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/40"
                    }`}
                  >
                    {uploadingVideo ? (
                      <>
                        <Loader2 size={24} className="mb-2 animate-spin text-amber-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          جاري رفع الفيديو...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="mb-2 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">
                          Upload Product Video
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                          MP4 / WebM / MOV — حتى 100 MB
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo || saving}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المقاسات المتاحة
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["XS", "S", "M", "L", "XL", "XXL", "One Size"].map((size) => {
                    const currentSizes = formData.sizes
                      ? formData.sizes.split(",").map((s: string) => s.trim().toUpperCase())
                      : [];
                    const isSelected = currentSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          let newSizes: string[];
                          if (isSelected) {
                            newSizes = currentSizes.filter((s) => s !== size);
                          } else {
                            newSizes = [...currentSizes, size];
                          }
                          setFormData({ ...formData, sizes: newSizes.join(", ") });
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          isSelected
                            ? "border-accent bg-accent text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent text-gray-500"
                  placeholder="أو اكتب مقاسات مخصصة مفصولة بفاصلة"
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الألوان المتاحة
                </label>
                {/* Preset Colors */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { name: "أسود", hex: "#000000" },
                    { name: "أبيض", hex: "#FFFFFF" },
                    { name: "بني", hex: "#8B4513" },
                    { name: "أحمر", hex: "#FF0000" },
                    { name: "أزرق", hex: "#0000FF" },
                    { name: "أخضر", hex: "#008000" },
                    { name: "رمادي", hex: "#808080" },
                    { name: "بيج", hex: "#F5F5DC" },
                    { name: "كحلي", hex: "#000080" },
                    { name: "وردي", hex: "#FFC0CB" },
                    { name: "ذهبي", hex: "#FFD700" },
                    { name: "نحاسي", hex: "#B87333" },
                  ].map((color) => {
                    const currentColors = formData.colors
                      ? JSON.parse(formData.colors || "[]")
                      : [];
                    const isSelected = currentColors.some(
                      (c: { name: string; hex: string }) => c.hex === color.hex
                    );
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => {
                          let newColors: { name: string; hex: string }[];
                          if (isSelected) {
                            newColors = currentColors.filter(
                              (c: { name: string; hex: string }) => c.hex !== color.hex
                            );
                          } else {
                            newColors = [...currentColors, color];
                          }
                          setFormData({ ...formData, colors: JSON.stringify(newColors) });
                        }}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-amber-500 scale-110 shadow-md"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {isSelected && (
                          <span className={`text-xs ${color.hex === "#FFFFFF" || color.hex === "#F5F5DC" ? "text-black" : "text-white"}`}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Custom Color */}
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.customColorHex || "#000000"}
                    onChange={(e) => setFormData({ ...formData, customColorHex: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.customColorName || ""}
                    onChange={(e) => setFormData({ ...formData, customColorName: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                    placeholder="اسم اللون المخصص"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.customColorName) {
                        const currentColors = formData.colors
                          ? JSON.parse(formData.colors || "[]")
                          : [];
                        const newColor = {
                          name: formData.customColorName,
                          hex: formData.customColorHex || "#000000",
                        };
                        if (!currentColors.some((c: { hex: string }) => c.hex === newColor.hex)) {
                          setFormData({
                            ...formData,
                            colors: JSON.stringify([...currentColors, newColor]),
                            customColorName: "",
                            customColorHex: "#000000",
                          });
                        }
                      }
                    }}
                    className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
                  >
                    إضافة
                  </button>
                </div>
                {/* Selected Colors */}
                {formData.colors && JSON.parse(formData.colors).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {JSON.parse(formData.colors).map((color: { name: string; hex: string }) => (
                      <div key={color.hex} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                        <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }} />
                        <span className="text-xs text-gray-600">{color.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = JSON.parse(formData.colors || "[]").filter(
                              (c: { hex: string }) => c.hex !== color.hex
                            );
                            setFormData({ ...formData, colors: JSON.stringify(newColors) });
                          }}
                          className="text-gray-400 hover:text-red-500 text-xs ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-accent rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-accent rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="w-4 h-4 text-accent rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">New Arrival</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
