import Image from "next/image";

// Il file logo.png ha il testo "STARGATE / YOGA" incollato dentro l'immagine: a piccole
// dimensioni (navbar, sidebar) diventa illeggibile. Qui usiamo solo l'icona (icon-512.png,
// senza testo) accanto a una scritta HTML vera, sempre nitida a ogni dimensione — "Stargate"
// in un nero pesante (font-black) con "Yoga" più piccolo sotto, come nel logo originale.
export default function Logo({
  iconSize = 44,
  textClassName = "flex flex-col text-lg",
  className = "",
}: {
  iconSize?: number;
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-icon.png"
        alt="Yoga Stargate"
        width={512}
        height={512}
        style={{ height: iconSize, width: iconSize }}
        className="object-contain"
        priority
      />
      <span className={`leading-none ${textClassName}`}>
        <span className="block font-black tracking-[0.04em] text-foreground uppercase">Stargate</span>
        <span className="mt-0.5 block text-[0.5em] font-semibold tracking-[0.35em] text-primary uppercase">
          Yoga
        </span>
      </span>
    </span>
  );
}
