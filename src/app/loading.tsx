export default function RootLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="h-64 w-64 object-cover sm:h-96 sm:w-96"
      >
        <source src="/stargate-loading.mp4" type="video/mp4" />
      </video>
      <p className="text-sm text-foreground/50">Un momento, stiamo respirando insieme...</p>
    </div>
  );
}
