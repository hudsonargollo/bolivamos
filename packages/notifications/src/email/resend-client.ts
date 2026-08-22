export interface SendEmailOptions {
  apiKey: string;
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "BoliVamos <hello@bolivamos.app>";

/** Thin wrapper around the Resend send API. `apiKey` is always caller-injected from `env.RESEND_API_KEY`. */
export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${opts.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from ?? DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
}
