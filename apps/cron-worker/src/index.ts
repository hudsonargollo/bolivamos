import { createDb } from "@bolivamos/db";
import { sendWeeklyDigest, sendWeekendRoundup } from "@bolivamos/notifications";

const TUESDAY_DIGEST_CRON = "0 13 * * 2";
const WEEKEND_ROUNDUP_CRON = "0 13 * * 5";

export default {
  async scheduled(controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext) {
    const db = createDb(env.DB);

    switch (controller.cron) {
      case TUESDAY_DIGEST_CRON:
        ctx.waitUntil(
          sendWeeklyDigest(db, env.RESEND_API_KEY).then((r) =>
            console.log(`[cron] weekly digest sent to ${r.sent} recipients`),
          ),
        );
        break;
      case WEEKEND_ROUNDUP_CRON:
        ctx.waitUntil(
          sendWeekendRoundup(db, env.RESEND_API_KEY).then((r) =>
            console.log(`[cron] weekend roundup sent to ${r.sent} recipients`),
          ),
        );
        break;
      default:
        console.warn(`[cron] no handler registered for schedule "${controller.cron}"`);
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;
