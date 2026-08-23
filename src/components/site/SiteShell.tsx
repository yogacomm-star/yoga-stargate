import type { ReactNode } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import CookieBanner from "@/components/site/CookieBanner";
import ChatWidget from "@/components/site/ChatWidget";
import AdminTour from "@/components/admin/AdminTour";
import { getCurrentAccount } from "@/lib/auth";

export default async function SiteShell({ children }: { children: ReactNode }) {
  const account = await getCurrentAccount();
  const navAccount = account
    ? { id: account.id, name: account.name, role: account.role, level: account.level }
    : null;

  return (
    <>
      <Navbar account={navAccount} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
      <ChatWidget variant="public" />
      {account?.role === "ADMIN" && <AdminTour />}
    </>
  );
}
