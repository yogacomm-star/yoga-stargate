export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="h-40 w-40 object-contain sm:h-56 sm:w-56"
      >
        <source src="/stargate-loading.mp4" type="video/mp4" />
      </video>
      <p className="text-sm text-foreground/50">Un momento, stiamo respirando insieme...</p>
    </div>
  );
}
