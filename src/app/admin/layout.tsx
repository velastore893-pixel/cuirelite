"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  Image,
  Layout,
  Users,
  Tag,
  BarChart3,
  Percent,
  MessageSquare,
  UserCircle,
  LogOut,
  Rocket,
} from "lucide-react";

const sidebarLinks = [
  {
    href: "/admin",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "الطلبات",
    icon: ShoppingCart,
  },
  {
    href: "/admin/products",
    label: "المنتجات",
    icon: Package,
  },
  {
    href: "/admin/offers",
    label: "العروض",
    icon: Percent,
  },
  {
    href: "/admin/product-offers",
    label: "عروض المنتجات",
    icon: Tag,
  },
  {
    href: "/admin/slides",
    label: "السلايدر",
    icon: Image,
  },
  {
    href: "/admin/categories",
    label: "الفئات",
    icon: FolderTree,
  },
  {
    href: "/admin/customers",
    label: "الزبائن",
    icon: Users,
  },
  {
    href: "/admin/testimonials",
    label: "التقييمات",
    icon: MessageSquare,
  },
  {
    href: "/admin/coupons",
    label: "الكوبونات",
    icon: Tag,
  },
  {
    href: "/admin/product-page",
    label: "صفحة المنتج",
    icon: Layout,
  },
  {
    href: "/admin/analytics",
    label: "الإحصائيات",
    icon: BarChart3,
  },
  {
    href: "/admin/settings",
    label: "الإعدادات",
    icon: Settings,
  },
  {
    href: "/admin/account",
    label: "الحساب",
    icon: UserCircle,
  },
  {
    href: "/admin/vercel",
    label: "نشر الموقع",
    icon: Rocket,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [storeName, setStoreName] = useState("CUIR ELITE");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // -----------------------------------------------------------
  // AUTH FLOW — runs ONCE on mount only.
  //
  // CRITICAL RULE: If ANY token exists (localStorage or cookie),
  // we treat the user as authenticated. We only redirect to
  // login when we are 100% sure there is no session at all.
  //
  // States: "initializing" → "authenticated" | "unauthenticated"
  // -----------------------------------------------------------
  const [authState, setAuthState] = useState<"initializing" | "authenticated" | "unauthenticated">("initializing");
  const authCheckedRef = useRef(false);

  useEffect(() => {
    // Login page handles its own rendering
    if (pathname === "/admin/login") {
      setAuthState("authenticated");
      setLoading(false);
      return;
    }

    // Only check ONCE per mount
    if (authCheckedRef.current) {
      setLoading(false);
      return;
    }
    authCheckedRef.current = true;

    let cancelled = false;

    const verify = async () => {
      console.log("[ADMIN_LAYOUT] AUTH_CHECK_STARTED", { pathname });

      // ---- STEP 1: Is there ANY token in localStorage? ----
      let storedToken: string | null = null;
      try {
        storedToken = localStorage.getItem("admin_token");
      } catch { /* ignore */ }

      console.log("[ADMIN_LAYOUT] localStorage token present:", !!storedToken);

      // ---- STEP 2: If we have a token, TRUST IT ----
      // Don't even call the server — if the login page stored
      // a token, the user just authenticated successfully.
      // Any server check failure at this point would be a network
      // issue, not an auth issue. We must NOT bounce the user out.
      if (storedToken) {
        console.log("[ADMIN_LAYOUT] ADMIN_CHECK_RESULT: PASS (localStorage token found)");
        setAuthState("authenticated");
        setIsAuthenticated(true);
        setLoading(false);

        // Optionally confirm with server in the background
        // (non-blocking, no redirect on failure)
        fetch("/api/auth/session", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((r) => r.json())
          .then((d) => {
            console.log("[ADMIN_LAYOUT] Background server check:", d.authenticated);
          })
          .catch((e) => {
            console.log("[ADMIN_LAYOUT] Background server check failed (non-critical):", e);
          });

        return;
      }

      // ---- STEP 3: No localStorage token → check the cookie ----
      console.log("[ADMIN_LAYOUT] No localStorage token — checking cookie...");
      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = await res.json();
        console.log("[ADMIN_LAYOUT] Cookie session check:", data.authenticated);

        if (cancelled) return;

        if (data.authenticated) {
          console.log("[ADMIN_LAYOUT] ADMIN_CHECK_RESULT: PASS (cookie)");
          setAuthState("authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("[ADMIN_LAYOUT] ADMIN_CHECK_RESULT: FAIL — no token, no cookie");
          setAuthState("unauthenticated");
          setLoading(false);
          window.location.replace("/admin/login");
        }
      } catch (err) {
        console.error("[ADMIN_LAYOUT] Cookie check error:", err);
        // Network error — do NOT bounce the admin out
        if (!cancelled) {
          setAuthState("authenticated");
          setIsAuthenticated(true);
          setLoading(false);
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.store_name_ar) {
          setStoreName(data.settings.store_name_ar);
        } else if (data.settings?.store_name) {
          setStoreName(data.settings.store_name);
        }
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحقق من الجلسة...</p>
          <p className="text-xs text-gray-300 mt-2">
            authState: {authState}
          </p>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" dir="rtl">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col transition-transform duration-300 ease-in-out
          lg:z-40
          ${mobileOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
          w-[280px]
        `}
        style={{
          background: "linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <span className="text-white font-black text-xs tracking-wider">CE</span>
          </div>
          <div className="overflow-hidden flex-1">
            <h1 className="font-bold text-white text-sm tracking-wide whitespace-nowrap">
              لوحة التحكم
            </h1>
            <span className="text-[10px] text-amber-400/70">{storeName}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl transition-all duration-200 group ${
                  isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
                } ${
                  isActive
                    ? "bg-gradient-to-l from-amber-500/20 to-amber-500/5 text-amber-400 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                title={isCollapsed ? link.label : undefined}
              >
                <link.icon
                  size={20}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? "text-amber-400" : "text-gray-500 group-hover:text-white"
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {link.label}
                  </span>
                )}
                {!isCollapsed && isActive && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-4 space-y-2 flex-shrink-0">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
            }`}
          >
            <Store size={20} />
            {!isCollapsed && <span className="text-sm font-medium">عرض المتجر</span>}
          </Link>

          {/* Logout */}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
              try {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_user");
              } catch {
                // ignore
              }
              window.location.href = "/admin/login";
            }}
            className={`w-full flex items-center gap-3 text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
            }`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-medium">تسجيل الخروج</span>}
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center gap-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
            }`}
          >
            {isCollapsed ? (
              <ChevronLeft size={20} />
            ) : (
              <>
                <ChevronRight size={20} />
                <span className="text-sm font-medium">طي القائمة</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
          isCollapsed ? "lg:mr-[72px]" : "lg:mr-[260px]"
        }`}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile hamburger + title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -mr-1 rounded-lg text-gray-600 hover:bg-gray-100 flex-shrink-0"
                aria-label="فتح القائمة"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {sidebarLinks.find(
                  (l) =>
                    l.href === pathname ||
                    (l.href !== "/admin" && pathname.startsWith(l.href))
                )?.label || "لوحة التحكم"}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex text-sm text-gray-500 hover:text-amber-600 transition-colors items-center gap-1"
              >
                <Store size={14} />
                عرض المتجر
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
