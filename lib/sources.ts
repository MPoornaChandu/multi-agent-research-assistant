import type { Finding, Source } from "@/lib/types";

function sourceKey(source: Source): string {
  return source.url.trim().toLowerCase() || source.title.trim().toLowerCase();
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

      const nextSource: Source = {
        ...source,
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
