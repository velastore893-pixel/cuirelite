import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, customers } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allCustomers = await db.select().from(customers);

    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);
    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    const statusCounts: Record<string, number> = {};
    allOrders.forEach(o => {
      const s = o.status || "new";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const cityCounts: Record<string, number> = {};
    allOrders.forEach(o => {
      const c = o.city || "غير محدد";
      cityCounts[c] = (cityCounts[c] || 0) + 1;
    });

    const lowStockProducts = allProducts.filter(p => (p.stock || 0) < 10 && p.isActive);

    const ordersByDate: Record<string, number> = {};
    allOrders.forEach(o => {
      if (o.createdAt) {
        const date = new Date(o.createdAt).toISOString().split("T")[0];
        ordersByDate[date] = (ordersByDate[date] || 0) + 1;
      }
    });

    return NextResponse.json({
      stats: {
        totalOrders: allOrders.length,
        totalRevenue,
        avgOrderValue,
        totalProducts: allProducts.length,
        totalCustomers: allCustomers.length,
        statusCounts,
        cityCounts,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 10),
        ordersByDate,
      },
    });
  } catch (error) {
    return NextResponse.json({ stats: {} }, { status: 500 });
  }
}
