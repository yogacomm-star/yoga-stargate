export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <video autoPlay muted loop playsInline className="h-32 w-32 object-contain">
        <source src="/stargate-loading.mp4" type="video/mp4" />
      </video>
      <p className="text-sm text-foreground/50">Caricamento...</p>
    </div>
  );
}
