"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, User, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { levelLabel } from "@/lib/levels";
import type { NavAccount } from "@/lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/chi-sono", label: "Chi Sono" },
  { href: "/my-yoga", label: "Metodo" },
  { href: "/ritiri", label: "Ritiri" },
  { href: "/corsi", label: "Corsi" },
  { href: "/blog", label: "Blog" },
  { href: "/contatti", label: "Contatti" },
];

const panelVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const, staggerChildren: 0.03, delayChildren: 0.04 },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" as const } },
};

const itemVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0 },
};

export default function Navbar({ account }: { account: NavAccount }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Chiude il menu quando cambia pagina (pattern "adjusting state during render").
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-soft-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="relative z-[60] mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="Yoga Stargate" width={500} height={500} className="h-14 w-14 object-contain" priority />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/cerca"
            aria-label="Cerca nel sito"
            className="cursor-pointer rounded-full p-2.5 text-foreground/70 transition-colors hover:bg-muted hover:text-primary"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          {!account && (
            <Link
              href="/login"
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
            >
              Accedi
            </Link>
          )}

          {account?.role === "MEMBER" && (
            <Link
              href="/account"
              className="hidden cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5 sm:flex"
            >
              <User className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="max-w-[7rem] truncate">{account.name}</span>
              <span className="badge-level">{levelLabel(account.level)}</span>
            </Link>
          )}
          {account?.role === "MEMBER" && (
            <Link
              href="/account"
              aria-label="Il mio account"
              className="flex cursor-pointer items-center rounded-full p-2.5 text-foreground/70 hover:bg-muted hover:text-primary sm:hidden"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}

          {account?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Pannello Admin</span>
            </Link>
          )}

          {account && (
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Esci"
                className="hidden cursor-pointer rounded-full px-2.5 py-2 text-xs font-medium text-foreground/50 transition-colors hover:text-destructive sm:block"
              >
                Esci
              </button>
            </form>
          )}

          <button
            type="button"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="cursor-pointer p-2.5 text-foreground"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "open"}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Chiudi il menu"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 cursor-default bg-transparent"
            />
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-y-auto bg-card pt-20 sm:absolute sm:inset-x-0 sm:inset-y-auto sm:top-full sm:h-auto sm:flex-none sm:overflow-visible sm:border-b sm:border-border sm:pt-0 sm:shadow-soft-lg"
            >
              <ul className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-2 sm:flex-none sm:px-6">
                {links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <motion.li key={link.href} variants={itemVariants} className="border-b border-border/60 last:border-0">
                      <Link
                        href={link.href}
                        className={`block cursor-pointer py-4 text-lg font-medium transition-colors hover:text-primary sm:py-3 sm:text-base ${
                          active ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
                {account && (
                  <motion.li variants={itemVariants} className="sm:hidden">
                    <form action={logoutAction}>
                      <button type="submit" className="w-full cursor-pointer py-4 text-left text-lg font-medium text-foreground/60">
                        Esci
                      </button>
                    </form>
                  </motion.li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
