import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { driveConfigured, extractFolderId, listFolder, downloadDriveFile, exportGoogleDoc, getFolderName } from "@/lib/drive";
import { uploadToR2, uploadToPrivateR2 } from "@/lib/r2";
import { canUploadBytes } from "@/lib/storage";
import { slugify } from "@/lib/slug";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  folderUrl: z.string().trim().min(5).max(500),
  price: z.number().min(0).max(9999).nullable().optional(),
});

const AUDIO_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/x-m4a": "m4a",
  "audio/mp4": "m4a",
};

function leadingNumber(name: string): number {
  const m = name.match(/^\s*(\d+)/);
  return m ? parseInt(m[1], 10) : Infinity;
}

function cleanLessonTitle(filename: string): string {
  const withoutExt = filename.replace(/\.(mp3|m4a)$/i, "");
  const cleaned = withoutExt.replace(/^\s*\d+\s*[-.]?\s*/, "").trim();
  return cleaned || withoutExt.trim();
}

// L'importazione (download da Drive + upload su R2 di più file, potenzialmente centinaia
// di MB) continua in background dopo aver risposto: evita di far scadere la richiesta HTTP
// su cartelle grandi. Il corso è creato subito come bozza segnaposto e aggiornato al termine.
async function runImport(courseId: string, folderId: string, price: number | null) {
  try {
    const files = await listFolder(folderId);
    const docFile = files.find((f) => f.mimeType === "application/vnd.google-apps.document");
    const imageFiles = files
      .filter((f) => f.mimeType.startsWith("image/"))
      .sort((a, b) => Number(b.name.toLowerCase().includes("cover")) - Number(a.name.toLowerCase().includes("cover")));
    const audioFiles = files
      .filter((f) => f.mimeType in AUDIO_EXT)
      .sort((a, b) => leadingNumber(a.name) - leadingNumber(b.name) || a.name.localeCompare(b.name));

    if (audioFiles.length === 0) {
      await prisma.course.update({
        where: { id: courseId },
        data: { excerpt: "Importazione fallita: nessun file audio trovato nella cartella." },
      });
      return;
    }

    const description = docFile ? await exportGoogleDoc(docFile.id) : "";
    const words = description.split(/\s+/).filter(Boolean);
    const excerpt = words.length ? words.slice(0, 30).join(" ") + (words.length > 30 ? "…" : "") : "Corso importato da Drive.";

    const isPrivate = !!price;

    let coverImage: string | null = null;
    const coverFile = imageFiles[0];
    if (coverFile) {
      const bytes = await downloadDriveFile(coverFile.id);
      const key = `images/${randomUUID()}.jpg`;
      coverImage = await uploadToR2(key, bytes, "image/jpeg");
      await prisma.mediaAsset.create({ data: { key, url: coverImage, sizeBytes: bytes.length, mimeType: "image/jpeg" } });
    }

    const lessons: { title: string; videoUrl: string; content: string; audioUrl?: string; audioKey?: string }[] = [];
    for (const f of audioFiles) {
      const ext = AUDIO_EXT[f.mimeType];
      const bytes = await downloadDriveFile(f.id);
      const lessonTitle = cleanLessonTitle(f.name);

      if (isPrivate) {
        const key = `audio/${randomUUID()}.${ext}`;
        await uploadToPrivateR2(key, bytes, f.mimeType);
        await prisma.mediaAsset.create({ data: { key, url: "", sizeBytes: bytes.length, mimeType: f.mimeType } });
        lessons.push({ title: lessonTitle, videoUrl: "", content: "", audioKey: key });
      } else {
        const key = `audio/${randomUUID()}.${ext}`;
        const url = await uploadToR2(key, bytes, f.mimeType);
        await prisma.mediaAsset.create({ data: { key, url, sizeBytes: bytes.length, mimeType: f.mimeType } });
        lessons.push({ title: lessonTitle, videoUrl: "", content: "", audioUrl: url });
      }
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        excerpt,
        description: description || undefined,
        coverImage,
        lessons: JSON.stringify(lessons),
      },
    });
  } catch (err) {
    await prisma.course.update({
      where: { id: courseId },
      data: { excerpt: `Importazione fallita: ${err instanceof Error ? err.message : "errore sconosciuto"}` },
    });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (!driveConfigured()) {
    return NextResponse.json({ error: "Importazione da Drive non configurata (manca GOOGLE_DRIVE_API_KEY)." }, { status: 400 });
  }

  const { allowed } = rateLimit(`drive-import:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe importazioni, riprova più tardi." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const folderId = extractFolderId(parsed.data.folderUrl);
  if (!folderId) return NextResponse.json({ error: "Link della cartella Drive non valido." }, { status: 400 });

  let files;
  try {
    files = await listFolder(folderId);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore." }, { status: 502 });
  }
  if (files.length === 0) {
    return NextResponse.json(
      { error: 'Cartella vuota o non accessibile. Verifica che sia condivisa come "chiunque abbia il link".' },
      { status: 400 }
    );
  }

  const totalBytes = files.reduce((sum, f) => sum + Number(f.size || 0), 0);
  const { allowed: spaceOk, usedBytes, limitBytes } = await canUploadBytes(totalBytes);
  if (!spaceOk) {
    const missingGb = ((Number(limitBytes) - Number(usedBytes)) / 1e9).toFixed(2);
    return NextResponse.json(
      { error: `Spazio insufficiente: servono circa ${(totalBytes / 1e9).toFixed(2)}GB, ne restano ${missingGb}GB liberi.` },
      { status: 507 }
    );
  }

  const folderName = await getFolderName(folderId);
  let slug = slugify(folderName);
  let suffix = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugify(folderName)}-${suffix}`;
  }

  const course = await prisma.course.create({
    data: {
      title: folderName,
      slug,
      category: "Meditazione",
      excerpt: "Importazione in corso... aggiorna questa pagina tra qualche minuto.",
      description: "Importazione in corso.",
      price: parsed.data.price ?? null,
      requiredLevel: null,
      status: "DRAFT",
      lessons: "[]",
    },
  });

  // Su piattaforme serverless (Netlify) l'esecuzione può interrompersi subito dopo la
  // risposta HTTP: after() dice al runtime di tenere in vita l'importazione finché non
  // finisce, invece del fire-and-forget che basterebbe su un processo Node persistente.
  after(runImport(course.id, folderId, parsed.data.price ?? null));

  return NextResponse.json({ ok: true, id: course.id });
}
