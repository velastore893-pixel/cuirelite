"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  ArrowUpRight,
  FolderTree,
  RefreshCw,
  Settings,
  Image,
} from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  status: string | null;
  createdAt: Date | null;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  pendingOrders: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/categories"),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const categoriesData = await categoriesRes.json();

      const allProducts = productsData.products || [];
      const allOrders = ordersData.orders || [];
      const allCategories = categoriesData.categories || [];

      const totalRevenue = allOrders.reduce(
        (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
        0
      );

      setStats({
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalCategories: allCategories.length,
        totalRevenue,
        pendingOrders: allOrders.filter((o: Order) => o.status === "pending").length,
      });

      setRecentOrders(allOrders.slice(-5).reverse());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    {
      label: "إجمالي الإيرادات",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      shadowColor: "shadow-green-500/20",
      href: "/admin/orders",
      change: "+12.5%",
      changeUp: true,
    },
    {
      label: "إجمالي الطلبات",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/20",
      href: "/admin/orders",
      change: "+8.2%",
      changeUp: true,
    },
    {
      label: "المنتجات",
      value: stats.totalProducts,
      icon: Package,
      color: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/20",
      href: "/admin/products",
      change: "+3.1%",
      changeUp: true,
    },
    {
      label: "الطلبات المعلقة",
      value: stats.pendingOrders,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      shadowColor: "shadow-amber-500/20",
      href: "/admin/orders",
      change: stats.pendingOrders > 0 ? "تحتاج متابعة" : "تمام",
      changeUp: false,
    },
  ];

  const quickActions = [
    {
      label: "المنتجات",
      icon: Package,
      href: "/admin/products",
      color: "from-purple-500 to-purple-600",
      desc: "إدارة المنتجات",
    },
    {
      label: "الطلبات",
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "from-blue-500 to-blue-600",
      desc: "تتبع ومعالجة",
    },
    {
      label: "السلايدر",
      icon: Image,
      href: "/admin/slides",
      color: "from-indigo-500 to-indigo-600",
      desc: "صور البانر",
    },
    {
      label: "الفئات",
      icon: FolderTree,
      href: "/admin/categories",
      color: "from-green-500 to-green-600",
      desc: "تنظيم المنتجات",
    },
    {
      label: "الإعدادات",
      icon: Settings,
      href: "/admin/settings",
      color: "from-orange-500 to-orange-600",
      desc: "إعدادات المتجر",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مرحباً بعودتك! 👋</h1>
          <p className="text-gray-500 mt-1">إليك نظرة عامة على متجرك</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20"
          >
            <ArrowUpRight size={16} />
            عرض المتجر
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg ${stat.shadowColor} group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.changeUp ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">الوصول السريع</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group text-center"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{action.label}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">آخر الطلبات</h2>
            <p className="text-sm text-gray-400 mt-0.5">أحدث طلبات العملاء</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-amber-600 text-sm font-medium hover:text-amber-700 transition-colors"
          >
            عرض الكل ←
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500">رقم الطلب</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500">العميل</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500">المبلغ</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500">الحالة</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <ShoppingCart size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">لا توجد طلبات بعد</p>
                    <p className="text-sm text-gray-300 mt-1">ستظهر الطلبات هنا عندما يطلب العملاء</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-gray-900 text-sm">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status || "pending"] || "bg-gray-100 text-gray-800"}`}>
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-MA") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
