// Date e orari degli eventi. Nel database c'è un solo campo data/ora per inizio e fine (startDate,
// endDate): un evento senza orario è salvato a mezzanotte UTC (come prima), uno con orario è
// salvato come l'istante reale corrispondente all'ora scritta sull'orologio di Roma. Nessuna
// modifica al database: le date esistenti restano valide e "senza orario".
//
// Questo modulo non dipende da nulla di server: si usa sia nelle pagine sia nei componenti client.
const TZ = "Europe/Rome";

/** Un evento ha un orario se non è esattamente mezzanotte UTC (il valore delle date "solo giorno"). */
export function hasTime(d: Date): boolean {
  return d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0;
}

function tzOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - utcMs;
}

/** "2026-11-04" + "17:00" (ora di Roma) → istante UTC. Senza orario: mezzanotte UTC di quel giorno. */
export function toEventDate(date: string, time?: string | null): Date {
  const [y, m, d] = date.split("-").map(Number);
  if (!time) return new Date(Date.UTC(y, m - 1, d));
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let utc = guess - tzOffsetMs(guess);
  // Vicino al cambio ora legale l'offset all'istante trovato può essere diverso: si ricontrolla.
  const second = guess - tzOffsetMs(utc);
  if (second !== utc) utc = second;
  return new Date(utc);
}

/** Per il modulo admin: giorno ("YYYY-MM-DD") e ora ("HH:mm", vuota se l'evento non ha orario). */
export function eventDateParts(d: Date | null): { date: string; time: string } {
  if (!d) return { date: "", time: "" };
  if (!hasTime(d)) return { date: d.toISOString().slice(0, 10), time: "" };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

function asDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

/** Giorno formattato nel fuso giusto: un evento a mezzanotte UTC resta nel suo giorno, non slitta. */
export function formatEventDate(d: Date | string, options: Intl.DateTimeFormatOptions): string {
  const date = asDate(d);
  return date.toLocaleDateString("it-IT", { ...options, timeZone: hasTime(date) ? TZ : "UTC" });
}

export function formatEventTime(d: Date | string): string | null {
  const date = asDate(d);
  if (!hasTime(date)) return null;
  return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

/** "17:00–20:00" (stesso giorno), "dalle 10:00 alle 16:00" (giorni diversi), "dalle 17:00" (solo inizio). */
export function eventTimeRange(start: Date | string | null, end: Date | string | null): string | null {
  if (!start) return null;
  const s = formatEventTime(start);
  if (!s) return null;
  const e = end ? formatEventTime(end) : null;
  if (!e) return `dalle ${s}`;
  const sameDay =
    formatEventDate(start, { day: "numeric", month: "numeric", year: "numeric" }) ===
    formatEventDate(end!, { day: "numeric", month: "numeric", year: "numeric" });
  return sameDay ? `${s}–${e}` : `dalle ${s} alle ${e}`;
}
