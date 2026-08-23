import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME || "yoga-stargate-media";

function getClient(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function r2Configured(): boolean {
  return !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
}

export async function uploadToR2(key: string, bytes: Uint8Array, contentType: string): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("Storage non configurato (mancano le variabili R2).");

  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: bytes, ContentType: contentType })
  );

  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return `${publicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
