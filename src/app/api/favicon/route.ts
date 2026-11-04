import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(storeSettings)
      .where(
        inArray(storeSettings.key, [
          "favicon_url",
          "logo_url",
        ])
      );

    const settings = Object.fromEntries(
      rows.map((item) => [
        item.key,
        item.value ?? "",
      ])
    ) as Record<string, string>;

    const iconUrl =
      settings.favicon_url ||
      settings.logo_url ||
      "";

    if (!iconUrl) {
      return new Response(null, {
        status: 404,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: iconUrl,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to load favicon:", error);

    return new Response(null, {
      status: 404,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}
