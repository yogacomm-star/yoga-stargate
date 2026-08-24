import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/site/LoginForm";

export const metadata: Metadata = { title: "Accesso Admin · Yoga Stargate" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo-icon.png" alt="Yoga Stargate" width={512} height={512} className="mb-3 h-20 w-20 object-contain" />
          <h1 className="font-heading text-2xl font-semibold text-foreground">Pannello Admin</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-md sm:p-8">
          <LoginForm adminHint />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="cursor-pointer text-foreground/60 hover:text-primary">
            ← Torna al sito
          </Link>
        </p>
      </div>
    </div>
  );
}
