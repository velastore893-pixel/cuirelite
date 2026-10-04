import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Try to find by filename column
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.filename, filename));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // The data is stored as data URL: data:image/png;base64,xxxx
    const dataUrl = file.data;
    const parts = dataUrl.split(",");
    const mimeType = file.mimeType || "image/jpeg";

    if (parts.length === 2) {
      // Has base64 data - decode and serve as binary
      const base64Data = parts[1];
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // If not a data URL, return as JSON
    return NextResponse.json({ url: file.data });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
