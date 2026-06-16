import type { Finding, Source } from "@/lib/types";

const CACHE_TTL_MS = 10 * 60 * 1000;

type CachedResearchResult = {
  createdAt: number;
  topic: string;
  subQuestions: string[];
  findings: Finding[];
  sources: Source[];
  report: string;
  durationMs: number;
};

const researchCache = new Map<string, CachedResearchResult>();

export function normalizeResearchTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getCachedResearch(topic: string): CachedResearchResult | null {
  const key = normalizeResearchTopic(topic);
  const cached = researchCache.get(key);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    researchCache.delete(key);
    return null;
  }

  return cached;
}

export function setCachedResearch(
  topic: string,
  result: Omit<CachedResearchResult, "createdAt">
) {
  researchCache.set(normalizeResearchTopic(topic), {
    ...result,
    createdAt: Date.now()
  });
}
