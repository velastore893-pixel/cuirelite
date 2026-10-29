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

  const result: any = {
    username: decodeURIComponent(url.username),
    hostname: url.hostname,
    port: url.port,
    database: url.pathname.replace(/^\//, ""),
  };

  // Test 1: exact DATABASE_URL used by the site
  const client1 = new Client({
    connectionString: value,
  });

  try {
    await client1.connect();
    const q = await client1.query(
      "select current_user, current_database()"
    );

    result.connectionStringTest = {
      ok: true,
      result: q.rows[0],
    };
  } catch (error: any) {
    result.connectionStringTest = {
      ok: false,
      code: error?.code,
      message: error?.message,
    };
  } finally {
    await client1.end().catch(() => {});
  }

  // Test 2: same credentials parsed explicitly
  const client2 = new Client({
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  });

  try {
    await client2.connect();
    const q = await client2.query(
      "select current_user, current_database()"
    );

    result.explicitConfigTest = {
      ok: true,
      result: q.rows[0],
    };
  } catch (error: any) {
    result.explicitConfigTest = {
      ok: false,
      code: error?.code,
      message: error?.message,
    };
  } finally {
    await client2.end().catch(() => {});
  }

  return NextResponse.json(result);
}
