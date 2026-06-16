"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileSearch,
  GitBranch,
  Home,
  PanelRight,
  RadioTower,
  RotateCcw
} from "lucide-react";
import { AgentTimeline } from "@/components/AgentTimeline";
import { ReportViewer } from "@/components/ReportViewer";
import { SourceCard } from "@/components/SourceCard";
import { StatusPill } from "@/components/StatusPill";
import { TopicInput } from "@/components/TopicInput";
import type { Source, TimelineEvent } from "@/lib/types";
import { validateTopic } from "@/lib/validation";

type IncomingStreamEvent = {
  type?: string;
  payload?: Record<string, unknown>;
};

type RunStatus = "idle" | "running" | "completed" | "failed";

type EnvStatus = {
  googleApiKeyConfigured: boolean;
  tavilyApiKeyConfigured: boolean;
  geminiModelConfigured: boolean;
  fastMode: boolean;
  tavilyMaxResultsConfigured: boolean;
  nextPublicAppUrlConfigured: boolean;
  development: boolean;
};

const LOCAL_API_KEY_HELP_MESSAGE = `Your API key is not being detected by the local Next.js server.

Check:
1. .env.local is in the same folder as package.json
2. Variable names are GOOGLE_API_KEY and TAVILY_API_KEY
3. No spaces around =
4. Restart the dev server after editing .env.local

Run:
Ctrl + C
npm run dev`;
const GEMINI_MODEL_HELP_MESSAGE =
  "Gemini model not available. The project is now configured to use gemini-2.5-flash-lite. Restart the dev server after updating .env.local.";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getString(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === "string" ? value : "";
}

function getNumber(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === "number" ? value : undefined;
}

function getBoolean(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === "boolean" ? value : undefined;
}

function isSource(value: unknown): value is Source {
  if (!value || typeof value !== "object") {
    return false;
  }

  const source = value as Source;
  return (
    typeof source.id === "number" &&
    typeof source.title === "string" &&
    typeof source.url === "string" &&
    typeof source.snippet === "string"
  );
}

function parseStreamPart(part: string): IncomingStreamEvent | null {
  const line = part
    .split("\n")
    .find((item) => item.startsWith("data:"));

  if (!line) return null;

  const json = line.replace(/^data:\s*/, "");

  try {
    return JSON.parse(json) as IncomingStreamEvent;
  } catch {
    console.warn("Skipping malformed SSE event");
    return null;
  }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function isApiKeyError(message: string) {
  return (
    message.includes("API key not detected") ||
    message.includes("Missing GOOGLE_API_KEY") ||
    message.includes("Missing TAVILY_API_KEY")
  );
}

function isGeminiModelError(message: string) {
  return (
    message.includes("Gemini model not available") ||
    (message.includes("models/") &&
      message.includes("is not found") &&
      message.includes("generateContent")) ||
    (message.includes("GoogleGenerativeAI Error") &&
      message.includes("404 Not Found"))
  );
}

function friendlyErrorMessage(message: string) {
  if (isApiKeyError(message)) {
    return LOCAL_API_KEY_HELP_MESSAGE;
  }

  if (isGeminiModelError(message)) {
    return GEMINI_MODEL_HELP_MESSAGE;
  }

  return message;
}

export default function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [report, setReport] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [subQuestions, setSubQuestions] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const abortWasRequestedRef = useRef(false);
  const initialTopicAppliedRef = useRef(false);

  useEffect(() => {
    if (initialTopicAppliedRef.current || typeof window === "undefined") {
      return;
    }

    const initialTopic = new URLSearchParams(window.location.search)
      .get("topic")
      ?.replace(/\s+/g, " ")
      .trim();

    if (initialTopic) {
      setTopic(initialTopic);
      initialTopicAppliedRef.current = true;
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function checkServerEnv() {
      try {
        const response = await fetch("/api/env-check", {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const status = (await response.json()) as EnvStatus;
        if (ignore) {
          return;
        }

        setEnvStatus(status);

        if (!status.googleApiKeyConfigured || !status.tavilyApiKeyConfigured) {
          setError(LOCAL_API_KEY_HELP_MESSAGE);
          setRunStatus("failed");
          return;
        }

        setError((current) =>
          current?.startsWith("Your API key") ? null : current
        );
        setRunStatus((current) => (current === "failed" ? "idle" : current));
      } catch {
        if (!ignore) {
          setEnvStatus(null);
        }
      }
    }

    checkServerEnv();

    return () => {
      ignore = true;
    };
  }, []);

  const addTimelineEvent = useCallback(
    (
      agent: string,
      status: TimelineEvent["status"],
      message: string,
      durationMs?: number
    ) => {
      setEvents((current) => {
        const duplicateRunningEvent =
          status === "running" &&
          current.some(
            (event) => event.agent === agent && event.status === "running"
          );

        if (duplicateRunningEvent) {
          return current;
        }

        return [
          ...current,
          {
            id: randomId(),
            agent,
            status,
            message,
            durationMs,
            timestamp: Date.now()
          }
        ];
      });
    },
    []
  );

  const clearWorkspace = useCallback(() => {
    abortWasRequestedRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setTopic("");
    setEvents([]);
    setReport("");
    setSources([]);
    setSubQuestions([]);
    setError(null);
    setRunStatus("idle");
    setIsRunning(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (!isRunning) return;

    abortWasRequestedRef.current = true;
    abortControllerRef.current?.abort();
    setIsRunning(false);
    setRunStatus("failed");
    setError("Research run stopped before completion.");
    addTimelineEvent(
      "Research Workflow",
      "failed",
      "Research run stopped before completion."
    );
  }, [addTimelineEvent, isRunning]);

  const handleStreamEvent = useCallback(
    (event: IncomingStreamEvent) => {
      const payload = event.payload;

      switch (event.type) {
        case "research_started":
          setRunStatus("running");
          addTimelineEvent(
            "Research Workflow",
            "running",
            getString(payload, "message") || "Research workflow started."
          );
          break;
        case "agent_started":
          addTimelineEvent(
            getString(payload, "agent") || "Agent",
            "running",
            getString(payload, "message") || "Agent started."
          );
          break;
        case "agent_completed":
          addTimelineEvent(
            getString(payload, "agent") || "Agent",
            "completed",
            getString(payload, "message") || "Agent completed.",
            getNumber(payload, "durationMs")
          );
          break;
        case "agent_failed":
          addTimelineEvent(
            getString(payload, "agent") || "Agent",
            "failed",
            getString(payload, "message") || "Agent failed.",
            getNumber(payload, "durationMs")
          );
          break;
        case "cache_hit":
          addTimelineEvent(
            "Research Cache",
            "completed",
            getString(payload, "message") || "Loaded a recent report from cache.",
            getNumber(payload, "durationMs")
          );
          break;
        case "subquestions_ready": {
          const nextSubQuestions = Array.isArray(payload?.subQuestions)
            ? payload.subQuestions.filter(
                (question): question is string => typeof question === "string"
              )
            : [];
          setSubQuestions(nextSubQuestions);
          break;
        }
        case "sources_ready": {
          const nextSources = Array.isArray(payload?.sources)
            ? payload.sources.filter(isSource)
            : [];
          setSources(nextSources);
          break;
        }
        case "synthesis_started":
          addTimelineEvent(
            "Conditional Router",
            "completed",
            "At least one researcher succeeded. Synthesis is cleared to run."
          );
          break;
        case "report_ready":
          setReport(getString(payload, "report"));
          break;
        case "research_completed":
          setRunStatus("completed");
          addTimelineEvent(
            "Research Workflow",
            "completed",
            "Research workflow completed.",
            getNumber(payload, "durationMs")
          );
          break;
        case "error": {
          const message = getString(payload, "message") || "Something went wrong.";
          setError(friendlyErrorMessage(message));
          setRunStatus("failed");
          break;
        }
        case "done": {
          const ok = getBoolean(payload, "ok");
          setIsRunning(false);
          setRunStatus(ok === false ? "failed" : "completed");
          break;
        }
        default:
          break;
      }
    },
    [addTimelineEvent]
  );

  const handleSubmit = useCallback(async () => {
    if (isRunning) {
      return;
    }

    const validation = validateTopic(topic);
    if (!validation.ok || !validation.topic) {
      setError(validation.error ?? "Enter a valid research topic.");
      setRunStatus("failed");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    abortWasRequestedRef.current = false;

    setTopic(validation.topic);
    setEvents([
      {
        id: randomId(),
        agent: "Research Workflow",
        status: "running",
        message: "Research started...",
        timestamp: Date.now()
      },
      {
        id: randomId(),
        agent: "Supervisor Agent",
        status: "running",
        message: "Supervisor planning...",
        timestamp: Date.now()
      }
    ]);
    setReport("");
    setSources([]);
    setSubQuestions([]);
    setError(null);
    setRunStatus("running");
    setIsRunning(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ topic: validation.topic }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Research request failed with status ${response.status}.`);
      }

      if (!response.body) {
        throw new Error("The server did not return a readable stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const streamEvent = parseStreamPart(part);
          if (streamEvent) {
            handleStreamEvent(streamEvent);
          }
        }
      }

      buffer += decoder.decode();
      if (buffer.trim()) {
        const streamEvent = parseStreamPart(buffer);
        if (streamEvent) {
          handleStreamEvent(streamEvent);
        }
      }
    } catch (caughtError) {
      if (isAbortError(caughtError)) {
        if (!abortWasRequestedRef.current) {
          setError("Research request was cancelled.");
          setRunStatus("failed");
          addTimelineEvent(
            "Research Workflow",
            "failed",
            "Research request was cancelled."
          );
        }
        return;
      }

      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to run the research workflow.";
      setError(friendlyErrorMessage(message));
      setRunStatus("failed");
      addTimelineEvent("Research Workflow", "failed", message);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsRunning(false);
    }
  }, [addTimelineEvent, handleStreamEvent, isRunning, topic]);

  const statusLabel = useMemo(() => {
    if (runStatus === "running") return "Agents researching";
    if (runStatus === "completed") return "Dossier ready";
    if (runStatus === "failed") return "Needs attention";
    return "Ready";
  }, [runStatus]);

  const statusDescription = useMemo(() => {
    if (runStatus === "running") {
      return "Streaming timeline events from the research API.";
    }

    if (runStatus === "completed") {
      return "Report and sources are ready for review.";
    }

    if (runStatus === "failed") {
      return error?.startsWith("Your API key")
        ? "Local API key check needed. See the form message."
        : error ?? "The run stopped before completion.";
    }

    return "Enter a topic between 10 and 300 characters to begin.";
  }, [error, runStatus]);

  const sourceCards = useMemo(
    () =>
      sources.map((source) => (
        <SourceCard key={`${source.id}-${source.url}`} source={source} />
      )),
    [sources]
  );

  return (
    <main className="paper-grid min-h-screen px-5 py-6 text-studio-ink md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-studio-ink/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-studio-graphite transition hover:text-studio-coral"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back home
            </Link>
            <Link href="/" className="group block">
              <span className="mb-3 inline-flex items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/70 px-3 py-2 text-sm font-bold text-studio-graphite shadow-soft">
                <Home className="h-4 w-4 text-studio-sage" aria-hidden="true" />
                Knowledge Lab
              </span>
            </Link>
            <h1 className="font-serif text-4xl font-semibold leading-tight text-studio-ink md:text-6xl">
              Research workspace
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-studio-graphite/75">
              Submit a topic and watch the supervisor, researchers, router, and
              synthesis agent build the dossier live.
            </p>
          </div>

          <div className="clay-card flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-studio-violet/40">
              <RadioTower className="h-5 w-5 text-studio-ink" aria-hidden="true" />
            </div>
            <div>
              <StatusPill status={runStatus} label={statusLabel} />
              <p className="mt-1 max-w-xs text-xs font-medium leading-5 text-studio-graphite/70">
                {statusDescription}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside>
            <TopicInput
              topic={topic}
              onTopicChange={setTopic}
              onSubmit={handleSubmit}
              onReset={clearWorkspace}
              onCancel={handleCancel}
              isRunning={isRunning}
              error={error}
              envStatus={envStatus}
            />

            {subQuestions.length > 0 ? (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="clay-card mt-6 p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-studio-graphite">
                  <GitBranch className="h-4 w-4 text-studio-violet" aria-hidden="true" />
                  Supervisor plan
                </div>
                <ol className="space-y-2 text-sm leading-6 text-studio-graphite/75">
                  {subQuestions.map((question, index) => (
                    <li key={question} className="flex gap-2">
                      <span className="font-bold text-studio-coral">{index + 1}.</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ol>
              </motion.section>
            ) : null}

            <AgentTimeline events={events} />
          </aside>

          <div className="space-y-6">
            <div className="clay-card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-studio-amber/70">
                  <FileSearch className="h-5 w-5 text-studio-ink" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-studio-graphite/65">
                    Current dossier
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-studio-ink">
                    {topic || "No topic selected yet"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearWorkspace}
                className="studio-button inline-flex h-10 items-center justify-center gap-2 bg-studio-cream px-3 text-sm font-semibold text-studio-graphite"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>

            <ReportViewer report={report} isRunning={isRunning} />

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-studio-ink">Sources</h2>
                  <p className="text-sm text-studio-graphite/70">
                    Tavily results normalized for citations.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/70 px-3 py-1 text-sm font-bold text-studio-graphite shadow-soft">
                  <PanelRight className="h-4 w-4 text-studio-sage" aria-hidden="true" />
                  {sources.length} found
                </span>
              </div>

              {sources.length === 0 ? (
                <div className="clay-card p-5 text-sm leading-6 text-studio-graphite/70">
                  Sources will appear as researchers complete their searches.
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">{sourceCards}</div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
