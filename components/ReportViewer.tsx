"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Clock3,
  Download,
  FileText,
  RadioTower,
  SearchCheck,
  Sparkles
} from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

type ReportViewerProps = {
  report: string;
  isRunning?: boolean;
  topic?: string;
  sourceCount?: number;
  modeLabel?: string;
  durationMs?: number | null;
  cached?: boolean;
  runStatus?: "idle" | "running" | "completed" | "failed";
};

const previewRows = [
  "Supervisor waiting",
  "Researchers ready",
  "Sources pending",
  "Synthesis idle"
];

function formatDuration(durationMs?: number | null) {
  if (typeof durationMs !== "number") {
    return "Not reported";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(durationMs < 10000 ? 1 : 0)} s`;
}

function sanitizeFilename(topic: string) {
  const base = topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return `${base || "research-report"}.md`;
}

function downloadMarkdown(report: string, topic: string) {
  const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizeFilename(topic);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function linkifyCitations(report: string, sourceCount: number) {
  if (!report || sourceCount === 0) {
    return report;
  }

  return report.replace(/\[(\d+)\]/g, (match, citationId, offset, fullText) => {
    const nextCharacter = fullText[offset + match.length];
    const citationNumber = Number(citationId);

    if (nextCharacter === "(" || citationNumber < 1 || citationNumber > sourceCount) {
      return match;
    }

    return `[${match}](#source-${citationNumber})`;
  });
}

export function ReportViewer({
  report,
  isRunning = false,
  topic = "",
  sourceCount = 0,
  modeLabel = "Mode checking",
  durationMs = null,
  cached = false,
  runStatus = "idle"
}: ReportViewerProps) {
  const [progress, setProgress] = useState(0);
  const linkedReport = useMemo(
    () => linkifyCitations(report, sourceCount),
    [report, sourceCount]
  );
  const summaryItems = [
    {
      label: "Topic",
      value: topic || "Untitled run",
      icon: Sparkles
    },
    {
      label: "Sources",
      value: `${sourceCount} source${sourceCount === 1 ? "" : "s"}`,
      icon: SearchCheck
    },
    {
      label: "Mode",
      value: cached ? `${modeLabel} / cache hit` : modeLabel,
      icon: RadioTower
    },
    {
      label: "Duration",
      value: formatDuration(durationMs),
      icon: Clock3
    }
  ];

  useEffect(() => {
    if (isRunning) {
      setProgress((current) => (current > 0 ? current : 12));
      const interval = window.setInterval(() => {
        setProgress((current) => Math.min(85, current + Math.max(1, (85 - current) * 0.08)));
      }, 450);

      return () => window.clearInterval(interval);
    }

    if (runStatus === "completed" && report) {
      setProgress(100);
      return;
    }

    if (runStatus === "idle" || runStatus === "failed") {
      setProgress(0);
    }
  }, [isRunning, report, runStatus]);

  return (
    <section id="research-dossier" className="clay-card overflow-hidden p-5">
      {progress > 0 ? (
        <div className="-mx-5 -mt-5 mb-5 h-1 overflow-hidden bg-studio-ink/10">
          <motion.div
            className="h-full bg-gradient-to-r from-studio-coral via-studio-violet to-studio-sage"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          />
        </div>
      ) : null}
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-studio-ink">Research dossier</h2>
          <p className="text-sm text-studio-graphite/70">Markdown synthesis with cited sources.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {report ? <CopyButton text={report} className="w-full sm:w-auto" /> : null}
          {report ? (
            <button
              type="button"
              onClick={() => downloadMarkdown(report, topic)}
              className="studio-button inline-flex h-10 w-full items-center justify-center gap-2 bg-studio-cream px-3 text-sm font-semibold text-studio-graphite sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download as Markdown
            </button>
          ) : null}
          <FileText className="h-5 w-5 text-studio-coral" aria-hidden="true" />
        </div>
      </div>

      {!report ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-studio-ink/15 bg-studio-cream/55 p-6 text-center sm:p-8">
          <div className="max-w-lg">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-studio-amber" aria-hidden="true" />
            <p className="font-serif text-2xl font-semibold leading-tight text-studio-ink">
              Your dossier will appear here.
            </p>
            <p className="mt-3 text-sm leading-6 text-studio-graphite/70">
              {isRunning
                ? "The synthesis agent will render the report when the research team finishes."
                : "Start with a topic and watch the research team plan, search, route, and synthesize in real time."}
            </p>
            <div className="mt-6 grid gap-2 text-left sm:grid-cols-2">
              {previewRows.map((row, index) => (
                <div
                  key={row}
                  className="flex items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/70 px-3 py-2 text-xs font-bold text-studio-graphite shadow-soft"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      index === 0
                        ? "bg-studio-amber"
                        : index === 1
                          ? "bg-studio-sage"
                          : index === 2
                            ? "bg-studio-violet"
                            : "bg-studio-coral"
                    }`}
                  />
                  {row}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-2 rounded-lg border border-studio-ink/10 bg-studio-clay/45 p-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="min-w-0 rounded-lg border border-studio-ink/10 bg-studio-cream/70 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-studio-graphite/55">
                    <Icon className="h-3.5 w-3.5 text-studio-coral" aria-hidden="true" />
                    {item.label}
                  </div>
                  <p className="mt-1 truncate text-sm font-bold text-studio-ink">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className="max-w-none overflow-hidden text-studio-graphite [&_a]:break-words [&_hr]:border-studio-ink/10 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_p]:my-4 [&_p]:leading-7 [&_strong]:text-studio-ink [&_table]:my-5 [&_table]:w-full [&_table]:overflow-hidden [&_td]:border [&_td]:border-studio-ink/10 [&_td]:p-3 [&_th]:border [&_th]:border-studio-ink/10 [&_th]:bg-studio-clay/80 [&_th]:p-3 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="gradient-text mt-0 border-b border-studio-ink/10 pb-3 font-serif text-3xl font-semibold">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-8 text-xl font-bold text-studio-ink">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="mt-6 text-base font-bold text-studio-graphite">
                    {children}
                  </h4>
                ),
                a: ({ href, children }) => {
                  const isSourceAnchor = href?.startsWith("#source-");

                  return (
                  <a
                    href={href}
                    target={isSourceAnchor ? undefined : "_blank"}
                    rel={isSourceAnchor ? undefined : "noopener noreferrer"}
                    className="font-semibold text-studio-coral underline decoration-studio-coral/35 transition hover:text-studio-ink"
                  >
                    {children}
                  </a>
                  );
                },
                code: ({ children }) => (
                  <code className="rounded-lg border border-studio-ink/10 bg-studio-clay px-1.5 py-0.5 text-studio-ink">
                    {children}
                  </code>
                )
              }}
            >
              {linkedReport}
            </ReactMarkdown>
          </motion.article>
        </>
      )}
    </section>
  );
}
