import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "TELEGRAM_BOT_TOKEN is missing" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { success: false, error: "Telegram API request failed" },
        { status: 500 }
      );
    }

    const updates = Array.isArray(data.result) ? data.result : [];

    const latestWithMessage = [...updates]
      .reverse()
      .find((u: any) => u?.message?.chat?.id);

    if (!latestWithMessage) {
      return NextResponse.json({
        success: false,
        error: "No Telegram message found. Send 'test' to the bot and try again."
      });
    }

    return NextResponse.json({
      success: true,
      chatId: String(latestWithMessage.message.chat.id),
      firstName: latestWithMessage.message.chat.first_name || "",
      username: latestWithMessage.message.chat.username || ""
    });
  } catch (error) {
    console.error("Telegram chat ID lookup failed:", error);

    return NextResponse.json(
      { success: false, error: "Failed to get Telegram chat ID" },
      { status: 500 }
    );
  }
}
