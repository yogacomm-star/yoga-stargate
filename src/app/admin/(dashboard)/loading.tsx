import Image from "next/image";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Image src="/logo-icon.png" alt="" width={80} height={80} priority className="h-14 w-14 animate-breathe object-contain" />
      <p className="text-sm text-foreground/50">Caricamento...</p>
    </div>
  );
}
