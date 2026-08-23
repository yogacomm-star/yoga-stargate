import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getAppSettings() {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function getStorageUsedBytes(): Promise<bigint> {
  const result = await prisma.mediaAsset.aggregate({ _sum: { sizeBytes: true } });
  return BigInt(result._sum.sizeBytes ?? 0);
}

// Verifica se un nuovo file può essere caricato senza superare il tetto di sicurezza
// impostato dall'admin (protegge dal passare al piano a pagamento di Cloudflare R2).
export async function canUploadBytes(
  newBytes: number
): Promise<{ allowed: boolean; usedBytes: bigint; limitBytes: bigint; limitEnabled: boolean }> {
  const settings = await getAppSettings();
  const usedBytes = await getStorageUsedBytes();

  if (!settings.storageLimitEnabled) {
    return { allowed: true, usedBytes, limitBytes: settings.storageLimitBytes, limitEnabled: false };
  }

  const allowed = usedBytes + BigInt(newBytes) <= settings.storageLimitBytes;
  return { allowed, usedBytes, limitBytes: settings.storageLimitBytes, limitEnabled: true };
}
