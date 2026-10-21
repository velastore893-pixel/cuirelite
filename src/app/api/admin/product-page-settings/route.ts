import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: Record<string, string> = {
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

// Keep backward compatibility with the old admin key.
function normalizeKey(key: string) {
  if (key === "pp_show_stock") {
    return "pp_show_stock_info";
  }

  return key;
}

async function upsertSetting(key: string, value: unknown) {
  const normalizedKey = normalizeKey(key);
  const normalizedValue = String(value);

  const existing = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.key, normalizedKey));

  if (existing.length > 0) {
    await db
      .update(storeSettings)
      .set({
        value: normalizedValue,
        updatedAt: new Date(),
      })
      .where(eq(storeSettings.key, normalizedKey));
  } else {
    await db.insert(storeSettings).values({
      key: normalizedKey,
      value: normalizedValue,
    });
  }
}

export async function GET() {
  try {
    const settings = await db.select().from(storeSettings);

    const settingsMap: Record<string, string> = {};

    for (const s of settings) {
      if (!s.key.startsWith("pp_")) continue;

      const normalizedKey = normalizeKey(s.key);

      // If both the old and new stock keys exist,
      // prefer the real/new key: pp_show_stock_info.
      if (
        s.key === "pp_show_stock" &&
        settings.some((item) => item.key === "pp_show_stock_info")
      ) {
        continue;
      }

      settingsMap[normalizedKey] = s.value || "";
    }

    const result = {
      ...DEFAULT_SETTINGS,
      ...settingsMap,
    };

    return NextResponse.json(
      { settings: result },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch product page settings:", error);

    return NextResponse.json(
      { settings: DEFAULT_SETTINGS },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: "Key required",
        },
        { status: 400 }
      );
    }

    if (!String(key).startsWith("pp_")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product page setting key",
        },
        { status: 400 }
      );
    }

    await upsertSetting(String(key), value);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update product page setting:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      if (!key.startsWith("pp_")) continue;

      await upsertSetting(key, value);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save product page settings:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}


