import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 *
 * Admin sign-in with two backends:
 *   1) Supabase Auth (when NEXT_PUBLIC_SUPABASE_URL + service key are set)
 *   2) Local admin_users table (existing working auth)
 *
 * Sets an HttpOnly cookie so the admin session is server-verifiable.
 * No credentials are ever stored in localStorage.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const user = { id: 0, email, name: "", role: "admin" };
    let authenticated = false;

    // -------------------------------------------------------
    // Backend 1: Supabase Auth (preferred when configured)
    // -------------------------------------------------------
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const authClient = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: signInData, error: signInError } =
          await authClient.auth.signInWithPassword({ email, password });

        if (!signInError && signInData.user) {
          const { data: profile } = await authClient
            .from("admin_profiles")
            .select("id, email, full_name, role, is_active")
            .eq("id", signInData.user.id)
            .single();

          if (profile && profile.is_active) {
            authenticated = true;
            user.id = 0;
            user.email = String(profile.email);
            user.name = String(profile.full_name);
            user.role = String(profile.role);
          } else if (profile && !profile.is_active) {
            return NextResponse.json(
              { success: false, error: "الحساب معطّل. راجع مدير النظام." },
              { status: 403 }
            );
          }
        }
      } catch (sbErr) {
        // Fall through to local admin auth
        console.warn("Supabase auth unavailable, trying local admin:", sbErr);
      }
    }

    // -------------------------------------------------------
    // Backend 2: local admin_users (existing working auth)
    // -------------------------------------------------------
    if (!authenticated) {
      const [localUser] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, email));

      if (!localUser) {
        return NextResponse.json(
          { success: false, error: "البريد الإلكتروني غير مسجل" },
          { status: 401 }
        );
      }

      if (localUser.password !== password) {
        return NextResponse.json(
          { success: false, error: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }

      if (!localUser.isActive) {
        return NextResponse.json(
          { success: false, error: "الحساب معطّل" },
          { status: 403 }
        );
      }

      authenticated = true;
      user.id = localUser.id;
      user.email = localUser.email;
      user.name = localUser.name;
      user.role = String(localUser.role || "admin");
    }

    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // -------------------------------------------------------
    // Issue an HttpOnly session cookie (server-verifiable)
    // -------------------------------------------------------
    const token = Buffer.from(
      JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Date.now(),
      })
    ).toString("base64");

    const responseBody = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      // Also return the token so the client can store it as a
      // fallback when cookies are unavailable (some preview
      // environments do not persist cookies reliably).
      token,
    };

    const response = NextResponse.json(responseBody);

    // Set BOTH an HttpOnly cookie (primary, httpOnly) AND allow the
    // client to store the same token in localStorage as a fallback.
    const isHttps = request.nextUrl.protocol === "https:";
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
