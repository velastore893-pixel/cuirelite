import { NextRequest, NextResponse } from "next/server";
import { appendToSheet, testConnection } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { success: false, error: "Google Sheets not configured. Add GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY to .env" },
        { status: 500 }
      );
    }

    const row = [
      body.orderNumber || "",
      new Date().toLocaleDateString("ar-MA"),
      new Date().toLocaleTimeString("ar-MA"),
      body.customerName || "",
      body.customerPhone || "",
      body.city || "",
      body.shippingAddress || "",
      body.items
        ? body.items.map((item: { name: string; quantity: number; price: number; size?: string; color?: string }) =>
            `${item.name} (${item.quantity}x)${item.size ? " - مقاس: " + item.size : ""}${item.color ? " - لون: " + item.color : ""}`
          ).join("\n")
        : "",
      body.totalAmount || "0",
      body.shippingCost || "0",
      body.discount || "0",
      body.paymentMethod || "cod",
      body.couponCode || "",
      body.status || "جديد",
      body.notes || "",
    ];

    await appendToSheet({ spreadsheetId, clientEmail, privateKey }, "Orders", [row]);

    return NextResponse.json({ success: true, message: "Order sent to Google Sheets" });
  } catch (error) {
    console.error("Google Sheets error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({
        configured: false,
        message: "Google Sheets not configured",
        instructions: [
          "1) Go to console.cloud.google.com",
          "2) Create a project and enable Google Sheets API",
          "3) Create a Service Account and download JSON key",
          "4) Share your Google Sheet with the service account email",
          "5) Add these to .env file:",
          "   GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id",
          "   GOOGLE_SHEETS_CLIENT_EMAIL=service@project.iam.gserviceaccount.com",
          "   GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----",
        ],
      });
    }

    const result = await testConnection({ spreadsheetId, clientEmail, privateKey });

    if (result.success) {
      return NextResponse.json({
        configured: true,
        spreadsheetTitle: result.title,
        message: "Google Sheets connected successfully!",
      });
    } else {
      return NextResponse.json({
        configured: false,
        error: result.error,
      });
    }
  } catch (error) {
    return NextResponse.json({ configured: false, error: String(error) });
  }
}
