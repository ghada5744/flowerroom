import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "uploads";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-only client with service role — never expose this key to the browser. */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Public bucket for product photos (shop must be able to display them).
 * Write/delete are blocked for strangers via Storage RLS — only this
 * service-role client (admin upload API) can change objects.
 * Re-lock with: scripts/lock-storage-policies.sql
 */
export async function ensureUploadsBucket(admin: SupabaseClient) {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error && !/already exists/i.test(error.message)) {
      throw new Error(`Could not create storage bucket: ${error.message}`);
    }
  }
}

export async function uploadPublicImage(params: {
  folder: string;
  filename: string;
  bytes: Buffer;
  contentType: string;
}) {
  const admin = getSupabaseAdmin();
  await ensureUploadsBucket(admin);

  const path = `${params.folder}/${params.filename}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, params.bytes, {
    contentType: params.contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export { BUCKET as SUPABASE_UPLOADS_BUCKET };
