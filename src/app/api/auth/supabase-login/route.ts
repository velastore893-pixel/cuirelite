import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/supabase-login
 * Signs the admin in with Supabase Auth and verifies they have an
 * active row in admin_profiles (role-based access).
 *
 * Body: { email, password }
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Use the SERVICE ROLE key on the server to read admin_profiles
    // regardless of RLS. It is never sent to the browser.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      );
    }

    // 1) Sign in with Supabase Auth using a short-lived client
    const authClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: signInData, error: signInError } =
      await authClient.auth.signInWithPassword({ email, password });

    if (signInError || !signInData.user) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // 2) Verify the user exists in admin_profiles and is active
    const { data: profile, error: profileError } = await authClient
      .from("admin_profiles")
      .select("id, email, full_name, role, is_active")
      .eq("id", signInData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "هذا الحساب ليس له صلاحية دخول لوحة التحكم" },
        { status: 403 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: "الحساب معطّل. راجع مدير النظام" },
        { status: 403 }
      );
    }

    // 3) Issue an HttpOnly session cookie (server-managed)
    const sessionToken = Buffer.from(
      JSON.stringify({
        uid: signInData.user.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      })
    ).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      },
      accessToken: signInData.session.access_token,
    });

    response.cookies.set("admin_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Keep the Supabase access token server-side for future admin API calls
    response.cookies.set("sb_access_token", signInData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Supabase login error:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
