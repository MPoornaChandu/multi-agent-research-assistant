import Link from "next/link";
import { ArrowLeft, FileSearch, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="paper-grid flex min-h-screen items-center justify-center px-5 py-12 text-studio-ink">
      <section className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_360px] md:items-center">
        <div>
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-studio-graphite transition hover:text-studio-coral"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back home
          </Link>

          <span className="mb-4 inline-flex items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/80 px-3 py-2 text-sm font-bold text-studio-graphite shadow-soft">
            <SearchX className="h-4 w-4 text-studio-coral" aria-hidden="true" />
            Research path missing
          </span>

          <h1 className="font-serif text-5xl font-semibold leading-tight text-studio-ink md:text-7xl">
            Page not found
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-studio-graphite/75">
            This route is not in the research workspace. Return home or open the
            live research studio to start a new dossier.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="studio-button inline-flex h-11 items-center justify-center gap-2 bg-studio-ink px-4 text-sm font-semibold text-studio-cream"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
            </Link>
            <Link
              href="/research"
              className="studio-button inline-flex h-11 items-center justify-center gap-2 bg-studio-cream px-4 text-sm font-semibold text-studio-graphite"
            >
              <FileSearch className="h-4 w-4" aria-hidden="true" />
              Research workspace
            </Link>
          </div>
        </div>

        <div className="clay-card p-5">
          <div className="rounded-lg border border-studio-ink/10 bg-studio-clay/60 p-5">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-studio-amber/75">
              <SearchX className="h-6 w-6 text-studio-ink" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/65">
              404
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold leading-tight text-studio-ink">
              No source found for this page.
            </p>
            <p className="mt-3 text-sm leading-6 text-studio-graphite/70">
              The app is still ready to research topics, stream timeline events,
              and build cited reports.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
