import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function GET() {
  try {
    const settings = await db.select().from(storeSettings);

    return NextResponse.json(
      { settings },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Failed to fetch admin settings:", error);

    return NextResponse.json(
      { settings: [] },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const key = String(body?.key || "").trim();
    const value = body?.value == null ? "" : String(body.value);

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Key required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const existing = await db
      .select()
      .from(storeSettings)
      .where(eq(storeSettings.key, key));

    if (existing.length > 0) {
      await db
        .update(storeSettings)
        .set({
          value,
          updatedAt: new Date(),
        })
        .where(eq(storeSettings.key, key));
    } else {
      await db.insert(storeSettings).values({
        key,
        value,
      });
    }

    return NextResponse.json(
      { success: true, key, value },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Failed to update setting:", error);

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
