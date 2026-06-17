"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GitBranch,
  Github,
  Layers3,
  Linkedin,
  RadioTower,
  Route,
  Search,
  Send,
  Sparkles,
  SquarePen,
  Zap
} from "lucide-react";
import { AnimatedResearchDemo } from "@/components/AnimatedResearchDemo";
import { FloatingCards } from "@/components/FloatingCards";
import { StatusPill } from "@/components/StatusPill";
import { ThemeToggle } from "@/components/ThemeToggle";

const architectureFlow = [
  {
    title: "User topic",
    description: "A validated research prompt enters the studio.",
    icon: SquarePen,
    accent: "bg-studio-coral/25"
  },
  {
    title: "Supervisor",
    description: "Breaks the topic into three focused sub-questions.",
    icon: GitBranch,
    accent: "bg-studio-amber/35"
  },
  {
    title: "3 parallel researchers + Tavily",
    description: "Searches the web concurrently and summarizes evidence.",
    icon: Search,
    accent: "bg-studio-sage/35"
  },
  {
    title: "Router checkpoint",
    description: "Routes successful research forward and handles failed branches.",
    icon: Route,
    accent: "bg-studio-violet/35"
  },
  {
    title: "Gemini synthesis",
    description: "Turns the findings into a concise cited narrative.",
    icon: BrainCircuit,
    accent: "bg-studio-coral/25"
  },
  {
    title: "Markdown report + citations",
    description: "Produces a readable dossier with numbered sources.",
    icon: FileText,
    accent: "bg-studio-amber/35"
  },
  {
    title: "SSE stream to UI",
    description: "Streams timeline events, sources, and the final report.",
    icon: Send,
    accent: "bg-studio-sage/35"
  }
];

const workflow = [
  ["00:01", "Supervisor drafts the research plan", "completed"],
  ["00:04", "Researchers fan out across Tavily", "running"],
  ["00:11", "Sources are deduped and renumbered", "idle"],
  ["00:18", "Synthesizer prepares the dossier", "idle"]
] as const;

const stack = [
  "Next.js 14",
  "App Router",
  "TypeScript",
  "LangGraph",
  "Gemini 2.5 Flash Lite",
  "Tavily Search",
  "Framer Motion",
  "SSE Streaming"
];

const valuePoints = [
  "Shows practical agent orchestration instead of a static chatbot demo.",
  "Uses server-only API keys, streaming UX, validation, and graceful failures.",
  "Packages the work as a polished portfolio product for internship reviewers."
];

const SAMPLE_TOPIC = "Future of AI agents in software engineering internships";
const SAMPLE_RESEARCH_HREF = `/research?topic=${encodeURIComponent(SAMPLE_TOPIC)}`;
const PROJECT_GITHUB_URL =
  "https://github.com/MPoornaChandu/multi-agent-research-assistant";
const PROFILE_GITHUB_URL = "https://github.com/MPoornaChandu";
const LINKEDIN_URL =
  "https://www.linkedin.com/in/poorna-chandu-938119379/";

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

function HeroDecorations({
  shouldReduceMotion
}: {
  shouldReduceMotion: boolean;
}) {
  const floatTransition = shouldReduceMotion
    ? { duration: 0.2 }
    : { duration: 8, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--hero-start),var(--hero-mid)_48%,var(--hero-end))]" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--hero-paper-dot) 1px, transparent 0), linear-gradient(var(--hero-paper-line) 1px, transparent 1px), linear-gradient(90deg, var(--hero-paper-line) 1px, transparent 1px)",
          backgroundPosition: "0 0, 0 0, 0 0",
          backgroundSize: "22px 22px, 96px 96px, 96px 96px"
        }}
      />

      <div className="absolute left-[-8%] top-[18%] h-72 w-72 rounded-full bg-[var(--hero-blob-peach)] blur-3xl" />
      <div className="absolute right-[8%] top-[16%] h-80 w-80 rounded-full bg-[var(--hero-blob-violet)] blur-3xl" />
      <div className="absolute bottom-[8%] left-[35%] h-64 w-64 rounded-full bg-[var(--hero-blob-amber)] blur-3xl" />
      <div className="absolute bottom-[-18%] right-[-8%] h-72 w-72 rounded-full bg-[var(--hero-blob-sage)] blur-3xl" />

      {[
        "left-[8%] top-[22%]",
        "right-[18%] top-[14%]",
        "left-[47%] top-[62%]",
        "right-[9%] bottom-[22%]"
      ].map((className, index) => (
        <motion.div
          key={className}
          className={`absolute ${className} hidden text-studio-coral/35 sm:block`}
          animate={
            shouldReduceMotion
              ? { opacity: 0.35 }
              : { opacity: [0.18, 0.42, 0.18], y: [0, -5, 0] }
          }
          transition={{ ...floatTransition, delay: index * 0.35 }}
        >
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </motion.div>
      ))}

      {[
        {
          className: "left-[5%] top-[12%] h-16 w-16 bg-studio-amber/20",
          cutout: "-right-3 top-0 h-16 w-16"
        },
        {
          className: "right-[33%] top-[28%] hidden h-12 w-12 bg-studio-coral/15 md:block",
          cutout: "-right-2 top-0 h-12 w-12"
        },
        {
          className: "bottom-[18%] left-[24%] h-10 w-10 bg-studio-violet/15",
          cutout: "-right-2 top-0 h-10 w-10"
        }
      ].map((moon, index) => (
        <motion.div
          key={moon.className}
          className={`absolute rounded-full ${moon.className}`}
          animate={
            shouldReduceMotion
              ? { y: 0, rotate: 0 }
              : { y: [0, index % 2 ? -4 : 4, 0], rotate: [0, 4, 0] }
          }
          transition={{ ...floatTransition, delay: index * 0.45 }}
        >
          <div className={`absolute rounded-full bg-[var(--hero-moon-cutout)] ${moon.cutout}`} />
        </motion.div>
      ))}

      <div className="absolute left-[13%] top-[48%] hidden h-1.5 w-1.5 rounded-full bg-studio-amber/45 sm:block" />
      <div className="absolute right-[42%] top-[19%] hidden h-1 w-10 rotate-[-18deg] rounded-full bg-studio-coral/20 md:block" />
      <div className="absolute bottom-[26%] right-[18%] hidden h-1 w-12 rotate-[21deg] rounded-full bg-studio-sage/25 lg:block" />
    </div>
  );
}

export default function HomePage() {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <main className="paper-grid min-h-screen overflow-hidden text-studio-ink">
      <header className="sticky top-0 z-30 border-b border-studio-ink/10 bg-studio-cream/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-studio-ink text-studio-cream transition group-hover:-rotate-3">
              <Layers3 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-serif text-lg font-semibold text-studio-ink">
              Multi-Agent Research Assistant
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={SAMPLE_RESEARCH_HREF}
              className="studio-button hidden h-10 items-center gap-2 bg-studio-cream px-3 text-sm font-semibold text-studio-graphite md:inline-flex"
            >
              Prefill sample
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={PROJECT_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="studio-button hidden h-10 items-center gap-2 bg-studio-ink px-3 text-sm font-semibold text-studio-cream md:inline-flex"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              View GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative min-h-[78vh] overflow-hidden px-5 pb-14 pt-16 md:px-8 md:pt-24">
        <HeroDecorations shouldReduceMotion={shouldReduceMotion} />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(390px,0.66fr)] lg:items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/80 px-3 py-2 text-sm font-semibold text-studio-graphite shadow-soft">
              <Sparkles className="h-4 w-4 text-studio-coral" aria-hidden="true" />
              Research Studio / Knowledge Lab
            </div>

            <h1 className="font-serif text-5xl font-semibold leading-[1.03] text-studio-ink md:text-7xl">
              Multi-Agent Research Studio
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-studio-graphite/80">
              A premium research workspace where a supervisor, three parallel researchers,
              and a synthesis agent build cited markdown reports in real time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/research"
                className="studio-button inline-flex h-12 items-center gap-2 bg-studio-ink px-5 text-sm font-semibold text-studio-cream"
              >
                Start Research
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={SAMPLE_RESEARCH_HREF}
                className="studio-button inline-flex h-12 items-center gap-2 bg-studio-cream px-5 text-sm font-semibold text-studio-graphite"
              >
                Prefill sample topic
                <Zap className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={PROJECT_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-button inline-flex h-12 items-center gap-2 bg-studio-coral px-5 text-sm font-semibold text-studio-ink"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                View GitHub
              </a>
            </div>

            <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["3", "parallel agents"],
                ["60s", "stream window"],
                ["100%", "server-only keys"]
              ].map(([stat, label]) => (
                <div key={label} className="rounded-lg border border-studio-ink/10 bg-studio-cream/60 p-4 shadow-soft">
                  <div className="font-serif text-3xl font-semibold text-studio-ink">{stat}</div>
                  <div className="mt-1 text-sm font-medium text-studio-graphite/70">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          >
            <AnimatedResearchDemo />
          </motion.div>
        </div>
      </section>

      <section id="architecture" className="relative px-5 py-14 md:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          transition={{ duration: 0.42 }}
          className="mx-auto max-w-7xl"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-studio-coral">
                Architecture
              </p>
              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-studio-ink">
                The workflow is legible in ten seconds.
              </h2>
              <p className="mt-4 text-base leading-7 text-studio-graphite/75">
                The API route calls the compiled LangGraph runner for the agent
                nodes, while the route owns SSE framing, cache checks, validation,
                and production-safe response mapping.
              </p>
            </div>
            <StatusPill status="running" label="LangGraph + SSE" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {architectureFlow.map((item, index) => {
              const Icon = item.icon;
              const hasConnector = index < architectureFlow.length - 1;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: index * 0.08 }}
                  className="relative"
                >
                  <article className="clay-card relative z-10 flex h-full flex-col p-4">
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${item.accent}`}
                    >
                      <Icon className="h-5 w-5 text-studio-ink" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold leading-5 text-studio-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs font-medium leading-5 text-studio-graphite/70">
                      {item.description}
                    </p>
                  </article>

                  {hasConnector ? (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute left-5 top-full z-0 h-3 w-px overflow-hidden bg-studio-ink/10 sm:hidden"
                      >
                        <motion.span
                          className="block h-1/2 w-full bg-studio-coral"
                          animate={
                            shouldReduceMotion ? { y: 0 } : { y: ["-100%", "220%"] }
                          }
                          transition={
                            shouldReduceMotion
                              ? { duration: 0.2 }
                              : {
                                  duration: 1.8,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: index * 0.12
                                }
                          }
                        />
                      </div>
                      <div
                        aria-hidden="true"
                        className="absolute right-[-0.9rem] top-1/2 z-0 hidden h-px w-5 overflow-hidden bg-studio-ink/10 lg:block"
                      >
                        <motion.span
                          className="block h-full w-1/2 bg-gradient-to-r from-studio-coral via-studio-violet to-studio-amber"
                          animate={
                            shouldReduceMotion ? { x: 0 } : { x: ["-110%", "220%"] }
                          }
                          transition={
                            shouldReduceMotion
                              ? { duration: 0.2 }
                              : {
                                  duration: 1.8,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: index * 0.12
                                }
                          }
                        />
                      </div>
                    </>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="px-5 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            transition={{ duration: 0.42 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-studio-sage">
              Live workflow preview
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-studio-ink">
              Every step speaks back while the agents work.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-studio-graphite/75">
              The UI reads server-sent events through `fetch()`, so timeline updates,
              source cards, and the final markdown report arrive as the workflow unfolds.
            </p>
            <div className="mt-6">
              <Link
                href={SAMPLE_RESEARCH_HREF}
                className="studio-button inline-flex h-11 items-center gap-2 bg-studio-coral px-4 text-sm font-bold text-studio-ink"
              >
                Prefill sample topic
                <Zap className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div className="clay-card p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-studio-ink">Mini timeline</h3>
                  <p className="text-sm text-studio-graphite/70">A preview of the live stream.</p>
                </div>
                <RadioTower className="h-5 w-5 text-studio-violet" aria-hidden="true" />
              </div>

              <ol className="space-y-3">
                {workflow.map(([time, label, status], index) => (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: 14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: index * 0.09 }}
                    className="flex items-center gap-3 rounded-lg border border-studio-ink/10 bg-studio-cream/65 p-3"
                  >
                    <span className="w-12 text-xs font-bold text-studio-graphite/55">{time}</span>
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-6 text-studio-graphite">
                      {label}
                    </span>
                    <StatusPill status={status} />
                  </motion.li>
                ))}
              </ol>
            </div>
            <FloatingCards />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-studio-violet">
              Tech stack
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-studio-ink">
              Pinned, practical, and deployable.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stack.map((item) => (
              <div key={item} className="rounded-lg border border-studio-ink/10 bg-studio-cream/70 px-4 py-3 text-sm font-bold text-studio-graphite shadow-soft">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-10 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_1.15fr] lg:items-stretch">
          <div className="clay-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-studio-ink text-studio-cream">
              <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-8 font-serif text-4xl font-semibold leading-tight text-studio-ink">
              Portfolio value for internship reviewers.
            </h2>
            <p className="mt-4 text-base leading-7 text-studio-graphite/75">
              It demonstrates product taste, full-stack implementation, streaming UX,
              production hygiene, and agentic AI architecture in one focused project.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {valuePoints.map((point, index) => (
              <motion.article
                key={point}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.28, delay: index * 0.08 }}
                className="clay-card p-5"
              >
                <CheckCircle2 className="mb-5 h-6 w-6 text-studio-sage" aria-hidden="true" />
                <p className="text-sm font-semibold leading-6 text-studio-graphite">{point}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-studio-ink/10 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-studio-graphite/75 md:flex-row md:items-center md:justify-between">
            <p>Built by M. Poorna Chandu</p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={PROFILE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center gap-2 transition hover:text-studio-coral"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center gap-2 transition hover:text-studio-coral"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a
              href={PROJECT_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center gap-2 transition hover:text-studio-coral"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              <span>Project repository</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
