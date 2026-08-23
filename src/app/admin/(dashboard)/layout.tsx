import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTour from "@/components/admin/AdminTour";
import ChatWidget from "@/components/site/ChatWidget";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex">
      <AdminSidebar adminName={admin.name} />
      <main className="min-h-screen flex-1 overflow-x-hidden p-6 sm:p-8">{children}</main>
      <AdminTour />
      <ChatWidget variant="admin" />
    </div>
  );
}
