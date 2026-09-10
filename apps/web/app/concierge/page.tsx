import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import "../admin/admin.css";
import ConciergeChat from "./concierge-chat";

export default async function ConciergePage() {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");
  if (!session.isBoliPass) redirect("/");

  return (
    <div className="admin-root" style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 className="a-h1">BoliVibes Concierge</h1>
        <ConciergeChat />
      </div>
    </div>
  );
}
