import { redirect } from "next/navigation";
import { createDb, users, eq } from "@bolivibes/db";
import type { AuthUser } from "@bolivibes/api-schema";
import { cf } from "@/lib/cloudflare";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");

  const { env } = cf();
  const db = createDb(env.DB);
  const [row] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!row) redirect("/login");

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: (row.role ?? "visitor") as AuthUser["role"],
    isBoliPassActive: Boolean(row.isBolipassActive),
  };

  return <ProfileClient user={user} />;
}
