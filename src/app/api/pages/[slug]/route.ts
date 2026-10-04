import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    if (!page) {
      return NextResponse.json({ page: null }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ page: null }, { status: 500 });
  }
}
