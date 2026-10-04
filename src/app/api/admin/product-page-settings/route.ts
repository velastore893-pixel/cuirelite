import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  pp_show_size_selector: "true",
  pp_show_color_selector: "true",
  pp_show_quantity: "true",
  pp_show_material: "true",
  pp_show_description: "true",
  pp_show_stock_info: "true",
  pp_show_shipping_info: "true",
  pp_show_wishlist: "true",
  pp_show_related_products: "false",
  pp_show_breadcrumbs: "true",
  pp_show_social_share: "false",
  pp_order_form_title: "أكمل معلوماتك للطلب",
  pp_order_form_subtitle: "سنتواصل معك قريباً لتأكيد الطلب",
  pp_order_button_text: "تأكيد الطلب",
  pp_order_success_message: "تم الطلب بنجاح! سنتواصل معك قريباً",
  pp_show_cod_badge: "true",
  pp_show_free_shipping_badge: "true",
  pp_show_guarantee_badge: "true",
};

export async function GET() {
  try {
    const settings = await db.select().from(storeSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      if (s.key.startsWith("pp_")) {
        settingsMap[s.key] = s.value || "";
      }
    }
    // Merge with defaults
    const result = { ...DEFAULT_SETTINGS, ...settingsMap };
    return NextResponse.json({ settings: result });
  } catch (error) {
    return NextResponse.json({ settings: DEFAULT_SETTINGS }, { status: 500 });
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      const existing = await db.select().from(storeSettings).where(eq(storeSettings.key, key));
      if (existing.length > 0) {
        await db.update(storeSettings).set({ value: String(value), updatedAt: new Date() }).where(eq(storeSettings.key, key));
      } else {
        await db.insert(storeSettings).values({ key, value: String(value) });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
