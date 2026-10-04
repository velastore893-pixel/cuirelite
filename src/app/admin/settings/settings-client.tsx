"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, RefreshCw } from "lucide-react";

interface Setting {
  id: number;
  key: string;
  value: string | null;
  updatedAt: Date | null;
}

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data.settings || []);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSetting = (key: string) =>
    settings.find((s) => s.key === key)?.value || "";

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (existing) {
        return prev.map((s) => (s.key === key ? { ...s, value } : s));
      }
      return [...prev, { id: 0, key, value, updatedAt: null }];
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: setting.key, value: setting.value }),
        });
      }
      setSaved(true);
      // Refetch to confirm
      await fetchData();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      title: "Store Information",
      fields: [
        { key: "store_name", label: "Store Name (EN)" },
        { key: "store_name_ar", label: "Store Name (AR)" },
        { key: "store_description", label: "Description (EN)" },
        { key: "store_description_ar", label: "Description (AR)" },
        { key: "store_email", label: "Email", type: "email" },
        { key: "store_phone", label: "Phone", type: "tel" },
        { key: "store_address", label: "Address" },
      ],
    },
    {
      title: "Pricing & Shipping",
      fields: [
        { key: "currency", label: "Currency Code" },
        { key: "currency_symbol", label: "Currency Symbol" },
        { key: "shipping_cost", label: "Shipping Cost ($)", type: "number" },
        { key: "free_shipping_threshold", label: "Free Shipping Threshold ($)", type: "number" },
      ],
    },
    {
      title: "Hero Section",
      fields: [
        { key: "hero_title", label: "Hero Title (EN)" },
        { key: "hero_title_ar", label: "Hero Title (AR)" },
        { key: "hero_subtitle", label: "Hero Subtitle (EN)" },
        { key: "hero_subtitle_ar", label: "Hero Subtitle (AR)" },
      ],
    },
    {
      title: "Google Sheets Integration",
      fields: [
        { key: "google_sheets_spreadsheet_id", label: "Spreadsheet ID (from URL)" },
        { key: "google_sheets_client_email", label: "Service Account Email" },
      ],
    },
    {
      title: "Tracking & Analytics",
      fields: [
        { key: "facebook_pixel_id", label: "Facebook Pixel ID" },
        { key: "tiktok_pixel_id", label: "TikTok Pixel ID" },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store settings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle size={18} />
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />
                {saving ? "Saving..." : "Save All"}
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={getSetting(field.key)}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
