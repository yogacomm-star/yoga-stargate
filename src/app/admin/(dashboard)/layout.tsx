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
    <div className="flex flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <AdminSidebar adminName={admin.name} />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:h-screen lg:overflow-y-auto lg:p-8">{children}</main>
      <AdminTour />
      <ChatWidget variant="admin" />
    </div>
  );
}
