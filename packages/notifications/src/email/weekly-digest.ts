import type { Db } from "@bolivamos/db";
import { users } from "@bolivamos/db";
import { sendEmail } from "./resend-client";

/**
 * "The Tuesday Email" (PRD 4.5) — weekly digest of "What to do in Santa Cruz
 * this week", sent to all registered visitors. Recipient query + template are
 * placeholders; real content curation is out of scope for this scaffold.
 */
export async function sendWeeklyDigest(db: Db, resendApiKey: string): Promise<{ sent: number }> {
  const recipients = await db.select({ email: users.email }).from(users);

  // Sent one-by-one (not all addresses in a single `to`) so recipients never see each other's emails.
  for (const recipient of recipients) {
    await sendEmail({
      apiKey: resendApiKey,
      to: [recipient.email],
      subject: "What to do in Santa Cruz this week",
      html: "<p>This week's picks are coming soon.</p>",
    });
  }

  return { sent: recipients.length };
}
