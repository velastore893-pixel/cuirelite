import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BUCKET = "product-media";
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

function safeFileName(name: string) {
  const ext = name.includes(".")
    ? "." + name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";

  const base = name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "video";

  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey || !publicAnonKey) {
      const missing: string[] = [];

      if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
      if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
      if (!publicAnonKey) {
        missing.push(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY"
        );
      }

      console.error("Missing Supabase video upload environment variables", {
        missing,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Missing server environment variable: ${missing.join(", ")}`,
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const fileName = String(body?.fileName || "");
    const contentType = String(body?.contentType || "");
    const size = Number(body?.size || 0);

    if (!fileName || !contentType.startsWith("video/")) {
      return NextResponse.json(
        { success: false, error: "Please choose a valid video file." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(size) || size <= 0 || size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { success: false, error: "Video must be smaller than 100 MB." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Make sure the public bucket exists.
    const { data: existingBucket } = await supabase.storage.getBucket(BUCKET);

    if (!existingBucket) {
      const { error: createBucketError } =
        await supabase.storage.createBucket(BUCKET, {
          public: true,
          fileSizeLimit: MAX_VIDEO_SIZE,
          allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
        });

      if (createBucketError) {
        console.error("Failed to create product-media bucket:", createBucketError);
        return NextResponse.json(
          { success: false, error: createBucketError.message },
          { status: 500 }
        );
      }
    }

    const path = `products/videos/${safeFileName(fileName)}`;

    const { data: signed, error: signedError } =
      await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(path, { upsert: true });

    if (signedError || !signed) {
      console.error("Failed to create signed upload URL:", signedError);
      return NextResponse.json(
        {
          success: false,
          error: signedError?.message || "Could not prepare video upload.",
        },
        { status: 500 }
      );
    }

    const { data: publicData } =
      supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({
      success: true,
      bucket: BUCKET,
      path,
      token: signed.token,
      publicUrl: publicData.publicUrl,

      // Public browser-safe values returned at runtime.
      // This avoids relying on NEXT_PUBLIC_* being embedded
      // in the client bundle during build time.
      supabaseUrl,
      publicAnonKey,
    });
  } catch (error) {
    console.error("Video upload signing failed:", error);

    return NextResponse.json(
      { success: false, error: "Video upload could not be prepared." },
      { status: 500 }
    );
  }
}


