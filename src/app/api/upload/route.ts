import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxBodySize = "50mb";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const url = `/api/uploads/${filename}`;

    // Save to database
    await db.insert(uploadedFiles).values({
      filename,
      originalName: file.name,
      mimeType: file.type,
      data: dataUrl,
      url,
      size: file.size,
    });

    return NextResponse.json({ success: true, url, filename });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ success: false, error: "Upload failed: " + String(error) }, { status: 500 });
  }
}

// GET - fetch image from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("file");
    if (!filename) return NextResponse.json({ error: "No file specified" }, { status: 400 });

    const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.filename, filename));
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    // Return the base64 data URL
    return NextResponse.json({ url: file.data, filename: file.filename, mimeType: file.mimeType });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - delete image from database
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    if (!filename) return NextResponse.json({ error: "No filename specified" }, { status: 400 });

    await db.delete(uploadedFiles).where(eq(uploadedFiles.filename, filename));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
