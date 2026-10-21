"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  RefreshCw,
  ImagePlus,
  Loader2,
  ArrowLeft,
  FolderTree,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  isActive: boolean | null;
  sortOrder: number | null;
  createdAt: Date | null;
}

type FormState = {
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  nameAr: "",
  slug: "",
  description: "",
  image: "",
  parentId: "",
  sortOrder: "0",
  isActive: true,
};

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // null = show the 4 main categories
  // number = show only the subcategories inside that main category
  const [selectedMainId, setSelectedMainId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormState>(emptyForm);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }

      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mainCategories = useMemo(
    () =>
      categories
        .filter((category) => category.parentId == null)
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
            a.name.localeCompare(b.name)
        ),
    [categories]
  );

  const selectedMain = useMemo(
    () =>
      selectedMainId == null
        ? null
        : categories.find((category) => category.id === selectedMainId) || null,
    [categories, selectedMainId]
  );

  const visibleSubcategories = useMemo(
    () =>
      selectedMainId == null
        ? []
        : categories
            .filter((category) => category.parentId === selectedMainId)
            .sort(
              (a, b) =>
                (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
                a.name.localeCompare(b.name)
            ),
    [categories, selectedMainId]
  );

  const createSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          image: data.url,
        }));
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

  const handleDeleteImage = () => {
    if (!formData.image) return;
    if (!confirm("هل أنت متأكد من إزالة هذه الصورة؟")) return;

    // We only clear the image from the category here.
    // This avoids deleting a shared uploaded file accidentally.
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const openModal = (
    category?: Category,
    forcedParentId?: number | null
  ) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        nameAr: category.nameAr || "",
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        parentId:
          category.parentId == null ? "" : String(category.parentId),
        sortOrder: String(category.sortOrder ?? 0),
        isActive: category.isActive ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        ...emptyForm,
        parentId:
          forcedParentId == null ? "" : String(forcedParentId),
      });
    }

    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...(editingCategory ? { id: editingCategory.id } : {}),
        name: formData.name.trim(),
        nameAr: formData.nameAr.trim() || null,
        slug:
          formData.slug.trim() ||
          createSlug(formData.name) ||
          `category-${Date.now()}`,
        description: formData.description.trim() || null,
        image: formData.image || null,
        parentId: formData.parentId ? Number(formData.parentId) : null,
        sortOrder: Number(formData.sortOrder || 0),
        isActive: formData.isActive,
      };

      if (
        editingCategory &&
        payload.parentId === editingCategory.id
      ) {
        alert("A category cannot be its own parent.");
        return;
      }

      const res = await fetch("/api/admin/categories", {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save category");
      }

      await fetchData();
      setIsModalOpen(false);
      setEditingCategory(null);

      // If we just created a subcategory from inside a main category,
      // remain inside that main category.
      if (payload.parentId != null) {
        setSelectedMainId(payload.parentId);
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const children = categories.filter(
      (item) => item.parentId === category.id
    );

    const message =
      children.length > 0
        ? `"${category.name}" contains ${children.length} subcategories. If you delete it, those subcategories will become main categories. Continue?`
        : `Delete "${category.name}"?`;

    if (!confirm(message)) return;

    try {
      const res = await fetch(
        `/api/admin/categories?id=${category.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      if (selectedMainId === category.id) {
        setSelectedMainId(null);
      }

      await fetchData();
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete category"
      );
    }
  };

  const CategoryCard = ({
    category,
    isMain,
  }: {
    category: Category;
    isMain: boolean;
  }) => {
    const childCount = categories.filter(
      (item) => item.parentId === category.id
    ).length;

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div
          className="h-44 bg-cover bg-center bg-gray-100"
          style={{
            backgroundImage: `url(${
              category.image || "/images/placeholder.jpg"
            })`,
          }}
        />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-bold text-gray-900">
                {category.name}
              </h3>

              {category.nameAr && (
                <p className="text-sm text-gray-400 mt-1" dir="rtl">
                  {category.nameAr}
                </p>
              )}
            </div>

            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                category.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
            {category.description || "No description"}
          </p>

          {isMain && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
              <FolderTree size={16} />
              {childCount} subcategories
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {isMain && (
              <button
                type="button"
                onClick={() => setSelectedMainId(category.id)}
                className="flex-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-dark"
              >
                Manage Subcategories
              </button>
            )}

            <button
              type="button"
              onClick={() => openModal(category)}
              className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(category)}
              className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          {selectedMain ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedMainId(null)}
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft size={16} />
                Back to Main Categories
              </button>

              <h1 className="text-3xl font-bold text-gray-900">
                {selectedMain.name}
              </h1>

              <p className="text-gray-500 mt-1">
                Manage the subcategories inside {selectedMain.name}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                Main Categories
              </h1>

              <p className="text-gray-500 mt-1">
                Only the main categories are shown here. Open one to manage what is inside it.
              </p>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <button
            onClick={() =>
              openModal(
                undefined,
                selectedMain ? selectedMain.id : null
              )
            }
            className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-3 rounded-xl font-medium text-sm"
          >
            <Plus size={18} />
            {selectedMain
              ? "Add Subcategory"
              : "Add Main Category"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          Loading...
        </div>
      ) : selectedMain ? (
        visibleSubcategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleSubcategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isMain={false}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FolderTree
              size={40}
              className="mx-auto text-gray-300 mb-4"
            />
            <h3 className="font-bold text-gray-900 mb-2">
              No subcategories yet
            </h3>
            <p className="text-gray-400 mb-5">
              Add the first subcategory inside {selectedMain.name}.
            </p>
            <button
              type="button"
              onClick={() =>
                openModal(undefined, selectedMain.id)
              }
              className="inline-flex items-center gap-2 bg-accent text-white px-5 py-3 rounded-xl text-sm font-medium"
            >
              <Plus size={18} />
              Add Subcategory
            </button>
          </div>
        )
      ) : mainCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isMain={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
          No main categories found.
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory
                    ? "Edit Category"
                    : formData.parentId
                    ? "Add Subcategory"
                    : "Add Main Category"}
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  Main category → Subcategory → Products
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>

                <select
                  value={formData.parentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-accent"
                >
                  <option value="">
                    None — Main Category
                  </option>

                  {mainCategories
                    .filter(
                      (category) =>
                        category.id !== editingCategory?.id
                    )
                    .map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (EN)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (AR)
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nameAr: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  placeholder="Leave empty to generate automatically"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  صورة الفئة
                </label>

                {formData.image && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 mb-3 group">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${formData.image})`,
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 text-sm font-medium text-gray-600 mb-2">
                  {uploadingImage ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin text-amber-500"
                      />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <ImagePlus size={18} />
                      اختر صورة من الحاسوب
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>

                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  placeholder="أو الصق رابط الصورة هنا"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-accent rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving || uploadingImage}
                className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                <Save size={16} />
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

