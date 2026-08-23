const CLASSES = [
  { summary: "Yoga Stargate — Lezione del mattino", start: "09:00", end: "10:15" },
  { summary: "Yoga Stargate — Yoga per teenager", start: "17:00", end: "18:00" },
  { summary: "Yoga Stargate — Livello adulti", start: "18:15", end: "19:30" },
  { summary: "Yoga Stargate — Livello avanzato", start: "19:45", end: "21:00" },
];

function nextWednesday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 3=Wed
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  return next;
}

function formatDateTime(date: Date, time: string): string {
  const [h, m] = time.split(":");
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${mo}${d}T${h}${m}00`;
}

export async function GET() {
  const base = nextWednesday();
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const events = CLASSES.map((c, i) => {
    const dtstart = formatDateTime(base, c.start);
    const dtend = formatDateTime(base, c.end);
    return [
      "BEGIN:VEVENT",
      `UID:yoga-stargate-lezione-${i}@yogastargate.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Rome:${dtstart}`,
      `DTEND;TZID=Europe/Rome:${dtend}`,
      "RRULE:FREQ=WEEKLY;BYDAY=WE",
      `SUMMARY:${c.summary}`,
      "LOCATION:Via Zanella 56\\, Milano",
      "END:VEVENT",
    ].join("\r\n");
  }).join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yoga Stargate//IT",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="lezioni-yoga-stargate.ics"`,
    },
  });
}
