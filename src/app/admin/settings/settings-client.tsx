"use client";

import { useState, useEffect } from "react";
import {
  Save,
  CheckCircle,
  RefreshCw,
  MessageCircle,
  Music2,
  Image as ImageIcon,
  Camera,
  Globe,
} from "lucide-react";

interface Setting {
  id: number;
  key: string;
  value: string | null;
  updatedAt: Date | null;
}

interface Field {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
}

interface Section {
  title: string;
  description?: string;
  fields: Field[];
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
        return prev.map((s) =>
          s.key === key ? { ...s, value } : s
        );
      }

      return [
        ...prev,
        {
          id: 0,
          key,
          value,
          updatedAt: null,
        },
      ];
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);

    try {
      for (const setting of settings) {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: setting.key,
            value: setting.value,
          }),
        });

        if (!res.ok) {
          throw new Error(
            `Failed to save setting: ${setting.key}`
          );
        }
      }

      setSaved(true);

      await fetchData();

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const sections: Section[] = [
    {
      title: "Store Information",
      fields: [
        {
          key: "store_name",
          label: "Store Name (EN)",
        },
        {
          key: "store_name_ar",
          label: "Store Name (AR)",
        },
        {
          key: "store_description",
          label: "Description (EN)",
        },
        {
          key: "store_description_ar",
          label: "Description (AR)",
        },
        {
          key: "store_email",
          label: "Email",
          type: "email",
        },
        {
          key: "store_phone",
          label: "Phone",
          type: "tel",
        },
        {
          key: "store_address",
          label: "Address",
        },
      ],
    },

    {
      title: "Store Logo",
      description:
        "Logo displayed on your storefront and navigation.",
      fields: [
        {
          key: "logo_url",
          label: "Logo URL",
          type: "url",
          placeholder: "https://...",
          description:
            "For now paste the image URL here. Direct image upload will be added separately.",
        },
      ],
    },

    {
      title: "WhatsApp",
      description:
        "Floating WhatsApp button displayed while customers scroll.",
      fields: [
        {
          key: "whatsapp_enabled",
          label: "Enable WhatsApp Button",
          type: "toggle",
        },
        {
          key: "whatsapp_number",
          label: "WhatsApp Number",
          type: "tel",
          placeholder: "+212600000000",
          description:
            "Use the full international number including country code.",
        },
        {
          key: "whatsapp_message",
          label: "Default WhatsApp Message",
          placeholder:
            "Hello, I am interested in this product.",
        },
      ],
    },

    {
      title: "Social Media",
      description:
        "These links will appear only in the website footer.",
      fields: [
        {
          key: "instagram_url",
          label: "Instagram URL",
          type: "url",
          placeholder: "https://instagram.com/...",
        },
        {
          key: "facebook_url",
          label: "Facebook URL",
          type: "url",
          placeholder: "https://facebook.com/...",
        },
        {
          key: "tiktok_url",
          label: "TikTok URL",
          type: "url",
          placeholder: "https://tiktok.com/@...",
        },
      ],
    },

    {
      title: "Pricing & Shipping",
      fields: [
        {
          key: "currency",
          label: "Currency Code",
        },
        {
          key: "currency_symbol",
          label: "Currency Symbol",
        },
        {
          key: "shipping_cost",
          label: "Shipping Cost",
          type: "number",
        },
        {
          key: "free_shipping_threshold",
          label: "Free Shipping Threshold",
          type: "number",
        },
      ],
    },

    {
      title: "Hero Section",
      fields: [
        {
          key: "hero_title",
          label: "Hero Title (EN)",
        },
        {
          key: "hero_title_ar",
          label: "Hero Title (AR)",
        },
        {
          key: "hero_subtitle",
          label: "Hero Subtitle (EN)",
        },
        {
          key: "hero_subtitle_ar",
          label: "Hero Subtitle (AR)",
        },
      ],
    },

    {
      title: "Google Sheets Integration",
      fields: [
        {
          key: "google_sheets_spreadsheet_id",
          label: "Spreadsheet ID (from URL)",
        },
        {
          key: "google_sheets_client_email",
          label: "Service Account Email",
        },
      ],
    },

    {
      title: "Tracking & Analytics",
      fields: [
        {
          key: "facebook_pixel_id",
          label: "Facebook Pixel ID",
        },
        {
          key: "tiktok_pixel_id",
          label: "TikTok Pixel ID",
        },
      ],
    },
  ];

  const getSectionIcon = (title: string) => {
    if (title === "WhatsApp") {
      return <MessageCircle size={20} />;
    }

    if (title === "Store Logo") {
      return <ImageIcon size={20} />;
    }

    if (title === "Social Media") {
      return <Globe size={20} />;
    }

    return null;
  };

  const renderField = (field: Field) => {
    if (field.type === "toggle") {
      const enabled =
        getSetting(field.key) === "true";

      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              updateSetting(
                field.key,
                enabled ? "false" : "true"
              )
            }
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              enabled
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                enabled
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>

          <span
            className={`text-sm font-medium ${
              enabled
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={getSetting(field.key)}
        onChange={(e) =>
          updateSetting(
            field.key,
            e.target.value
          )
        }
        placeholder={field.placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
      />
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your store settings
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle size={18} />
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />

                {saving
                  ? "Saving..."
                  : "Save All"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {getSectionIcon(
                  section.title
                ) && (
                  <span className="text-accent">
                    {getSectionIcon(
                      section.title
                    )}
                  </span>
                )}

                <h2 className="text-lg font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>

              {section.description && (
                <p className="text-sm text-gray-400 mt-1">
                  {section.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                  </label>

                  {renderField(field)}

                  {field.description && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {field.description}
                    </p>
                  )}

                  {/* Logo Preview */}
                  {field.key === "logo_url" &&
                    getSetting("logo_url") && (
                      <div className="mt-4 border border-gray-100 rounded-xl p-4 bg-gray-50">
                        <p className="text-xs text-gray-400 mb-3">
                          Logo Preview
                        </p>

                        <img
                          src={getSetting(
                            "logo_url"
                          )}
                          alt="Store Logo"
                          className="max-h-24 max-w-[220px] object-contain"
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* WhatsApp Preview */}
            {section.title === "WhatsApp" &&
              getSetting(
                "whatsapp_enabled"
              ) === "true" && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="inline-flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <MessageCircle
                        size={21}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        WhatsApp Button Enabled
                      </p>

                      <p className="text-xs text-gray-400">
                        {getSetting(
                          "whatsapp_number"
                        ) ||
                          "No number configured yet"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Social Preview */}
            {section.title ===
              "Social Media" && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">
                  Footer Preview
                </p>

                <div className="flex items-center gap-3">
                  {getSetting(
                    "instagram_url"
                  ) && (
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                      title="Instagram"
                    >
                      <Camera size={20} />
                    </div>
                  )}

                  {getSetting(
                    "facebook_url"
                  ) && (
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                      title="Facebook"
                    >
                      <Globe size={20} />
                    </div>
                  )}

                  {getSetting(
                    "tiktok_url"
                  ) && (
                    <div
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                      title="TikTok"
                    >
                      <Music2 size={20} />
                    </div>
                  )}

                  {!getSetting(
                    "instagram_url"
                  ) &&
                    !getSetting(
                      "facebook_url"
                    ) &&
                    !getSetting(
                      "tiktok_url"
                    ) && (
                      <span className="text-sm text-gray-400">
                        Add social media links to
                        display them in the footer.
                      </span>
                    )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
