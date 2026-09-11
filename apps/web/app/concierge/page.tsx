import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import ConciergeChat from "./concierge-chat";

export default async function ConciergePage() {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");
  if (!session.isBoliPass) redirect("/bolipass");

  return (
    <main className="bv-app-shell">
      <section className="bv-container-narrow bv-tab-spaced">
        <div className="bv-chat-header">
          <div className="bv-perk-icon">✦</div>
          <div>
            <p className="bv-section-kicker" style={{ marginBottom: 4 }}>Companion</p>
            <h1 className="bv-title-sm" style={{ marginBottom: 0 }}>BoliVibes Concierge</h1>
          </div>
          <a href="/bolipass" className="bv-soft">BoliPass ✓</a>
        </div>
        <ConciergeChat />
      </section>
    </main>
  );
}
