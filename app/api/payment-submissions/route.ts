import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/jpg"]);
const ALLOWED_EXT = new Set(["png", "jpg", "jpeg"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Please sign in first to submit your payment proof." },
      { status: 401 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const parentPhone = String(form.get("parentPhone") ?? "").trim();
  const parentName = String(form.get("parentName") ?? "").trim();
  const amount = String(form.get("amount") ?? "Rs. 1,500 / Month").trim();

  if (!parentPhone) {
    return NextResponse.json(
      { error: "Please enter your contact / WhatsApp phone number." },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please select a receipt image (.png, .jpg, or .jpeg)." },
      { status: 400 },
    );
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_MIME.has(file.type) && !ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: "Only .png, .jpg, or .jpeg image files are allowed." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Receipt image must be under 5 MB." },
      { status: 400 },
    );
  }

  const safeExt = ext === "png" ? "png" : "jpg";
  const contentType = safeExt === "png" ? "image/png" : "image/jpeg";
  const storagePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("payment_receipts")
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Receipt upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: pub } = supabase.storage
    .from("payment_receipts")
    .getPublicUrl(storagePath);

  const { data: submission, error: insertError } = await supabase
    .from("payment_submissions")
    .insert({
      user_id: user.id,
      parent_name: parentName || user.email || "Parent",
      parent_phone: parentPhone,
      amount,
      receipt_url: pub.publicUrl,
      receipt_path: storagePath,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: `Could not record payment submission: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, submission }, { status: 201 });
}
