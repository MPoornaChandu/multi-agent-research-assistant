"use client";

import { memo } from "react";
import { useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  RadioTower,
  XCircle
} from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { StatusPill } from "@/components/StatusPill";

type AgentTimelineProps = {
  events: TimelineEvent[];
};

function StatusIcon({
  shouldReduceMotion,
  status
}: {
  shouldReduceMotion: boolean;
  status: TimelineEvent["status"];
}) {
  if (status === "completed") {
    return (
      <span>
        <CheckCircle2 className="h-5 w-5 text-studio-sage" aria-hidden="true" />
      </span>
    );
  }

  if (status === "failed") {
    return <XCircle className="h-5 w-5 text-studio-coral" aria-hidden="true" />;
  }

  return (
    <Loader2
      className={`h-5 w-5 text-studio-amber ${shouldReduceMotion ? "" : "animate-spin"}`}
      aria-hidden="true"
    />
  );
}

export const AgentTimeline = memo(function AgentTimeline({
  events
}: AgentTimelineProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-studio-ink">Live agent timeline</h2>
          <p className="text-sm text-studio-graphite/70">Supervisor, researchers, router, synthesis.</p>
        </div>
        <RadioTower className="h-5 w-5 text-studio-violet" aria-hidden="true" />
      </div>

      {events.length === 0 ? (
        <div className="clay-card p-5 text-sm leading-6 text-studio-graphite/70">
          Agent activity will appear here as soon as the stream starts.
        </div>
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="clay-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-studio-ink/10 bg-studio-cream">
                  {event.status === "running" ? (
                    <span
                      className={`absolute h-3 w-3 rounded-full bg-studio-amber/55 ${
                        shouldReduceMotion ? "" : "animate-ping"
                      }`}
                    />
                  ) : null}
                  <StatusIcon
                    shouldReduceMotion={shouldReduceMotion}
                    status={event.status}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-studio-ink">{event.agent}</h3>
                    <StatusPill status={event.status} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-studio-graphite/75">{event.message}</p>
                  {typeof event.durationMs === "number" ? (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-studio-graphite/55">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {event.durationMs} ms
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
});
