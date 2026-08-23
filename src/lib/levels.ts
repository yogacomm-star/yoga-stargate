export const LEVELS = [
  { value: 1, label: "Base", description: "L'inizio del percorso: pratiche accessibili a tutti." },
  { value: 2, label: "Intermedio", description: "Per chi ha già consolidato le basi della pratica." },
  { value: 3, label: "Avanzato", description: "Percorsi profondi riservati alle allieve/i più esperte/i." },
] as const;

export type LevelValue = (typeof LEVELS)[number]["value"];

export function levelLabel(level: number | null | undefined): string {
  if (level == null) return "Aperto a tutti";
  return LEVELS.find((l) => l.value === level)?.label ?? `Livello ${level}`;
}

/**
 * requiredLevel = null → contenuto aperto a tutti (anche non loggati).
 * Altrimenti serve un account con level >= requiredLevel.
 */
export function canAccess(requiredLevel: number | null | undefined, accountLevel: number | null | undefined): boolean {
  if (requiredLevel == null) return true;
  if (accountLevel == null) return false;
  return accountLevel >= requiredLevel;
}
