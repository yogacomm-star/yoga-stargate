import StargateLoader from "@/components/site/StargateLoader";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <StargateLoader size={110} />
      <p className="text-sm text-foreground/50">Caricamento...</p>
    </div>
  );
}
