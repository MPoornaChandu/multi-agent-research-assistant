"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

type ReportViewerProps = {
  report: string;
  isRunning?: boolean;
};

export function ReportViewer({ report, isRunning = false }: ReportViewerProps) {
  return (
    <section className="clay-card p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-studio-ink">Research dossier</h2>
          <p className="text-sm text-studio-graphite/70">Markdown synthesis with cited sources.</p>
        </div>
        <div className="flex items-center gap-2">
          {report ? <CopyButton text={report} /> : null}
          <FileText className="h-5 w-5 text-studio-coral" aria-hidden="true" />
        </div>
      </div>

      {!report ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-studio-ink/15 bg-studio-cream/55 p-8 text-center">
          <div className="max-w-sm">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-studio-amber" aria-hidden="true" />
            <p className="font-serif text-2xl font-semibold leading-tight text-studio-ink">
              Your research dossier will appear here.
            </p>
            <p className="mt-3 text-sm leading-6 text-studio-graphite/70">
              {isRunning
                ? "The synthesis agent will render the report when the research team finishes."
                : "Start a topic and watch the research team build it live."}
            </p>
          </div>
        </div>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="max-w-none text-studio-graphite [&_hr]:border-studio-ink/10 [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_p]:my-4 [&_p]:leading-7 [&_strong]:text-studio-ink [&_table]:my-5 [&_table]:w-full [&_table]:overflow-hidden [&_td]:border [&_td]:border-studio-ink/10 [&_td]:p-3 [&_th]:border [&_th]:border-studio-ink/10 [&_th]:bg-studio-clay/80 [&_th]:p-3 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6"
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
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-studio-coral underline decoration-studio-coral/35 transition hover:text-studio-ink"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded-lg border border-studio-ink/10 bg-studio-clay px-1.5 py-0.5 text-studio-ink">
                  {children}
                </code>
              )
            }}
          >
            {report}
          </ReactMarkdown>
        </motion.article>
      )}
    </section>
  );
}
