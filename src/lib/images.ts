export function firstImage(json: string): string | null {
  try {
    const arr = JSON.parse(json) as string[];
    return arr[0] ?? null;
  } catch {
    return null;
  }
}
