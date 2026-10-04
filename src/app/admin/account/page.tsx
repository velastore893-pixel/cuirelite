"use client";

import { useState, useEffect } from "react";
import { Save, Lock, User, Mail, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("admin_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setNewName(parsed.name || "");
      setCurrentEmail(parsed.email);
      setNewEmail(parsed.email);
    }
  }, []);

  const handleSave = async () => {
    setMessage(null);

    if (newEmail && !newEmail.includes("@")) {
      setMessage({ type: "error", text: "البريد الإلكتروني غير صحيح" });
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setMessage({ type: "error", text: "كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل" });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "كلمة المرور الجديدة غير متطابقة" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail,
          currentPassword: "", // No longer required
          newEmail: newEmail !== currentEmail ? newEmail : undefined,
          newPassword: newPassword || undefined,
          newName: newName !== user?.name ? newName : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "تم التحديث بنجاح ✅" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Update local storage if email changed
        if (data.user) {
          localStorage.setItem("admin_user", JSON.stringify(data.user));
          setUser(data.user);
          setCurrentEmail(data.user.email);
          setNewEmail(data.user.email);
        }
      } else {
        setMessage({ type: "error", text: data.error || "خطأ في التحديث" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "خطأ في الاتصال بالخادم" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إعدادات الحساب</h1>
        <p className="text-gray-500 mt-1">تعديل البريد الإلكتروني وكلمة المرور</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Current Account Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User size={20} className="text-amber-500" />
            معلومات الحساب
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  placeholder="اسم المستخدم"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني الحالي</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={currentEmail}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change Credentials */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock size={20} className="text-amber-500" />
            تغيير بيانات الدخول
          </h2>
          <div className="space-y-4">
            {/* New Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                البريد الإلكتروني الجديد
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  placeholder="اتركها فارغة إذا لا تريد التغيير"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            {newPassword && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                />
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`rounded-xl p-3 text-sm text-center ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.type === "success" && <CheckCircle size={16} className="inline ml-1" />}
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>

            <p className="text-xs text-gray-400">
              يمكنك تغيير البريد الإلكتروني أو كلمة المرور أو الاثنين معاً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
