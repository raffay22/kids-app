import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/admin";

const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB strict limit

function sanitizePdfFileName(originalName: string): string {
  const withoutExt = originalName.replace(/\.pdf$/i, "");
  const cleaned = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const base = cleaned || "worksheet";
  return `${base}-${Date.now()}.pdf`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
  }

  const isPdfMime = file.type === "application/pdf";
  const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
  if (!isPdfMime && !isPdfExt) {
    return NextResponse.json(
      { error: "Only .pdf files are allowed" },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "PDF file must be under 15 MB" },
      { status: 400 },
    );
  }

  const ageGroupRaw = String(form.get("age_group") ?? "2-4");
  const ageGroup = ["2-4", "4-6", "6-9"].includes(ageGroupRaw) ? ageGroupRaw : "2-4";

  const categoryRaw = String(form.get("category") ?? "math");
  const category = ["math", "english", "colouring"].includes(categoryRaw)
    ? categoryRaw
    : "math";

  const safeFileName = sanitizePdfFileName(file.name);
  const storagePath = `age-${ageGroup}/${category}/${safeFileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await auth.supabase.storage
    .from("worksheets")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: pub } = auth.supabase.storage
    .from("worksheets")
    .getPublicUrl(storagePath);

  return NextResponse.json({
    file_name: safeFileName,
    storage_path: storagePath,
    public_url: pub.publicUrl,
    file_size: formatBytes(file.size),
  });
}
