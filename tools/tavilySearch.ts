import { tavily } from "@tavily/core";
import type { Source } from "@/lib/types";
import { getTavilyApiKey, getTavilyMaxResults } from "@/lib/env";
import { normalizeSourceSnippet } from "@/lib/sources";

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

export async function tavilySearch(query: string): Promise<Source[]> {
  const tavilyApiKey = getTavilyApiKey();
  const maxResults = getTavilyMaxResults();

  try {
    const client = tavily({ apiKey: tavilyApiKey });
    const response = await withTimeout(
      client.search(query, {
        searchDepth: "basic",
        maxResults,
        includeRawContent: false,
        includeAnswer: false,
        timeout: 10
      }),
      10000,
      "Tavily search timed out"
    );

    return response.results.slice(0, maxResults).map((result, index) => {
      const normalizedSnippet = normalizeSourceSnippet(
        result.content || "No snippet available."
      );

      return {
        id: index + 1,
        title: result.title || "Untitled source",
        url: result.url,
        ...normalizedSnippet,
        score: typeof result.score === "number" ? result.score : undefined
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Tavily error";
    throw new Error(`Tavily search failed: ${message}`);
  }
}
