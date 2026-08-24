import Image from "next/image";

export default function RootLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <Image
        src="/logo-icon.png"
        alt=""
        width={96}
        height={96}
        priority
        className="h-16 w-16 animate-breathe object-contain sm:h-20 sm:w-20"
      />
      <p className="text-sm text-foreground/50">Un momento, stiamo respirando insieme...</p>
    </div>
  );
}
