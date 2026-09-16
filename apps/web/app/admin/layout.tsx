import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import AdminHeaderSession from "./admin-header-session";
import AdminSidebar from "./admin-sidebar";
import "./admin.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <div className="admin-root">
      <AdminSidebar />
      <div className="a-content-wrapper">
        <header className="a-header">
          <div className="a-header-inner">
            <div className="a-header-spacer" />
            <AdminHeaderSession email={session.email} fullName={session.fullName} />
          </div>
        </header>
        <main className="a-main">{children}</main>
      </div>
    </div>
  );
}
