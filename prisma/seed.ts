import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

function readTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@yogastargate.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "YogaStargate2026!";

  await prisma.account.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await hash(adminPassword),
      name: "Tina Mastandrea",
      role: "ADMIN",
      level: 3,
    },
  });

  const members = [
    { email: "maria@example.com", name: "Maria Bianchi", level: 1 },
    { email: "luca@example.com", name: "Luca Verdi", level: 2 },
    { email: "sara@example.com", name: "Sara Rossi", level: 3 },
  ];
  for (const m of members) {
    await prisma.account.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        passwordHash: await hash("Membro2026!"),
        name: m.name,
        role: "MEMBER",
        level: m.level,
      },
    });
  }

  const retreats = [
    {
      slug: "ritiro-trasformativo-assisi",
      title: "Ritiro Trasformativo sulla Via Micaelica di Assisi",
      category: "Trasformativo",
      location: "Assisi (PG)",
      excerpt: "Un cammino di tre giorni sulla via micaelica per riconnettersi con la propria essenza tra natura e silenzio.",
      description:
        "Un ritiro immersivo lungo l'antica via micaelica di Assisi: pratiche di yoga multidimensionale, meditazioni guidate, camminate consapevoli e cerchi di condivisione. Un'esperienza pensata per chiunque desideri fermarsi, respirare e riattivare la propria frequenza interiore.",
      startDate: new Date("2026-10-09"),
      endDate: new Date("2026-10-11"),
      price: 390,
      images: JSON.stringify(["/images/ritiro-assisi-terrazza.png"]),
      itinerary: JSON.stringify([
        { day: 1, title: "Arrivo e apertura del cerchio", description: "Accoglienza, pratica yoga serale e meditazione di apertura." },
        { day: 2, title: "Cammino sulla via micaelica", description: "Camminata consapevole, pratica al sole, cerchio di condivisione serale." },
        { day: 3, title: "Integrazione e saluti", description: "Meditazione mattutina, pratica di chiusura e rientro." },
      ]),
      requiredLevel: null,
      ctaLabel: "Richiedi informazioni",
      ctaUrl: null,
      status: "PUBLISHED" as const,
    },
    {
      slug: "ritiro-esperienziale-milano",
      title: "Ritiro Esperienziale Yoga Stargate",
      category: "Esperienziale",
      location: "Milano",
      excerpt: "Una giornata immersiva per scoprire il portale delle nuove esperienze yogiche.",
      description:
        "Un'esperienza di un giorno pensata per chi vuole avvicinarsi allo Yoga Stargate: pratica dinamica, meditazione multidimensionale e un momento di condivisione per aprire nuove percezioni di sé.",
      startDate: new Date("2026-09-13"),
      endDate: new Date("2026-09-13"),
      price: 90,
      images: JSON.stringify(["/images/cerchio-meditazione-parco.png"]),
      itinerary: JSON.stringify([
        { day: 1, title: "Giornata esperienziale", description: "Pratica yoga, meditazione multidimensionale e cerchio finale." },
      ]),
      requiredLevel: null,
      ctaLabel: "Richiedi informazioni",
      ctaUrl: null,
      status: "PUBLISHED" as const,
    },
    {
      slug: "la-via-della-consapevolezza",
      title: "La Via della Consapevolezza",
      category: "Consapevolezza",
      location: "Milano",
      excerpt: "Un ritiro per chi ha già consolidato le basi della pratica e vuole tornare alla propria essenza originaria.",
      description:
        "Un percorso più profondo, riservato a chi ha già esperienza di pratica: consapevolezza originaria, tecniche di respiro avanzate e meditazioni per riconnettersi con l'essenza autentica.",
      startDate: new Date("2026-11-14"),
      endDate: new Date("2026-11-15"),
      price: 220,
      images: JSON.stringify(["/images/ritiro-loto-blu.png"]),
      itinerary: JSON.stringify([
        { day: 1, title: "Consapevolezza del corpo", description: "Pratica avanzata e lavoro sul respiro." },
        { day: 2, title: "Ritorno all'essenza", description: "Meditazione profonda e cerchio di chiusura." },
      ]),
      requiredLevel: 2,
      ctaLabel: "Richiedi informazioni",
      ctaUrl: null,
      status: "PUBLISHED" as const,
    },
    {
      slug: "shakty-radiance",
      title: "Shakty Radiance",
      category: "Trasformativo",
      location: "Italia",
      excerpt: "Un ritiro intensivo di quattro giorni per attivare la propria energia femminile radiante.",
      description:
        "Quattro giorni dedicati al risveglio dell'energia Shakty: pratiche di attivazione energetica, danza sacra, meditazioni multidimensionali e cerchi di donne, per chi ha già intrapreso il cammino con Yoga Stargate.",
      startDate: new Date("2027-04-30"),
      endDate: new Date("2027-05-03"),
      price: 490,
      images: JSON.stringify(["/images/ritiro-villa-piscina.png"]),
      itinerary: JSON.stringify([
        { day: 1, title: "Apertura energetica", description: "Cerchio di apertura e prima attivazione." },
        { day: 2, title: "Danza sacra", description: "Pratica di movimento e meditazione dinamica." },
        { day: 3, title: "Attivazione Shakty", description: "Rituale centrale del ritiro." },
        { day: 4, title: "Integrazione", description: "Chiusura e rientro." },
      ]),
      requiredLevel: 2,
      ctaLabel: "Richiedi informazioni",
      ctaUrl: null,
      status: "PUBLISHED" as const,
    },
    {
      slug: "meditazioni-multidimensionali",
      title: "Meditazioni Multidimensionali",
      category: "Consapevolezza",
      location: "Italia",
      excerpt: "Un ritiro avanzato di quattro giorni per chi ha già esplorato a fondo la pratica meditativa multidimensionale.",
      description:
        "Riservato alle allieve e agli allievi più avanzati: un percorso di quattro giorni tra meditazioni multidimensionali, neuroscienza applicata alla pratica e rituali di trasformazione profonda.",
      startDate: new Date("2027-06-18"),
      endDate: new Date("2027-06-21"),
      price: 520,
      images: JSON.stringify(["/images/yoga-multidimensionale-spiaggia.png"]),
      itinerary: JSON.stringify([
        { day: 1, title: "Apertura del campo", description: "Meditazione di gruppo e taratura energetica." },
        { day: 2, title: "Neuroscienza e pratica", description: "Approfondimento teorico ed esperienziale." },
        { day: 3, title: "Rituale di trasformazione", description: "Pratica centrale del ritiro." },
        { day: 4, title: "Chiusura", description: "Integrazione e saluti." },
      ]),
      requiredLevel: 3,
      ctaLabel: "Richiedi informazioni",
      ctaUrl: null,
      status: "PUBLISHED" as const,
    },
    {
      slug: "viaggio-yoga-marocco",
      title: "Viaggio Yoga & Tour — Marocco",
      category: "Viaggio",
      location: "Marocco",
      excerpt: "Un viaggio spirituale tra deserto e pratica yoga, alla scoperta di luoghi sacri.",
      description:
        "Un tour spirituale in Marocco: pratica yoga e meditazione in contesti straordinari, tra deserto, medine e luoghi di grande valore energetico.",
      startDate: new Date("2027-03-05"),
      endDate: new Date("2027-03-12"),
      price: 1290,
      images: JSON.stringify(["/images/ritiro-deserto-marocco.jpeg"]),
      itinerary: JSON.stringify([]),
      requiredLevel: null,
      ctaLabel: "Scopri il viaggio",
      ctaUrl: null,
      status: "DRAFT" as const,
    },
  ];

  for (const r of retreats) {
    await prisma.retreat.upsert({ where: { slug: r.slug }, update: {}, create: r });
  }

  const courses = [
    {
      slug: "yoga-stargate-lezioni-base",
      title: "Yoga Stargate Lezioni — Percorso Base",
      category: "Lezioni",
      excerpt: "Il punto di partenza del metodo Yoga Stargate: pratiche accessibili a chiunque voglia iniziare.",
      description:
        "Un percorso introduttivo al metodo Yoga Stargate, pensato per chi muove i primi passi: respiro, postura, ascolto del corpo e prime pratiche di meditazione multidimensionale.",
      lessons: JSON.stringify([
        { title: "Le basi del respiro consapevole", videoUrl: "", content: "Introduzione alla respirazione consapevole come fondamento della pratica." },
        { title: "Postura e radicamento", videoUrl: "", content: "Le posizioni base per costruire stabilità e presenza." },
      ]),
      coverImage: "/images/lezione-parco-milano.jpeg",
      requiredLevel: null,
      status: "PUBLISHED" as const,
    },
    {
      slug: "sette-giorni-per-meditare-bene",
      title: "7 Giorni per Meditare Bene",
      category: "Risorsa gratuita",
      excerpt: "Sette guide audio gratuite per costruire una pratica meditativa quotidiana.",
      description: "Una guida gratuita in sette tappe per costruire, giorno dopo giorno, una pratica meditativa stabile e sostenibile.",
      lessons: JSON.stringify(
        Array.from({ length: 7 }, (_, i) => ({
          title: `Giorno ${i + 1}`,
          videoUrl: "",
          content: `Guida meditativa del giorno ${i + 1}.`,
        }))
      ),
      coverImage: null,
      requiredLevel: 1, // gratuito ma richiede la registrazione (livello Base)
      status: "PUBLISHED" as const,
    },
    {
      slug: "rituali-di-trasformazione",
      title: "Rituali di Trasformazione",
      category: "Rituali",
      excerpt: "Pratiche rituali immersive per chi ha già consolidato le basi dello Yoga Stargate.",
      description:
        "Un corso intermedio dedicato ai rituali di trasformazione: pratiche energetiche più profonde, visualizzazioni guidate e lavoro simbolico.",
      lessons: JSON.stringify([
        { title: "Il rituale come pratica di trasformazione", videoUrl: "", content: "Perché e come i rituali accompagnano il cambiamento interiore." },
        { title: "Visualizzazione guidata", videoUrl: "", content: "Pratica guidata di visualizzazione energetica." },
      ]),
      coverImage: "/images/rituali-shiva.jpg",
      requiredLevel: 2,
      status: "PUBLISHED" as const,
    },
    {
      slug: "meditazioni-multidimensionali-avanzate",
      title: "Meditazioni Multidimensionali Avanzate",
      category: "Meditazione",
      excerpt: "Il corso avanzato per chi vuole approfondire la meditazione multidimensionale con Tina Mastandrea.",
      description:
        "Riservato alle praticanti e ai praticanti più avanzati: tecniche di meditazione multidimensionale, integrazione con la neuroscienza e pratiche di espansione della coscienza.",
      lessons: JSON.stringify([
        { title: "Neuroscienza e meditazione", videoUrl: "", content: "Le basi neuroscientifiche della pratica multidimensionale." },
        { title: "Espansione della coscienza", videoUrl: "", content: "Pratica guidata avanzata." },
      ]),
      coverImage: "/images/meditazione-neuroscienza.jpg",
      requiredLevel: 3,
      status: "PUBLISHED" as const,
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const posts = [
    {
      slug: "scopri-lo-yoga-multidimensionale",
      title: "Scopri lo Yoga Multidimensionale",
      category: "Yoga",
      excerpt: "Cos'è lo Yoga Multidimensionale e perché unisce pratica, neuroscienza ed esplorazione spirituale.",
      content:
        "Lo Yoga Multidimensionale nasce dall'incontro tra la pratica yogica tradizionale, le neuroscienze e l'esplorazione spirituale. In questo articolo scopriamo insieme i principi fondamentali di questo approccio e come può aiutarti ad attivare una nuova frequenza interiore, giorno dopo giorno, attraverso il respiro, il movimento e la meditazione consapevole.",
      featuredImage: "/images/blog-yoga-multidimensionale.png",
      author: "Tina Mastandrea",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-06-02"),
    },
    {
      slug: "riprogrammare-il-corpo",
      title: "Riprogrammare il Corpo",
      category: "Consapevolezza Quotidiana",
      excerpt: "Come la pratica costante può aiutarti a riprogrammare abitudini fisiche e mentali.",
      content:
        "Il corpo conserva memoria delle abitudini, delle tensioni e dei pattern che ripetiamo ogni giorno. Attraverso una pratica costante e consapevole possiamo iniziare a riprogrammare queste abitudini, creando nuovo spazio per il benessere fisico e mentale. In questo articolo alcuni strumenti pratici per iniziare.",
      featuredImage: "/images/blog-riprogrammare-corpo.png",
      author: "Tina Mastandrea",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-07-10"),
    },
    {
      slug: "i-segreti-della-longevita",
      title: "I Segreti della Longevità",
      category: "Yoga",
      excerpt: "Cosa ci insegna la pratica yogica millenaria sulla longevità e sull'equilibrio energetico.",
      content:
        "La longevità non riguarda solo il corpo fisico, ma l'equilibrio tra energia, respiro e mente. In questo articolo esploriamo alcune pratiche e princìpi che, secondo la tradizione yogica, contribuiscono a una vita più lunga, equilibrata e consapevole.",
      featuredImage: "/images/blog-longevita.jpg",
      author: "Tina Mastandrea",
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-08-05"),
    },
  ];

  for (const p of posts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, readTimeMinutes: readTime(p.content) },
    });
  }

  console.log("Seed completato.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
