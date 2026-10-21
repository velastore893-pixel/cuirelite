import { NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function GET() {
  try {
    const settings = await db.select().from(storeSettings);

    const settingsMap: Record<string, string> = {};

    for (const s of settings) {
      settingsMap[s.key] = s.value || "";
    }

    return NextResponse.json(
      { settings: settingsMap },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Failed to fetch storefront settings:", error);

    return NextResponse.json(
      { settings: {} },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
