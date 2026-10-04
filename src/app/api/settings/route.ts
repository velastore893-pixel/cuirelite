import { NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await db.select().from(storeSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value || "";
    }
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { settings: {} },
      { status: 500 }
    );
  }
}
