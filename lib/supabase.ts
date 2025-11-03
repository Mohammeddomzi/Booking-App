import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function uploadFile(
  file: File,
  bucket: string = "receipts",
  folder: string = "bookings"
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random()}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function getSignedUploadUrl(
  fileName: string,
  bucket: string = "receipts",
  folder: string = "bookings"
): Promise<string> {
  const fileExt = fileName.split(".").pop();
  const filePath = `${folder}/${Date.now()}-${Math.random()}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(filePath);

  if (error) {
    throw new Error(`Failed to create upload URL: ${error.message}`);
  }

  return data.signedUrl;
}
