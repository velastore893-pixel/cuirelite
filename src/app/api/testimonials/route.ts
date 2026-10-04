import { NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeTestimonials = await db.select().from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(testimonials.sortOrder);
    return NextResponse.json({ testimonials: activeTestimonials });
  } catch (error) {
    return NextResponse.json({ testimonials: [] }, { status: 500 });
  }
}
