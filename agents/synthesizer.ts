import { getGeminiModel, messageContentToString } from "@/lib/gemini";
import { dedupeAndRenumberSources, formatSourceList } from "@/lib/sources";
import type { Finding, ResearchState } from "@/lib/types";

function noFindingsReport(state: ResearchState): string {
  const failureNotes = state.findings
    .filter((finding) => finding.error)
    .map(
      (finding) =>
        `- Researcher ${finding.researcherId}: ${finding.error ?? "Unknown error"}`
    )
    .join("\n");

  return `## Research Report: ${state.topic}

### Executive Summary
The research workflow could not produce a complete report because every researcher failed. Check the API keys, provider limits, and network access, then try again.

### Key Findings
No successful findings were available.

### Researcher Errors
${failureNotes || "- No detailed errors were returned."}

### Conclusion
The topic was valid, but the agent workflow needs at least one successful web search and summary before synthesis can proceed.

### Sources
No sources were collected.`;
}

function findingsContext(findings: Finding[]): string {
  return findings
    .map(
      (finding) => `Researcher ${finding.researcherId}
Sub-question: ${finding.subQuestion}
Summary: ${finding.summary}
Key points:
${finding.keyPoints.slice(0, 3).map((point) => `- ${point}`).join("\n")}
Sources:
${formatSourceList(finding.sources)}`
    )
    .join("\n\n---\n\n");
}

export async function runSynthesizer(state: ResearchState): Promise<string> {
  const successfulFindings = state.findings.filter((finding) => !finding.error);

  if (successfulFindings.length === 0) {
    return noFindingsReport(state);
  }

  const normalized =
    state.sources.length > 0
      ? { findings: state.findings, sources: state.sources }
      : dedupeAndRenumberSources(state.findings);
  const failedFindings = state.findings.filter((finding) => finding.error);
  const model = getGeminiModel();
  const response = await model.invoke(`Write a concise research dossier in markdown.
Use only the provided findings and sources.
Keep the full report under 900 words.
Use numbered citations like [1], [2].
Do not invent sources.
If a researcher failed, mention the gap briefly.
Do not wrap the answer in code fences.

Format:
## Research Report: ${state.topic}

### Executive Summary
2-3 sentences.

### Key Findings

#### Finding 1: short title
1 short paragraph with citations.
- Bullet insight with citation.
- Bullet insight with citation.

#### Finding 2: short title
1 short paragraph with citations.
- Bullet insight with citation.
- Bullet insight with citation.

#### Finding 3: short title
1 short paragraph with citations.
- Bullet insight with citation.
- Bullet insight with citation.

### Conclusion
1 paragraph with practical implications.

### Sources
[1] Title - URL

Topic: ${state.topic}

Sub-questions:
${state.subQuestions.map((question) => `- ${question}`).join("\n")}

Successful findings:
${findingsContext(normalized.findings.filter((finding) => !finding.error))}

Failed findings:
${
  failedFindings.length > 0
    ? failedFindings
        .map(
          (finding) =>
            `Researcher ${finding.researcherId}: ${finding.subQuestion} - ${finding.error}`
        )
        .join("\n")
    : "None"
}

Canonical source list:
${formatSourceList(normalized.sources)}`);

  return messageContentToString(response.content).trim();
}
