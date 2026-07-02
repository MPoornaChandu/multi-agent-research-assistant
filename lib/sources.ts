import type { Finding, Source } from "@/lib/types";

const SNIPPET_MAX_LENGTH = 200;

function sourceKey(source: Source): string {
  return source.url.trim().toLowerCase() || source.title.trim().toLowerCase();
}

export function truncateAtWordBoundary(text: string, maxLength = SNIPPET_MAX_LENGTH) {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const slice = normalized.slice(0, maxLength + 1);
  const lastSpace = slice.search(/\s+\S*$/);
  const boundary =
    lastSpace > Math.floor(maxLength * 0.6)
      ? lastSpace
      : Math.min(maxLength, normalized.length);
  const trimmed = normalized.slice(0, boundary).trim().replace(/[,.!?;:]+$/, "");

  return `${trimmed}...`;
}

export function normalizeSourceSnippet(snippet: string) {
  const fullSnippet = snippet.trim().replace(/\s+/g, " ") || "No snippet available.";

  return {
    fullSnippet,
    snippet: truncateAtWordBoundary(fullSnippet)
  };
}

export function dedupeAndRenumberSources(findings: Finding[]): {
  findings: Finding[];
  sources: Source[];
} {
  const sourceMap = new Map<string, Source>();

  const normalizedFindings = findings.map((finding) => {
    const sources = finding.sources.map((source) => {
      const key = sourceKey(source);
      const existing = sourceMap.get(key);

      if (existing) {
        return existing;
      }

      const normalizedSnippet = normalizeSourceSnippet(
        source.fullSnippet ?? source.snippet
      );
      const nextSource: Source = {
        ...source,
        ...normalizedSnippet,
        id: sourceMap.size + 1
      };
      sourceMap.set(key, nextSource);
      return nextSource;
    });

    return {
      ...finding,
      sources
    };
  });

  return {
    findings: normalizedFindings,
    sources: Array.from(sourceMap.values())
  };
}

export function formatSourceList(sources: Source[]): string {
  if (sources.length === 0) {
    return "No sources available.";
  }

  return sources
    .map(
      (source) =>
        `[${source.id}] ${source.title}\nURL: ${source.url}\nSnippet: ${source.snippet}`
    )
    .join("\n\n");
}
