import { describe, expect, it } from "vitest";
import { dedupeAndRenumberSources } from "@/lib/sources";
import type { Finding, Source } from "@/lib/types";

function source(id: number, title: string, url: string, snippet: string): Source {
  return { id, title, url, snippet, fullSnippet: snippet };
}

function finding(researcherId: number, sources: Source[]): Finding {
  return {
    researcherId,
    subQuestion: `Question ${researcherId}?`,
    summary: `Summary ${researcherId}`,
    keyPoints: [`Point ${researcherId}`],
    sources,
    error: null
  };
}

describe("dedupeAndRenumberSources", () => {
  it("removes duplicate URLs and renumbers citations from 1", () => {
    const duplicateUrl = "https://example.com/report";
    const result = dedupeAndRenumberSources([
      finding(1, [
        source(8, "Original report", duplicateUrl, "Original snippet"),
        source(9, "Market note", "https://example.com/market", "Market snippet")
      ]),
      finding(2, [
        source(3, "Original report duplicate", ` ${duplicateUrl.toUpperCase()} `, "Duplicate snippet")
      ])
    ]);

    expect(result.sources).toEqual([
      source(1, "Original report", duplicateUrl, "Original snippet"),
      source(2, "Market note", "https://example.com/market", "Market snippet")
    ]);
    expect(result.findings[0].sources.map((item) => item.id)).toEqual([1, 2]);
    expect(result.findings[1].sources.map((item) => item.id)).toEqual([1]);
  });

  it("keeps title, url, and snippet from the first canonical source", () => {
    const result = dedupeAndRenumberSources([
      finding(1, [
        source(12, "Primary source", "https://example.com/a", "Helpful snippet")
      ])
    ]);

    expect(result.sources[0]).toMatchObject({
      id: 1,
      title: "Primary source",
      url: "https://example.com/a",
      snippet: "Helpful snippet"
    });
  });

  it("handles an empty source list", () => {
    const result = dedupeAndRenumberSources([finding(1, [])]);

    expect(result.sources).toEqual([]);
    expect(result.findings[0].sources).toEqual([]);
  });

  it("handles malformed and blank URLs gracefully", () => {
    const result = dedupeAndRenumberSources([
      finding(1, [
        source(4, "Blank URL source", "   ", "Blank URL snippet"),
        source(5, "Malformed URL source", "not a url", "Malformed URL snippet"),
        source(6, "Blank URL source", "", "Duplicate by title")
      ])
    ]);

    expect(result.sources).toEqual([
      source(1, "Blank URL source", "   ", "Blank URL snippet"),
      source(2, "Malformed URL source", "not a url", "Malformed URL snippet")
    ]);
    expect(result.findings[0].sources.map((item) => item.id)).toEqual([1, 2, 1]);
  });
});
