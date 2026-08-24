import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { uploadToR2, uploadToPrivateR2, r2Configured } from "@/lib/r2";
import { canUploadBytes } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES: Record<string, { ext: string; folder: string; maxSize: number; audio?: boolean }> = {
  "image/jpeg": { ext: "jpg", folder: "images", maxSize: 5 * 1024 * 1024 },
  "image/png": { ext: "png", folder: "images", maxSize: 5 * 1024 * 1024 },
  "image/webp": { ext: "webp", folder: "images", maxSize: 5 * 1024 * 1024 },
  "audio/mpeg": { ext: "mp3", folder: "audio", maxSize: 150 * 1024 * 1024, audio: true },
  "audio/x-m4a": { ext: "m4a", folder: "audio", maxSize: 150 * 1024 * 1024, audio: true },
  "audio/mp4": { ext: "m4a", folder: "audio", maxSize: 150 * 1024 * 1024, audio: true },
};

// Firme binarie (magic bytes) dei formati ammessi: evita che un file venga accettato
// solo perché il client dichiara un Content-Type diverso dal contenuto reale.
function matchesSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return png.every((b, i) => bytes[i] === b);
  }
  if (mimeType === "image/webp") {
    return (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    );
  }
  if (mimeType === "audio/mpeg") {
    const hasId3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
    const hasFrameSync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
    return hasId3 || hasFrameSync;
  }
  if (mimeType === "audio/x-m4a" || mimeType === "audio/mp4") {
    // Contenitore MP4/M4A: bytes 4-7 sono sempre "ftyp".
    return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
  }
  return false;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (!r2Configured()) {
    return NextResponse.json({ error: "Storage non ancora configurato (mancano le variabili R2)." }, { status: 400 });
  }

  const { allowed: rateAllowed } = rateLimit(`upload:${clientIp(request)}`, 30, 60 * 60 * 1000);
  if (!rateAllowed) return NextResponse.json({ error: "Troppi caricamenti. Riprova più tardi." }, { status: 429 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const visibility = formData?.get("visibility") === "private" ? "private" : "public";
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nessun file ricevuto." }, { status: 400 });
  }

  const spec = ALLOWED_TYPES[file.type];
  if (!spec) {
    return NextResponse.json({ error: "Formato non supportato. Usa JPG, PNG, WEBP, MP3 o M4A." }, { status: 400 });
  }
  if (visibility === "private" && !spec.audio) {
    return NextResponse.json({ error: "Solo i file audio possono essere privati." }, { status: 400 });
  }
  if (file.size > spec.maxSize) {
    return NextResponse.json({ error: `Il file supera i ${Math.round(spec.maxSize / (1024 * 1024))}MB.` }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(bytes, file.type)) {
    return NextResponse.json({ error: "Il contenuto del file non corrisponde al formato dichiarato." }, { status: 400 });
  }

  const { allowed: spaceAllowed, usedBytes, limitBytes } = await canUploadBytes(file.size);
  if (!spaceAllowed) {
    const usedGb = (Number(usedBytes) / 1e9).toFixed(2);
    const limitGb = (Number(limitBytes) / 1e9).toFixed(2);
    return NextResponse.json(
      {
        error: `Spazio di archiviazione esaurito (${usedGb}GB su ${limitGb}GB). Elimina dei file oppure disattiva il tetto di sicurezza nelle Impostazioni.`,
      },
      { status: 507 }
    );
  }

  const key = `${spec.folder}/${randomUUID()}.${spec.ext}`;

  if (visibility === "private") {
    await uploadToPrivateR2(key, bytes, file.type);
    await prisma.mediaAsset.create({ data: { key, url: "", sizeBytes: file.size, mimeType: file.type } });
    return NextResponse.json({ key });
  }

  const url = await uploadToR2(key, bytes, file.type);
  await prisma.mediaAsset.create({ data: { key, url, sizeBytes: file.size, mimeType: file.type } });
  return NextResponse.json({ url });
}
