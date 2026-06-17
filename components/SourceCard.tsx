"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { Source } from "@/lib/types";

type SourceCardProps = {
  source: Source;
};

export function SourceCard({ source }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="clay-card overflow-hidden p-4 transition-transform duration-150 hover:-translate-y-0.5">
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

      {isOpen ? (
        <div className="mt-3 rounded-lg border border-studio-ink/10 bg-studio-clay/60 p-3 text-sm leading-6 text-studio-graphite">
          {source.snippet}
        </div>
      ) : null}

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
