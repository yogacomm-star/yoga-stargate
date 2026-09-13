import Image from "next/image";

// Sostituisce il vecchio video (stargate-loading.mp4, 1MB) mostrato a ogni cambio pagina:
// stesso concetto — un portale che si apre, il respiro — ma solo CSS e il logo già in
// cache del sito, zero peso aggiuntivo da scaricare.
export default function StargateLoader({ size = 160 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <span
        className="animate-portal-ring absolute inset-0 rounded-full border-2 border-mystic/50"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="animate-portal-ring absolute inset-0 rounded-full border-2 border-primary/50"
        style={{ animationDelay: "0.8s" }}
      />
      <span
        className="animate-portal-ring absolute inset-0 rounded-full border-2 border-accent/50"
        style={{ animationDelay: "1.6s" }}
      />
      <Image
        src="/logo-icon.png"
        alt=""
        width={512}
        height={512}
        priority
        className="animate-breathe relative"
        style={{ width: size * 0.55, height: size * 0.55 }}
      />
    </div>
  );
}
