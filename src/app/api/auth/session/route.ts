import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/session
 * Verifies the admin session.
 *
 * Accepts the token from EITHER:
 *   1) the HttpOnly cookie `admin_token` (primary), OR
 *   2) the `Authorization: Bearer <token>` header (fallback for
 *      environments where cookies are not reliably persisted).
 *
 * Returns { authenticated: true, user } or { authenticated: false }.
 */
export async function GET(request: NextRequest) {
  try {
    // 1) Try the HttpOnly cookie first
    let token = request.cookies.get("admin_token")?.value;

    // 2) Fall back to the Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(token, "base64").toString("utf-8")
      );

      // Basic sanity: must contain an email and a recent issue time
      if (!decoded || typeof decoded.email !== "string" || !decoded.email) {
        return NextResponse.json({ authenticated: false });
      }

      // Reject sessions older than 7 days (same as the cookie maxAge)
      const issuedAt = Number(decoded.iat || 0);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (!issuedAt || Date.now() - issuedAt > sevenDays) {
        return NextResponse.json({ authenticated: false });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          email: decoded.email,
          name: decoded.name || "",
          role: decoded.role || "admin",
        },
      });
    } catch {
      // Malformed token -> treat as unauthenticated
      return NextResponse.json({ authenticated: false });
    }
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
