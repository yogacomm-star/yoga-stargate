"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, GraduationCap, Newspaper, Users, Mail, Settings, ExternalLink } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/ritiri", label: "Ritiri", icon: Compass },
  { href: "/admin/corsi", label: "Corsi", icon: GraduationCap },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/utenti", label: "Utenti", icon: Users },
  { href: "/admin/email", label: "Email", icon: Mail },
  { href: "/admin/impostazioni", label: "Impostazioni", icon: Settings },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <Link href="/admin" className="flex items-center">
          <Image src="/images/logo.png" alt="Yoga Stargate" width={500} height={500} className="h-12 w-12 object-contain" />
        </Link>
        <p className="mt-1 text-xs text-foreground/50">Pannello Admin</p>
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
    </aside>
  );
}
