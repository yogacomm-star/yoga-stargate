import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.R2_BUCKET_NAME || "yoga-stargate-media";
// Bucket separato e SENZA accesso pubblico: qui vive l'audio dei corsi a pagamento.
// Non ha un URL pubblico associato: l'unico modo per leggerne il contenuto è generare
// un URL firmato con validità breve (vedi getPresignedAudioUrl), dopo aver verificato
// che chi lo richiede ha davvero acquistato il corso.
const PRIVATE_BUCKET = process.env.R2_PRIVATE_BUCKET_NAME || "yoga-stargate-media-private";

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

  await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: bytes, ContentType: contentType }));

  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return `${publicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// Carica un file nel bucket privato (audio dei corsi a pagamento) e restituisce solo
// la sua chiave: a differenza di uploadToR2, qui NON esiste un URL pubblico da salvare.
export async function uploadToPrivateR2(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Storage non configurato (mancano le variabili R2).");
  await client.send(new PutObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key, Body: bytes, ContentType: contentType }));
}

export async function deleteFromPrivateR2(key: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.send(new DeleteObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }));
}

// URL firmato temporaneo (valido pochi minuti) per riprodurre in streaming un audio
// privato: va generato solo dopo aver verificato che chi lo richiede ha diritto ad
// ascoltarlo (acquisto del corso, o utenza admin). Non deve mai essere salvato o
// mostrato come link permanente.
export async function getPresignedAudioUrl(key: string, expiresInSeconds = 600): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("Storage non configurato (mancano le variabili R2).");
  const command = new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
