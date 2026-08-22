import type { Db } from "@bolivamos/db";
import { users } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { sendEmail } from "./resend-client";

/**
 * BoliPass Weekend Roundup (PRD 4.5) — targeted to active BoliPass
 * subscribers, highlighting high-value 2-for-1 deals for the upcoming
 * Friday-Sunday. Deal selection is out of scope for this scaffold.
 */
export async function sendWeekendRoundup(db: Db, resendApiKey: string): Promise<{ sent: number }> {
  const recipients = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.isBolipassActive, true));

  for (const recipient of recipients) {
    await sendEmail({
      apiKey: resendApiKey,
      to: [recipient.email],
      subject: "This weekend's best 2-for-1 BoliPass deals",
      html: "<p>Your weekend BoliPass picks are coming soon.</p>",
    });
  }

  return { sent: recipients.length };
}
