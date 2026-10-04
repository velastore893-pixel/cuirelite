import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allCustomers = await db.select().from(customers);
    return NextResponse.json({ customers: allCustomers });
  } catch (error) {
    return NextResponse.json({ customers: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [customer] = await db.insert(customers).values({
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      city: body.city || null,
      address: body.address || null,
    }).returning();
    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    const [updated] = await db.update(customers).set(updateData).where(eq(customers.id, Number(id))).returning();
    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
