import StargateLoader from "@/components/site/StargateLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <StargateLoader size={150} />
      <p className="text-sm text-foreground/50">Un momento, stiamo respirando insieme...</p>
    </div>
  );
}
