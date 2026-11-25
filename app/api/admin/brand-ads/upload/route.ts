import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

const MAX_BYTES = 50 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 50MB" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  let media_type: "image" | "video";
  if (IMAGE_TYPES.has(mime)) media_type = "image";
  else if (VIDEO_TYPES.has(mime)) media_type = "video";
  else {
    return NextResponse.json(
      { error: "Only JPG/PNG/WebP/GIF images or MP4/WebM videos allowed" },
      { status: 400 },
    );
  }

  const ext =
    mime === "image/jpeg"
      ? "jpg"
      : mime === "image/png"
        ? "png"
        : mime === "image/webp"
          ? "webp"
          : mime === "image/gif"
            ? "gif"
            : mime === "video/webm"
              ? "webm"
              : mime === "video/quicktime"
                ? "mov"
                : "mp4";

  const placement = String(form.get("placement") ?? "general").replace(/[^\w-]/g, "") || "general";
  const path = `${placement}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await auth.supabase.storage
    .from("brand-ads")
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: pub } = auth.supabase.storage.from("brand-ads").getPublicUrl(path);

  return NextResponse.json({
    media_type,
    media_path: path,
    media_url: pub.publicUrl,
  });
}
