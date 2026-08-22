export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl">Host Portal</h1>
      <a
        href="/api/auth/google"
        className="rounded-pill bg-boli-green px-6 py-3 text-white shadow-md"
      >
        Continue with Google
      </a>
    </main>
  );
}
