import { or, and, eq } from "drizzle-orm";
import { userBlocks, type Db } from "@bolivamos/db";

/** True if either user has blocked the other — used to hide attendees, refuse
 * connect requests, and lock out messaging between blocked pairs. */
export async function isBlockedEitherWay(db: Db, userA: string, userB: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(userBlocks)
    .where(
      or(
        and(eq(userBlocks.blockerId, userA), eq(userBlocks.blockedId, userB)),
        and(eq(userBlocks.blockerId, userB), eq(userBlocks.blockedId, userA)),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
