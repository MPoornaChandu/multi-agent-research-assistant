import type { ResearchState } from "@/lib/types";
import { validateTopic } from "@/lib/validation";
import { runResearchGraph } from "@/agents/graph";
import { getCachedResearch, setCachedResearch } from "@/lib/cache";
import {
  getSafeEnvStatus,
  hasGoogleApiKey,
  hasTavilyApiKey,
  LOCAL_API_KEY_NOT_DETECTED_MESSAGE,
  PRODUCTION_RESEARCH_UNAVAILABLE_MESSAGE
} from "@/lib/env";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();
const API_KEY_NOT_DETECTED_MESSAGE = LOCAL_API_KEY_NOT_DETECTED_MESSAGE;
const GEMINI_MODEL_NOT_AVAILABLE_MESSAGE =
  "Gemini model not available. The project is now configured to use gemini-2.5-flash-lite. Restart the dev server after updating .env.local.";
const ALL_RESEARCHERS_FAILED_MESSAGE =
  "All researcher agents failed. Check API keys and try again.";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

function isMissingApiKeyMessage(message: string): boolean {
  return (
    message.includes("Missing GOOGLE_API_KEY") ||
    message.includes("Missing TAVILY_API_KEY") ||
    message.includes(LOCAL_API_KEY_NOT_DETECTED_MESSAGE)
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
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_RESEARCH_UNAVAILABLE_MESSAGE;
  }

  if (isMissingApiKeyError(error)) {
    return API_KEY_NOT_DETECTED_MESSAGE;
  }

  if (isGeminiModelNotAvailableError(error)) {
    return GEMINI_MODEL_NOT_AVAILABLE_MESSAGE;
  }

  return errorMessage(error);
}

function displayAgentError(message: string): string {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_RESEARCH_UNAVAILABLE_MESSAGE;
  }

  return isGeminiModelNotAvailableMessage(message)
    ? GEMINI_MODEL_NOT_AVAILABLE_MESSAGE
    : message;
}

function displayResearchError(message: string): string {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_RESEARCH_UNAVAILABLE_MESSAGE;
  }

  if (isMissingApiKeyMessage(message)) {
    return API_KEY_NOT_DETECTED_MESSAGE;
  }

  if (isGeminiModelNotAvailableMessage(message)) {
    return GEMINI_MODEL_NOT_AVAILABLE_MESSAGE;
  }

  return message;
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
      send(controller, "error", {
        message: displayResearchError(API_KEY_NOT_DETECTED_MESSAGE)
      });
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

    const state: ResearchState = await runResearchGraph({
      topic,
      emit: (type, payload = {}) => sendAndYield(controller, type, payload),
      formatAgentError: displayAgentError,
      logDuration
    });

    const missingApiKeyFinding = state.findings.find(
      (finding) => finding.error && isMissingApiKeyMessage(finding.error)
    );

    if (missingApiKeyFinding) {
      send(controller, "error", {
        message: displayResearchError(API_KEY_NOT_DETECTED_MESSAGE)
      });
      send(controller, "done", { ok: false });
      return;
    }

    const geminiModelFinding = state.findings.find(
      (finding) =>
        finding.error && isGeminiModelNotAvailableMessage(finding.error)
    );

    if (geminiModelFinding) {
      send(controller, "error", {
        message: displayResearchError(GEMINI_MODEL_NOT_AVAILABLE_MESSAGE)
      });
      send(controller, "done", { ok: false });
      return;
    }

    const hasSuccess = state.findings.some((finding) => !finding.error);
    if (!hasSuccess) {
      send(controller, "report_ready", { report: state.report });
      send(controller, "error", {
        message: displayResearchError(ALL_RESEARCHERS_FAILED_MESSAGE)
      });
      send(controller, "done", { ok: false });
      return;
    }

    const totalDuration = Date.now() - workflowStart;
    logDuration("Total", totalDuration);

    setCachedResearch(topic, {
      topic,
      subQuestions: state.subQuestions,
      findings: state.findings,
      sources: state.sources,
      report: state.report,
      durationMs: totalDuration
    });

    send(controller, "report_ready", { report: state.report });
    send(controller, "research_completed", {
      topic,
      durationMs: totalDuration
    });
    send(controller, "done", { ok: true });
  });
}
