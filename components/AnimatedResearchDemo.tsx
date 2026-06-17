"use client";

import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import {
  CheckCircle2,
  FileText,
  GitBranch,
  Loader2,
  Route,
  Search,
  Sparkles
} from "lucide-react";

const prompt =
  "Research the future of AI agents in software engineering internships";

const agents = [
  {
    label: "Supervisor planning",
    icon: GitBranch,
    tone: "bg-studio-amber/75 text-studio-ink"
  },
  {
    label: "Search A scanning sources",
    icon: Search,
    tone: "bg-studio-sage/75 text-studio-ink"
  },
  {
    label: "Search B collecting evidence",
    icon: Search,
    tone: "bg-studio-violet/75 text-studio-ink"
  },
  {
    label: "Search C checking trends",
    icon: Search,
    tone: "bg-studio-coral/75 text-studio-ink"
  },
  {
    label: "Synthesizer writing dossier",
    icon: FileText,
    tone: "bg-studio-ink text-studio-cream"
  }
];

const reportLines = [
  "Executive Summary",
  "AI agents are becoming practical workflow partners for software teams.",
  "Students who can build tool-using systems will stand out in internships.",
  "",
  "Key Insight",
  "Portfolio projects with search, orchestration, citations, and streaming UX show stronger engineering maturity than basic chatbot demos.",
  "",
  "Sources"
];

const citations = [
  "[1] Market trend mapped",
  "[2] Workflow evidence checked",
  "[3] Internship signal summarized"
];

const floatingSourceChips = [
  {
    label: "[1] Evidence mapped",
    className: "left-1 top-10 sm:-left-1 sm:top-12",
    tone: "bg-studio-sage/35",
    delay: 0
  },
  {
    label: "[2] Trend checked",
    className: "right-1 top-28 sm:-right-1 sm:top-32",
    tone: "bg-studio-violet/35",
    delay: 0.18
  },
  {
    label: "[3] Citation ready",
    className: "bottom-8 right-4 sm:bottom-10 sm:right-8",
    tone: "bg-studio-amber/35",
    delay: 0.32
  }
];

const backgroundCards = [
  {
    label: "Evidence mapped",
    icon: Search,
    className: "right-5 top-1 sm:right-8",
    tone: "bg-studio-sage/25",
    motion: { x: [0, 4, 0], y: [0, -6, 0] },
    delay: 0
  },
  {
    label: "Citation ready",
    icon: CheckCircle2,
    className: "bottom-1 left-3 sm:left-7",
    tone: "bg-studio-violet/25",
    motion: { x: [0, -4, 0], y: [0, 5, 0] },
    delay: 0.3
  },
  {
    label: "Trend checked",
    icon: Sparkles,
    className: "bottom-3 right-7",
    tone: "bg-studio-coral/25",
    motion: { x: [0, 3, 0], y: [0, -5, 0] },
    delay: 0.55
  },
  {
    label: "Router ready",
    icon: Route,
    className: "left-5 top-1 sm:left-10",
    tone: "bg-studio-amber/25",
    motion: { x: [0, -3, 0], y: [0, 5, 0] },
    delay: 0.7
  }
];

const finalReport = reportLines.join("\n");

function isHeading(line: string) {
  return (
    line === "Executive Summary" ||
    line === "Key Insight" ||
    line === "Sources"
  );
}

export function AnimatedResearchDemo() {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [queryVisible, setQueryVisible] = useState(false);
  const [visibleAgents, setVisibleAgents] = useState(0);
  const [activeAgent, setActiveAgent] = useState(-1);
  const [completedAgents, setCompletedAgents] = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [typedReport, setTypedReport] = useState("");
  const [citationsVisible, setCitationsVisible] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 110, damping: 20, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 110, damping: 20, mass: 0.4 });
  const rotateX = useTransform(springY, [-1, 1], [4, -4]);
  const rotateY = useTransform(springX, [-1, 1], [-5, 5]);
  const frontX = useTransform(springX, [-1, 1], [-8, 8]);
  const frontY = useTransform(springY, [-1, 1], [-6, 6]);
  const backX = useTransform(springX, [-1, 1], [-3, 3]);
  const backY = useTransform(springY, [-1, 1], [-2, 2]);
  const chipX = useTransform(springX, [-1, 1], [-10, 10]);
  const chipY = useTransform(springY, [-1, 1], [-7, 7]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setQueryVisible(true);
      setVisibleAgents(agents.length);
      setActiveAgent(-1);
      setCompletedAgents(agents.length);
      setReportVisible(true);
      setTypedReport(finalReport);
      setCitationsVisible(true);
      return;
    }

    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    function schedule(callback: () => void, delay: number) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!cancelled) {
          callback();
        }
      }, delay);
      timers.add(timer);
    }

    function reset() {
      setQueryVisible(false);
      setVisibleAgents(0);
      setActiveAgent(-1);
      setCompletedAgents(0);
      setReportVisible(false);
      setTypedReport("");
      setCitationsVisible(false);
    }

    function typeReport(position: number) {
      setTypedReport(finalReport.slice(0, position));

      if (position < finalReport.length) {
        schedule(() => typeReport(position + 1), 18);
        return;
      }

      setActiveAgent(-1);
      schedule(() => setCitationsVisible(true), 220);
      schedule(runCycle, 2400);
    }

    function runCycle() {
      reset();

      schedule(() => setQueryVisible(true), 300);

      agents.forEach((_, index) => {
        const startAt = 900 + index * 430;

        schedule(() => {
          setVisibleAgents(index + 1);
          setActiveAgent(index);
        }, startAt);

        schedule(() => {
          setCompletedAgents(index + 1);
        }, startAt + 300);
      });

      const reportAt = 900 + agents.length * 430 + 420;
      schedule(() => setReportVisible(true), reportAt);
      schedule(() => typeReport(1), reportAt + 520);
    }

    runCycle();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [shouldReduceMotion]);

  const typedLines = useMemo(() => typedReport.split("\n"), [typedReport]);
  const isTyping = !shouldReduceMotion && typedReport.length < finalReport.length;

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (shouldReduceMotion || event.pointerType !== "mouse") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointerX.set(Math.max(-1, Math.min(1, x)));
    pointerY.set(Math.max(-1, Math.min(1, y)));
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      aria-label="Live dossier preview animation showing a sample research workflow"
      className="relative mx-auto w-full max-w-[520px] px-1 py-5 [perspective:1200px] sm:px-3 sm:py-6"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="relative"
        animate={
          shouldReduceMotion ? { y: 0, rotate: 0 } : { y: [0, -6, 0], rotate: [0, 0.3, 0] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.2 }
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d"
        }}
      >
        {backgroundCards.map((card) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.label}
              aria-hidden="true"
              className={`absolute z-0 hidden items-center gap-2 rounded-lg border border-studio-ink/10 ${card.tone} px-3 py-2 text-xs font-bold text-studio-graphite shadow-soft backdrop-blur sm:flex ${card.className}`}
              animate={shouldReduceMotion ? { opacity: 0.62 } : { opacity: [0.36, 0.7, 0.36], ...card.motion }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.2 }
                  : {
                      duration: 5.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: card.delay
                    }
              }
            >
              <Icon className="h-3.5 w-3.5 text-studio-coral" aria-hidden="true" />
              {card.label}
            </motion.div>
          );
        })}

        <motion.div
          aria-hidden="true"
          className="absolute inset-x-5 top-8 z-0 h-[calc(100%-3.5rem)] rounded-lg border border-studio-coral/15 bg-[#FFD8C2]/25 shadow-soft"
          style={{
            x: shouldReduceMotion ? 0 : backX,
            y: shouldReduceMotion ? 0 : backY,
            rotate: -4,
            transformStyle: "preserve-3d"
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-3 top-6 z-0 h-[calc(100%-3.5rem)] rounded-lg border border-studio-violet/20 bg-studio-violet/15 shadow-soft"
          style={{
            x: shouldReduceMotion ? 0 : backX,
            y: shouldReduceMotion ? 0 : backY,
            rotate: 3,
            transformStyle: "preserve-3d"
          }}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-7 top-[43%] z-10 hidden h-16 sm:block"
          animate={shouldReduceMotion ? { opacity: 0.42 } : { opacity: [0.28, 0.68, 0.28] }}
          transition={
            shouldReduceMotion
              ? { duration: 0.2 }
              : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <svg className="h-full w-full" viewBox="0 0 520 64" preserveAspectRatio="none">
            <defs>
              <linearGradient id="research-demo-connector" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="var(--coral)" stopOpacity="0.2" />
                <stop offset="48%" stopColor="var(--violet)" stopOpacity="0.74" />
                <stop offset="100%" stopColor="var(--amber)" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <path
              d="M20 10 C140 58 356 4 500 50"
              fill="none"
              stroke="url(#research-demo-connector)"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </motion.div>

        {floatingSourceChips.map((chip) => (
          <motion.div
            key={chip.label}
            aria-hidden="true"
            className={`absolute z-30 rounded-lg border border-studio-ink/10 ${chip.tone} px-2.5 py-1 text-[11px] font-bold text-studio-ink shadow-soft backdrop-blur ${chip.className}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={
              citationsVisible
                ? shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: [0.72, 1, 0.72], y: [0, -5, 0] }
                : { opacity: 0, y: 6 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.2 }
                : {
                    opacity: {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: chip.delay
                    },
                    y: {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: chip.delay
                    }
                  }
            }
            style={{
              x: shouldReduceMotion ? 0 : chipX,
              transformStyle: "preserve-3d"
            }}
          >
            {chip.label}
          </motion.div>
        ))}

        <motion.div
          aria-hidden="true"
          className="relative z-20 overflow-hidden rounded-lg border border-studio-ink/10 bg-studio-cream/70 p-3.5 shadow-soft backdrop-blur-xl sm:p-4"
          style={{
            x: shouldReduceMotion ? 0 : frontX,
            y: shouldReduceMotion ? 0 : frontY,
            transformStyle: "preserve-3d"
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,122,89,.16),transparent_18rem),radial-gradient(circle_at_90%_10%,rgba(182,140,255,.14),transparent_18rem)]" />
          <div className="relative">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/80 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-studio-graphite shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-studio-coral" aria-hidden="true" />
                Live Dossier Preview
              </div>
              <span className="rounded-lg border border-studio-sage/40 bg-studio-sage/15 px-2.5 py-1 text-[11px] font-bold text-studio-graphite">
                Fake demo
              </span>
            </div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={queryVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="ml-auto max-w-[92%] rounded-lg border border-studio-coral/25 bg-studio-coral/15 px-3 py-2.5 text-[13px] font-semibold leading-6 text-studio-ink"
            >
              {prompt}
            </motion.div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {agents.map((agent, index) => {
                const Icon = agent.icon;
                const isVisible = visibleAgents > index;
                const isCompleted = completedAgents > index;
                const isRunning = activeAgent === index && !isCompleted;

                return (
                  <motion.div
                    key={agent.label}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex min-h-10 items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/75 px-2.5 py-2 text-[11px] font-bold text-studio-graphite shadow-soft"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${agent.tone}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 leading-5">{agent.label}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-studio-sage" aria-hidden="true" />
                    ) : (
                      <Loader2
                        className={`h-4 w-4 shrink-0 text-studio-amber ${
                          isRunning && !shouldReduceMotion ? "animate-spin" : "opacity-35"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
              animate={
                reportVisible
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 18, scale: 0.98 }
              }
              transition={{ duration: 0.34, ease: "easeOut" }}
              className="mt-3 rounded-lg border border-studio-ink/10 bg-studio-cream/90 p-3.5 text-studio-graphite shadow-soft"
            >
              <div className="mb-2.5 flex items-center justify-between gap-3 border-b border-studio-ink/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-studio-amber/70">
                    <FileText className="h-4 w-4 text-studio-ink" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/60">
                      Research report
                    </p>
                    <p className="text-[13px] font-bold text-studio-ink">AI agents in internships</p>
                  </div>
                </div>
              </div>

              <div className="min-h-[202px] text-[13px] leading-6">
                {typedLines.map((line, index) => {
                  if (!line) {
                    return <div key={`space-${index}`} className="h-3" />;
                  }

                  return (
                    <p
                      key={`${line}-${index}`}
                      className={
                        isHeading(line)
                          ? "mt-1.5 font-serif text-base font-semibold leading-7 text-studio-ink"
                          : "mt-1 text-studio-graphite/78"
                      }
                    >
                      {line}
                      {isTyping && index === typedLines.length - 1 ? (
                        <motion.span
                          className="ml-1 inline-block h-4 w-1 translate-y-0.5 rounded-full bg-studio-coral"
                          animate={{ opacity: [0.28, 1, 0.28] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ) : null}
                    </p>
                  );
                })}
              </div>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={citationsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="mt-2.5 flex flex-wrap gap-2"
              >
                {citations.map((citation, index) => (
                  <motion.span
                    key={citation}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                    animate={citationsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                    transition={{
                      duration: 0.22,
                      delay: shouldReduceMotion ? 0 : index * 0.1,
                      ease: "easeOut"
                    }}
                    className={`rounded-lg border border-studio-ink/10 px-2.5 py-1 text-[11px] font-bold text-studio-ink ${
                      index === 0
                        ? "bg-studio-sage/30"
                        : index === 1
                          ? "bg-studio-violet/30"
                          : "bg-studio-amber/35"
                    }`}
                  >
                    {citation}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <div className="mt-2.5 flex items-center justify-between gap-3 rounded-lg border border-studio-ink/10 bg-studio-cream/70 px-3 py-2 text-[11px] font-bold text-studio-graphite shadow-soft">
              <span>3 agents complete &middot; synthesis ready</span>
              <span className="h-2 w-2 rounded-full bg-studio-sage" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
