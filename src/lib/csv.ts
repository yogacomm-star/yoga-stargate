export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const escape = (v: string | number | null) => {
    let s = v == null ? "" : String(v);
    // Neutralizza l'injection di formule (es. =HYPERLINK(...)) nei campi che finiscono
    // in un file aperto con Excel/Sheets: un carattere iniziale =/+/-/@ verrebbe
    // interpretato come inizio formula. I dati qui provengono da form pubblici non autenticati.
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  return lines.join("\n");
}
