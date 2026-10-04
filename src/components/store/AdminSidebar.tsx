"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Package,
  ShoppingCart,
  FolderTree,
  Image,
  LayoutDashboard,
  X,
  ChevronLeft,
  Store,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, color: "from-amber-500 to-amber-600" },
  { href: "/admin/slides", label: "السلايدر", icon: Image, color: "from-indigo-500 to-indigo-600" },
  { href: "/admin/products", label: "المنتجات", icon: Package, color: "from-purple-500 to-purple-600" },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart, color: "from-blue-500 to-blue-600" },
  { href: "/admin/categories", label: "الفئات", icon: FolderTree, color: "from-green-500 to-green-600" },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, color: "from-orange-500 to-orange-600" },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Admin Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-full shadow-2xl hover:shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center justify-center group"
        title="لوحة التحكم"
      >
        <Settings size={22} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">CE</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">لوحة التحكم</h2>
                <p className="text-gray-400 text-xs">CUIR ELITE Admin</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <link.icon size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{link.label}</h3>
              </div>
              <ChevronLeft size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 p-3 text-gray-500 hover:text-amber-600 rounded-xl hover:bg-gray-50 transition-all"
          >
            <Store size={18} />
            <span className="text-sm font-medium">العودة للمتجر</span>
          </Link>
        </div>
      </div>
    </>
  );
}
