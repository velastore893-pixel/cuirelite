import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBanners = await db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.order);
    return NextResponse.json({ banners: activeBanners });
  } catch (error) {
    return NextResponse.json({ banners: [] }, { status: 500 });
  }
}
