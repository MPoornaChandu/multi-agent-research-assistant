"use client";

import { ArrowRight, Loader2, RotateCcw, Sparkles, Square } from "lucide-react";
import { TOPIC_MAX_LENGTH, TOPIC_MIN_LENGTH } from "@/lib/validation";

const EXAMPLE_TOPICS = [
  "Future of AI agents in software engineering internships",
  "Impact of climate change on Indian agriculture and food security",
  "Rise of electric vehicles in India through 2030",
  "How quantum computing may affect cybersecurity policy"
];

type TopicInputProps = {
  topic: string;
  onTopicChange: (topic: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onCancel: () => void;
  isRunning: boolean;
  error?: string | null;
  envStatus?: {
    googleApiKeyConfigured: boolean;
    tavilyApiKeyConfigured: boolean;
    fastMode?: boolean;
    geminiModelConfigured?: boolean;
    tavilyMaxResultsConfigured?: boolean;
  } | null;
};

export function TopicInput({
  topic,
  onTopicChange,
  onSubmit,
  onReset,
  onCancel,
  isRunning,
  error,
  envStatus
}: TopicInputProps) {
  const normalizedLength = topic.trim().replace(/\s+/g, " ").length;
  const isOverLimit = normalizedLength > TOPIC_MAX_LENGTH;
  const showEnvCheckLink =
    process.env.NODE_ENV !== "production" &&
    error?.startsWith("Your API key is not being detected");
  const showEnvDebug = process.env.NODE_ENV !== "production" && envStatus;

  return (
    <form
      className="clay-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-studio-graphite">
            <Sparkles className="h-4 w-4 text-studio-coral" aria-hidden="true" />
            Research topic
          </div>
          <p className="mt-1 text-sm leading-6 text-studio-graphite/70">
            Ask for a topic, trend, market, technology, or policy question.
          </p>
        </div>
      </div>

      <label htmlFor="research-topic" className="sr-only">
        Research topic
      </label>
      <textarea
        id="research-topic"
        value={topic}
        onChange={(event) => onTopicChange(event.target.value)}
        placeholder="Example: How are multi-agent AI systems changing software engineering work?"
        disabled={isRunning}
        aria-describedby={error ? "research-topic-error" : undefined}
        aria-invalid={Boolean(error)}
        className="min-h-40 w-full resize-none rounded-lg border border-studio-ink/10 bg-studio-cream/80 p-4 text-base leading-7 text-studio-ink placeholder:text-studio-graphite/40 shadow-inner shadow-studio-graphite/5 transition focus:border-studio-coral focus:ring-2 focus:ring-studio-coral/20 disabled:cursor-not-allowed disabled:opacity-70"
        maxLength={600}
      />

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-studio-graphite/60">
        <span className={isOverLimit ? "font-semibold text-studio-coral" : ""}>
          {normalizedLength}/{TOPIC_MAX_LENGTH} characters
        </span>
        <span>Minimum {TOPIC_MIN_LENGTH}</span>
      </div>

      {error ? (
        <div
          id="research-topic-error"
          className="mt-3 whitespace-pre-line rounded-lg border border-studio-coral/35 bg-studio-coral/15 px-3 py-2 text-sm font-medium leading-6 text-studio-graphite"
        >
          {error}
          {showEnvCheckLink ? (
            <a
              href="/api/env-check"
              className="mt-2 block font-bold text-studio-ink underline decoration-studio-coral/60 underline-offset-4"
            >
              /api/env-check
            </a>
          ) : null}
          {showEnvDebug ? (
            <div className="mt-2 rounded-md border border-studio-ink/10 bg-studio-cream/70 px-2 py-1 text-xs font-bold text-studio-graphite">
              Env check: Gemini{" "}
              {envStatus.googleApiKeyConfigured ? "detected" : "missing"} /
              Tavily {envStatus.tavilyApiKeyConfigured ? "detected" : "missing"}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {EXAMPLE_TOPICS.map((example) => (
          <button
            key={example}
            type="button"
            disabled={isRunning}
            onClick={() => onTopicChange(example)}
            className="rounded-full border border-studio-ink/10 bg-studio-cream/75 px-4 py-2.5 text-left text-sm font-semibold leading-5 text-studio-graphite shadow-soft transition hover:border-studio-sage hover:bg-studio-sage/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <button
          type="submit"
          disabled={isRunning}
          className="studio-button inline-flex h-12 w-full items-center justify-center gap-2 bg-studio-ink px-5 text-sm font-semibold text-studio-cream disabled:cursor-not-allowed disabled:bg-studio-graphite/25 disabled:text-studio-graphite/50"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Researching...
            </>
          ) : (
            <>
              Start Research
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>

        <div className="grid gap-2 sm:grid-flow-col">
          {isRunning ? (
            <button
              type="button"
              onClick={onCancel}
              className="studio-button inline-flex h-12 items-center justify-center gap-2 border-studio-coral/35 bg-studio-coral/15 px-4 text-sm font-semibold text-studio-graphite"
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="studio-button inline-flex h-12 items-center justify-center gap-2 bg-studio-cream px-4 text-sm font-semibold text-studio-graphite"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
