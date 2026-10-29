import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is missing" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(value);

    return NextResponse.json({
      ok: true,
      username: decodeURIComponent(url.username),
      hostname: url.hostname,
      port: url.port || "(default)",
      database: url.pathname.replace(/^\//, ""),
      hasPassword: Boolean(url.password),
      protocol: url.protocol,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL could not be parsed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
