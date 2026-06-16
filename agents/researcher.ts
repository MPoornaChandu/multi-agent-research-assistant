import { getGeminiModel, messageContentToString } from "@/lib/gemini";
import { isFastMode } from "@/lib/env";
import type { Finding, Source } from "@/lib/types";
import { tavilySearch } from "@/tools/tavilySearch";

type ResearcherModelOutput = {
  summary?: unknown;
  keyPoints?: unknown;
};

function readableError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown researcher error";
}

function stripJsonFences(input: string): string {
  return input
    .replace(/```(?:json|JSON)?/g, "")
    .replace(/```/g, "")
    .trim();
}

function parseResearcherOutput(raw: string, sources: Source[]): {
  summary: string;
  keyPoints: string[];
} {
  const stripped = stripJsonFences(raw);
  const objectMatch = stripped.match(/\{[\s\S]*\}/);
  const candidates = [stripped, objectMatch?.[0]].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as ResearcherModelOutput;
      const summary =
        typeof parsed.summary === "string" ? parsed.summary.trim() : "";
      const keyPoints = Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints
            .filter((point): point is string => typeof point === "string")
            .map((point) => point.trim())
            .filter(Boolean)
        : [];

      if (summary || keyPoints.length > 0) {
        return { summary, keyPoints };
      }
    } catch {
      // Continue to the next parsing strategy.
    }
  }

  const fallbackPoints = sources.map(
    (source) => `${source.title}: ${source.snippet}`
  );

  return {
    summary: stripped || fallbackPoints.join(" "),
    keyPoints: fallbackPoints.slice(0, 4)
  };
}

function sourceContext(sources: Source[]): string {
  return sources
    .map(
      (source) =>
        `[${source.id}] ${source.title}\nURL: ${source.url}\nSnippet: ${source.snippet}`
    )
    .join("\n\n");
}

export async function runResearcher(
  researcherId: number,
  subQuestion: string
): Promise<Finding> {
  try {
    const sources = await tavilySearch(subQuestion);

    if (isFastMode()) {
      const keyPoints = sources
        .map((source) => source.snippet)
        .filter(Boolean)
        .slice(0, 3);

      return {
        researcherId,
        subQuestion,
        summary:
          sources
            .map((source) => `${source.title}: ${source.snippet}`)
            .join("\n") || "No Tavily sources were returned for this query.",
        keyPoints,
        sources,
        error: null
      };
    }

    const model = getGeminiModel();
    const response = await model.invoke(`You are Researcher Agent ${researcherId}.
Answer the research sub-question using only the Tavily search results below.
Write a concise, evidence-focused summary and cite sources with bracketed numbers like [1].
Return JSON only:
{
  "summary": "2-4 sentences with citations",
  "keyPoints": ["point 1", "point 2", "point 3"]
}

Sub-question: ${subQuestion}

Search results:
${sourceContext(sources)}`);

    const parsed = parseResearcherOutput(
      messageContentToString(response.content),
      sources
    );

    return {
      researcherId,
      subQuestion,
      summary: parsed.summary,
      keyPoints: parsed.keyPoints,
      sources,
      error: null
    };
  } catch (error) {
    return {
      researcherId,
      subQuestion,
      summary: "",
      keyPoints: [],
      sources: [],
      error: readableError(error)
    };
  }
}
