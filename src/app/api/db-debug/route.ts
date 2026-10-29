import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    return NextResponse.json({
      ok: false,
      error: "DATABASE_URL missing",
    });
  }

  const url = new URL(value);

  const client = new Client({
    connectionString: value,
  });

  try {
    await client.connect();

    const result = await client.query("select 1 as ok");

    return NextResponse.json({
      ok: true,
      connected: true,
      username: decodeURIComponent(url.username),
      hostname: url.hostname,
      database: url.pathname.replace("/", ""),
      test: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      connected: false,
      username: decodeURIComponent(url.username),
      hostname: url.hostname,
      code: error?.code ?? null,
      message: error?.message ?? "Unknown database error",
    });
  } finally {
    await client.end().catch(() => {});
  }
}

