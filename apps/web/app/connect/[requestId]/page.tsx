import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createDb, connectRequests, users } from "@bolivamos/db";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import { cf } from "@/lib/cloudflare";
import MessageThread from "./message-thread";

export default async function ConnectThreadPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");

  const { env } = cf();
  const db = createDb(env.DB);

  const [connectRequest] = await db.select().from(connectRequests).where(eq(connectRequests.id, requestId)).limit(1);
  if (!connectRequest || (connectRequest.fromUserId !== session.userId && connectRequest.toUserId !== session.userId)) {
    notFound();
  }
  if (connectRequest.status !== "accepted") {
    redirect("/connect");
  }

  const otherUserId = connectRequest.fromUserId === session.userId ? connectRequest.toUserId : connectRequest.fromUserId;
  const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
      <MessageThread
        requestId={requestId}
        currentUserId={session.userId}
        otherUserId={otherUserId}
        otherName={otherUser?.fullName ?? "A fellow VIP member"}
      />
    </main>
  );
}
