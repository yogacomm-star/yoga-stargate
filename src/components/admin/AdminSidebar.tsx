"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, GraduationCap, Newspaper, Users, Mail, Euro, Settings, ExternalLink, Menu, X } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import Logo from "@/components/site/Logo";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/ritiri", label: "Ritiri", icon: Compass },
  { href: "/admin/corsi", label: "Corsi", icon: GraduationCap },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/utenti", label: "Utenti", icon: Users },
  { href: "/admin/vendite", label: "Vendite", icon: Euro },
  { href: "/admin/email", label: "Email", icon: Mail },
  { href: "/admin/impostazioni", label: "Impostazioni", icon: Settings },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);

  // Chiude il menu mobile quando cambia pagina (pattern "adjusting state during render").
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-border px-6 py-5 lg:justify-start">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo iconSize={40} textClassName="text-base" />
          <span className="text-xs text-foreground/40">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Chiudi il menu"
          className="cursor-pointer rounded-lg p-2 text-foreground/60 hover:bg-muted lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={`admin-nav-${item.label.toLowerCase()}`}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Vedi il sito
        </Link>
        <div className="px-3 py-2 text-xs text-foreground/50">{adminName}</div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/70 hover:bg-muted"
          >
            Esci
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superiore mobile: solo il pulsante per aprire il menu, sotto i lg diventa la sidebar fissa. */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Apri il menu"
          className="cursor-pointer rounded-lg p-2 text-foreground/70 hover:bg-muted"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Logo iconSize={28} textClassName="text-sm" />
        <span className="text-xs text-foreground/40">Admin</span>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Chiudi il menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
