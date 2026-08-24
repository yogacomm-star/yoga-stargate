const API_BASE = "https://www.googleapis.com/drive/v3/files";

export function driveConfigured(): boolean {
  return !!process.env.GOOGLE_DRIVE_API_KEY;
}

// Accetta sia un link completo (https://drive.google.com/drive/folders/XXXX) sia un ID nudo.
export function extractFolderId(input: string): string | null {
  const fromUrl = input.match(/folders\/([a-zA-Z0-9_-]{10,})/);
  if (fromUrl) return fromUrl[1];
  const bare = input.trim().match(/^[a-zA-Z0-9_-]{10,}$/);
  return bare ? bare[0] : null;
}

export type DriveFile = { id: string; name: string; mimeType: string; size?: string };

function apiKey(): string {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  if (!key) throw new Error("GOOGLE_DRIVE_API_KEY non configurata.");
  return key;
}

export async function getFolderName(folderId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${folderId}?fields=name&key=${apiKey()}`);
  if (!res.ok) return "Corso importato";
  const data = await res.json();
  return data.name || "Corso importato";
}

export async function listFolder(folderId: string): Promise<DriveFile[]> {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(`${API_BASE}?q=${q}&fields=files(id,name,mimeType,size)&pageSize=200&key=${apiKey()}`);
  if (!res.ok) {
    throw new Error(
      `Impossibile leggere la cartella Drive (errore ${res.status}). Verifica che sia condivisa come "chiunque abbia il link può visualizzare".`
    );
  }
  const data = await res.json();
  return data.files ?? [];
}

export async function downloadDriveFile(fileId: string): Promise<Uint8Array> {
  const res = await fetch(`${API_BASE}/${fileId}?alt=media&key=${apiKey()}`);
  if (!res.ok) throw new Error(`Download fallito per il file ${fileId} (errore ${res.status}).`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function exportGoogleDoc(fileId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${fileId}/export?mimeType=text/plain&key=${apiKey()}`);
  if (!res.ok) return "";
  return res.text();
}
