// Feed .ics dei prossimi appuntamenti dei Percorsi Live. A differenza delle vecchie lezioni
// settimanali (un unico evento ricorrente ogni mercoledì), Masterclass e Workshop hanno
// cadenze diverse (mensile/trimestrale) su date specifiche: qui sotto vanno quindi aggiornate
// a mano man mano che si fissano le prossime date, invece di un'unica regola di ricorrenza.
const EVENTS = [
  {
    uid: "masterclass-2026-10-21",
    summary: "Yoga Stargate — Masterclass: Pratiche di Risveglio",
    start: "20261021T170000",
    end: "20261021T190000",
  },
  {
    uid: "workshop-2026-11-04",
    summary: "Yoga Stargate — Workshop Trimestrale",
    start: "20261104T170000",
    end: "20261104T200000",
  },
];

export async function GET() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const events = EVENTS.map((e) =>
    [
      "BEGIN:VEVENT",
      `UID:${e.uid}@yogastargate.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Rome:${e.start}`,
      `DTEND;TZID=Europe/Rome:${e.end}`,
      `SUMMARY:${e.summary}`,
      "LOCATION:Spazio Olistico Pachamama\\, Milano",
      "END:VEVENT",
    ].join("\r\n")
  ).join("\r\n");

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
      "Content-Disposition": `attachment; filename="percorsi-live-yoga-stargate.ics"`,
    },
  });
}
