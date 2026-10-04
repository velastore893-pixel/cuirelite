import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await db.select().from(storeSettings);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ settings: [] }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key) return NextResponse.json({ success: false, error: "Key required" }, { status: 400 });

    const existing = await db.select().from(storeSettings).where(eq(storeSettings.key, key));
    if (existing.length > 0) {
      await db.update(storeSettings).set({ value, updatedAt: new Date() }).where(eq(storeSettings.key, key));
    } else {
      await db.insert(storeSettings).values({ key, value });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
