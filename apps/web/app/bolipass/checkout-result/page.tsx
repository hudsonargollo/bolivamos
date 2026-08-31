/**
 * Landing page for Stripe's success_url/cancel_url after a BoliPass
 * checkout (apps/web/app/api/subscriptions/bolipass/checkout/route.ts).
 * The mobile app opens checkout in an in-app browser
 * (expo-web-browser) rather than deep-linking back in, so this just needs
 * to tell the user they can close the tab — actual activation happens via
 * the Stripe webhook, not this page.
 */
export default async function BolipassCheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const success = status === "success";

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "64px 24px", textAlign: "center", fontFamily: "Figtree, sans-serif" }}>
      <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 28, color: "#201e1d", margin: "0 0 12px" }}>
        {success ? "Payment received" : "Checkout cancelled"}
      </h1>
      <p style={{ color: "#7a6a52" }}>
        {success
          ? "Thanks — your BoliPass subscription is being activated. You can close this window and go back to the app."
          : "No charge was made. You can close this window and go back to the app."}
      </p>
    </main>
  );
}
