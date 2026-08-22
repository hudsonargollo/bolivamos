export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <img src="/logo-full.svg" alt="BoliVamos" className="h-16" />
      <h1 className="text-3xl">BoliVamos</h1>
      <p className="text-muted-clay-gray">
        Get the app to discover Santa Cruz and unlock BoliPass 2-for-1 deals.
      </p>
      <a href="/host" className="rounded-pill bg-boli-green px-6 py-3 text-white shadow-md">
        Host Portal login
      </a>
    </main>
  );
}
