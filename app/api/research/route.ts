import { dedupeAndRenumberSources } from "@/lib/sources";
import type { Finding, ResearchState } from "@/lib/types";
import { validateTopic } from "@/lib/validation";
import { runResearcher } from "@/agents/researcher";
import { runSupervisor } from "@/agents/supervisor";
import { runSynthesizer } from "@/agents/synthesizer";
import { getCachedResearch, setCachedResearch } from "@/lib/cache";
import {
  getSafeEnvStatus,
  hasGoogleApiKey,
  hasTavilyApiKey
} from "@/lib/env";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();
const API_KEY_NOT_DETECTED_MESSAGE =
  "API key not detected. Make sure .env.local is in the same folder as package.json, variable names are correct, and restart npm run dev.";
const GEMINI_MODEL_NOT_AVAILABLE_MESSAGE =
  "Gemini model not available. The project is now configured to use gemini-2.5-flash-lite. Restart the dev server after updating .env.local.";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

function isMissingApiKeyMessage(message: string): boolean {
  return (
    message.includes("Missing GOOGLE_API_KEY") ||
    message.includes("Missing TAVILY_API_KEY")
  );
}

function isMissingApiKeyError(error: unknown): boolean {
  return error instanceof Error && isMissingApiKeyMessage(error.message);
}

function isGeminiModelNotAvailableMessage(message: string): boolean {
  return (
    (message.includes("models/") &&
      message.includes("is not found") &&
      message.includes("generateContent")) ||
    (message.includes("GoogleGenerativeAI Error") &&
      message.includes("404 Not Found"))
  );
}

function isGeminiModelNotAvailableError(error: unknown): boolean {
  return (
    error instanceof Error && isGeminiModelNotAvailableMessage(error.message)
  );
}

function streamErrorMessage(error: unknown): string {
  if (isMissingApiKeyError(error)) {
    return API_KEY_NOT_DETECTED_MESSAGE;
  }

  if (isGeminiModelNotAvailableError(error)) {
    return GEMINI_MODEL_NOT_AVAILABLE_MESSAGE;
  }

  return errorMessage(error);
}

function displayAgentError(message: string): string {
  return isGeminiModelNotAvailableMessage(message)
    ? GEMINI_MODEL_NOT_AVAILABLE_MESSAGE
    : message;
}

function send(
  controller: ReadableStreamDefaultController<Uint8Array>,
  type: string,
  payload: Record<string, unknown> = {}
) {
  controller.enqueue(
    encoder.encode(`data: ${JSON.stringify({ type, payload })}\n\n`)
  );
}

function yieldToStream() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function sendAndYield(
  controller: ReadableStreamDefaultController<Uint8Array>,
  type: string,
  payload: Record<string, unknown> = {}
) {
  send(controller, type, payload);
  await yieldToStream();
}

function logDuration(label: string, durationMs: number) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`${label} duration: ${durationMs} ms`);
  }
}

function createStreamResponse(
  executor: (
    controller: ReadableStreamDefaultController<Uint8Array>
  ) => Promise<void>
) {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await executor(controller);
      } catch (error) {
        send(controller, "error", {
          message: streamErrorMessage(error)
        });
        send(controller, "done", { ok: false });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

async function readTopic(request: Request): Promise<unknown> {
  try {
    const body = (await request.json()) as unknown;
    if (body && typeof body === "object" && "topic" in body) {
      return (body as { topic?: unknown }).topic;
    }
  } catch {
    return "";
  }

  return "";
}

export async function POST(request: Request) {
  const topicInput = await readTopic(request);
  const validation = validateTopic(topicInput);
  const envStatus = getSafeEnvStatus();

  if (process.env.NODE_ENV !== "production") {
    console.log("Env check:", envStatus);
  }

  return createStreamResponse(async (controller) => {
    if (!validation.ok || !validation.topic) {
      send(controller, "error", {
        message: validation.error ?? "Invalid research topic."
      });
      send(controller, "done", { ok: false });
      return;
    }

    if (!hasGoogleApiKey() || !hasTavilyApiKey()) {
      send(controller, "error", { message: API_KEY_NOT_DETECTED_MESSAGE });
      send(controller, "done", { ok: false });
      return;
    }

    const topic = validation.topic;
    const workflowStart = Date.now();
    const cached = getCachedResearch(topic);

    if (cached) {
      await sendAndYield(controller, "research_started", {
        topic,
        message: "Research workflow started."
      });
      await sendAndYield(controller, "cache_hit", {
        message: "Loaded a recent research dossier from cache.",
        durationMs: cached.durationMs
      });
      await sendAndYield(controller, "subquestions_ready", {
        subQuestions: cached.subQuestions
      });
      await sendAndYield(controller, "sources_ready", {
        sources: cached.sources
      });
      send(controller, "report_ready", { report: cached.report });
      send(controller, "research_completed", {
        topic: cached.topic,
        durationMs: Date.now() - workflowStart,
        cached: true
      });
      send(controller, "done", { ok: true, cached: true });
      logDuration("Cache hit", Date.now() - workflowStart);
      return;
    }

    await sendAndYield(controller, "research_started", {
      topic,
      message: "Research workflow started."
    });

    const supervisorStart = Date.now();
    await sendAndYield(controller, "agent_started", {
      agent: "Supervisor Agent",
      message: "Breaking the topic into 3 focused sub-questions."
    });

    const subQuestions = await runSupervisor(topic);
    const supervisorDuration = Date.now() - supervisorStart;
    logDuration("Supervisor", supervisorDuration);
    await sendAndYield(controller, "agent_completed", {
      agent: "Supervisor Agent",
      message: "Generated 3 focused sub-questions.",
      durationMs: supervisorDuration
    });
    await sendAndYield(controller, "subquestions_ready", { subQuestions });

    subQuestions.forEach((subQuestion, index) => {
      send(controller, "agent_started", {
        agent: `Researcher Agent ${index + 1}`,
        message: subQuestion
      });
    });
    await yieldToStream();

    const findings = await Promise.all(
      subQuestions.map(async (subQuestion, index): Promise<Finding> => {
        const startedAt = Date.now();
        const finding = await runResearcher(index + 1, subQuestion);
        const researcherDuration = Date.now() - startedAt;
        logDuration(`Researcher ${index + 1}`, researcherDuration);

        if (finding.error) {
          await sendAndYield(controller, "agent_failed", {
            agent: `Researcher Agent ${index + 1}`,
            message: displayAgentError(finding.error),
            durationMs: researcherDuration
          });
        } else {
          await sendAndYield(controller, "agent_completed", {
            agent: `Researcher Agent ${index + 1}`,
            message: `Found ${finding.sources.length} sources.`,
            durationMs: researcherDuration
          });
        }

        return finding;
      })
    );

    const normalized = dedupeAndRenumberSources(findings);
    await sendAndYield(controller, "sources_ready", { sources: normalized.sources });

    const missingApiKeyFinding = normalized.findings.find(
      (finding) => finding.error && isMissingApiKeyMessage(finding.error)
    );

    if (missingApiKeyFinding) {
      send(controller, "error", { message: API_KEY_NOT_DETECTED_MESSAGE });
      send(controller, "done", { ok: false });
      return;
    }

    const geminiModelFinding = normalized.findings.find(
      (finding) =>
        finding.error && isGeminiModelNotAvailableMessage(finding.error)
    );

    if (geminiModelFinding) {
      send(controller, "error", { message: GEMINI_MODEL_NOT_AVAILABLE_MESSAGE });
      send(controller, "done", { ok: false });
      return;
    }

    const state: ResearchState = {
      topic,
      subQuestions,
      findings: normalized.findings,
      report: "",
      sources: normalized.sources,
      status: "research_completed",
      error: null,
      researchCompleted: true
    };

    const hasSuccess = normalized.findings.some((finding) => !finding.error);
    if (!hasSuccess) {
      const report = await runSynthesizer({
        ...state,
        status: "failed",
        error: "All researcher agents failed."
      });

      send(controller, "agent_failed", {
        agent: "Synthesis Agent",
        message: "Synthesis skipped because all researchers failed."
      });
      send(controller, "report_ready", { report });
      send(controller, "error", {
        message: "All researcher agents failed. Check API keys and try again."
      });
      send(controller, "done", { ok: false });
      return;
    }

    await sendAndYield(controller, "synthesis_started", {
      message: "Combining successful findings into a cited report."
    });
    const synthesisStart = Date.now();
    await sendAndYield(controller, "agent_started", {
      agent: "Synthesis Agent",
      message: "Writing the structured markdown report."
    });

    const report = await runSynthesizer({
      ...state,
      status: "synthesis_running"
    });
    const synthesisDuration = Date.now() - synthesisStart;
    const totalDuration = Date.now() - workflowStart;
    logDuration("Synthesis", synthesisDuration);
    logDuration("Total", totalDuration);

    setCachedResearch(topic, {
      topic,
      subQuestions,
      findings: normalized.findings,
      sources: normalized.sources,
      report,
      durationMs: totalDuration
    });

    send(controller, "report_ready", { report });
    send(controller, "agent_completed", {
      agent: "Synthesis Agent",
      message: "Completed the cited research report.",
      durationMs: synthesisDuration
    });
    send(controller, "research_completed", {
      topic,
      durationMs: totalDuration
    });
    send(controller, "done", { ok: true });
  });
}
