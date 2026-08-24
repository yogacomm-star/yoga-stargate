import Image from "next/image";

// Il file logo.png ha il testo "STARGATE / YOGA" incollato dentro l'immagine: a piccole
// dimensioni (navbar, sidebar) diventa illeggibile. Qui usiamo solo l'icona (icon-512.png,
// senza testo) accanto a una scritta HTML vera, sempre nitida a ogni dimensione.
export default function Logo({
  iconSize = 44,
  textClassName = "text-lg",
  className = "",
}: {
  iconSize?: number;
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/icon-512.png"
        alt="Yoga Stargate"
        width={512}
        height={512}
        style={{ height: iconSize, width: iconSize }}
        className="object-contain"
        priority
      />
      <span className={`font-bold tracking-[0.08em] text-foreground uppercase ${textClassName}`}>Stargate</span>
    </span>
  );
}
