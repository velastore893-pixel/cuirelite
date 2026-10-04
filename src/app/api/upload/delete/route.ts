import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json({ success: false, error: "Filename required" }, { status: 400 });
    }

    // Extract filename from URL if full URL provided
    const actualFilename = filename.includes("/") ? filename.split("/").pop() : filename;

    // Try to delete from both directories
    const dataPath = path.join(process.cwd(), "data", "uploads", actualFilename);
    const publicPath = path.join(process.cwd(), "public", "uploads", actualFilename);

    let deleted = false;

    if (existsSync(dataPath)) {
      await unlink(dataPath);
      deleted = true;
    }
    if (existsSync(publicPath)) {
      await unlink(publicPath);
      deleted = true;
    }

    if (deleted) {
      console.log("✅ Image deleted:", actualFilename);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("❌ Delete failed:", error);
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
