import { NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeOffers = await db.select().from(offers)
      .where(eq(offers.isActive, true))
      .orderBy(offers.sortOrder);
    return NextResponse.json({ offers: activeOffers });
  } catch (error) {
    return NextResponse.json({ offers: [] }, { status: 500 });
  }
}
