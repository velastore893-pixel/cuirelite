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

interface Product {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  price: string;
  comparePrice: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: { name: string; hex: string }[] | null;
  stock: number | null;
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
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    slug: "",
    description: "",
    descriptionAr: "",
    price: "",
    comparePrice: "",
    categoryId: "",
    stock: "0",
    material: "",
    materialAr: "",
    images: "",
    mainImage: "",
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
        categoryId: product.categoryId?.toString() || "",
        stock: product.stock?.toString() || "0",
        material: product.material || "",
        materialAr: product.materialAr || "",
        images: product.images?.join(", ") || "",
        mainImage: product.images?.[0] || "",
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
        categoryId: "",
        stock: "0",
        material: "",
        materialAr: "",
        images: "",
        mainImage: "",
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
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      stock: parseInt(formData.stock as string),
      material: formData.material || null,
      materialAr: formData.materialAr || null,
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

              <div className="grid grid-cols-3 gap-4">
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
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
