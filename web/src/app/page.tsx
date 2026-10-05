import Image from "next/image";

// Foundation checkpoint only: no operational data is exposed before authentication.
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-8 sm:p-12">
        <Image src="/brand/moby-logo-on-light.svg" alt="MOBY" width={180} height={40} priority />
        <h1 className="mt-8 text-4xl font-bold tracking-tight">MOBY Ops</h1>
        <p className="mt-4 text-lg text-muted">El panel de operaciones estará disponible próximamente.</p>
      </div>
    </main>
  );
}
