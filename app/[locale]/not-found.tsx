import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--surface)] p-8 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">The page does not exist or may have been moved.</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="."
          className="inline-flex rounded-full bg-[color:var(--button-primary-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-primary-fg)]"
        >
          Go home
        </Link>
        <Link
          href="shop"
          className="inline-flex rounded-full border border-[color:var(--control-border)] px-5 py-2 text-sm font-semibold text-[color:var(--foreground)]"
        >
          Open shop
        </Link>
      </div>
    </section>
  );
}
