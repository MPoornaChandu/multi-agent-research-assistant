"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { Source } from "@/lib/types";

type SourceCardProps = {
  source: Source;
};

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown host";
  }
}

function formatScore(score?: number) {
  if (typeof score !== "number") {
    return "Not reported";
  }

  return score <= 1 ? `${Math.round(score * 100)}%` : score.toFixed(2);
}

export function SourceCard({ source }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fullSnippet = source.fullSnippet ?? source.snippet;
  const metadataEntries = Object.entries(source.metadata ?? {}).filter(
    ([, value]) => value !== null && value !== undefined && `${value}`.trim() !== ""
  );

  return (
    <article
      id={`source-${source.id}`}
      className="clay-card scroll-mt-24 overflow-hidden p-4 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-studio-amber text-sm font-bold text-studio-ink">
          {source.id}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-6 text-studio-ink">
            {source.title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-studio-graphite/55 [overflow-wrap:anywhere]">
            {source.url}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-studio-graphite/75">
        {source.snippet}
      </p>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={`source-${source.id}-details`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-studio-ink/10 bg-studio-clay/60 p-3 text-sm leading-6 text-studio-graphite">
              <dl className="grid gap-3">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/55">
                    Full snippet
                  </dt>
                  <dd className="mt-1 text-studio-graphite/80">{fullSnippet}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/55">
                    URL
                  </dt>
                  <dd className="mt-1 [overflow-wrap:anywhere]">{source.url}</dd>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/55">
                      Host
                    </dt>
                    <dd className="mt-1 font-semibold text-studio-ink">
                      {getHostname(source.url)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/55">
                      Relevance
                    </dt>
                    <dd className="mt-1 font-semibold text-studio-ink">
                      {formatScore(source.score)}
                    </dd>
                  </div>
                </div>
                {metadataEntries.length > 0 ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/55">
                      Metadata
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {metadataEntries.map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded-lg border border-studio-ink/10 bg-studio-cream/70 px-2.5 py-1 text-xs font-bold text-studio-graphite"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="studio-button inline-flex w-full min-w-0 items-center justify-center gap-2 bg-studio-ink px-3 py-2 text-sm font-semibold text-studio-cream sm:w-auto"
          aria-label={`Open source ${source.id}: ${source.title}`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open source
        </a>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls={`source-${source.id}-details`}
          aria-label={`${isOpen ? "Hide" : "Show"} details for source ${source.id}`}
          className="studio-button inline-flex w-full items-center justify-center gap-2 bg-studio-cream px-3 py-2 text-sm font-semibold text-studio-graphite sm:w-auto"
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
          Details
        </button>
      </div>
    </article>
  );
}
