"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileSearch, GitBranch, Search, Sparkles } from "lucide-react";

const nodes = [
  { label: "Supervisor", icon: GitBranch, className: "left-[18%] top-[8%]", tone: "bg-studio-amber" },
  { label: "Search A", icon: Search, className: "left-[3%] top-[42%]", tone: "bg-studio-sage" },
  { label: "Search B", icon: Search, className: "left-[38%] top-[50%]", tone: "bg-studio-violet" },
  { label: "Search C", icon: Search, className: "right-[4%] top-[38%]", tone: "bg-studio-coral" },
  { label: "Dossier", icon: FileSearch, className: "left-[46%] bottom-[6%]", tone: "bg-studio-ink text-studio-cream" }
];

export function ResearchOrb() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none relative h-[360px] w-full max-w-[620px] [perspective:1200px] sm:h-[440px]">
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-[11%] top-[18%] h-[62%] rounded-lg border border-studio-ink/10 bg-studio-cream/55 shadow-soft"
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { y: [0, -8, 0], rotateX: [58, 56, 58], rotateZ: [-9, -7, -9] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.2 }
            : { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transform: "rotateX(58deg) rotateZ(-9deg)", transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-5 rounded-lg border border-studio-ink/10 bg-[linear-gradient(135deg,rgba(255,122,89,.18),rgba(182,140,255,.16),rgba(156,175,136,.18))]" />
        <div className="absolute left-[18%] top-[18%] h-px w-[58%] bg-studio-ink/20" />
        <div className="absolute left-[16%] top-[46%] h-px w-[68%] bg-studio-ink/15" />
        <div className="absolute left-[23%] top-[20%] h-[52%] w-px bg-studio-ink/15" />
        <div className="absolute right-[21%] top-[22%] h-[50%] w-px bg-studio-ink/15" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute left-[22%] top-[28%] h-48 w-48 rounded-lg border border-studio-ink/10 bg-studio-cream/80 shadow-soft"
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { y: [0, 10, 0], rotate: [-9, -5, -9] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.2 }
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transform: "rotateX(58deg) rotateZ(-10deg)", transformStyle: "preserve-3d" }}
      >
        <div className="absolute -right-4 top-4 h-full w-full rounded-lg border border-studio-ink/10 bg-studio-clay" />
        <div className="absolute -right-8 top-8 h-full w-full rounded-lg border border-studio-ink/10 bg-studio-cream/80" />
        <div className="relative h-full rounded-lg bg-studio-cream p-5">
          <Sparkles className="h-5 w-5 text-studio-coral" aria-hidden="true" />
          <div className="mt-8 h-2 w-24 rounded-lg bg-studio-ink/20" />
          <div className="mt-3 h-2 w-32 rounded-lg bg-studio-ink/10" />
          <div className="mt-3 h-2 w-20 rounded-lg bg-studio-amber/70" />
        </div>
      </motion.div>

      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.label}
            aria-hidden="true"
            className={`absolute ${node.className} flex min-w-28 items-center gap-2 rounded-lg border border-studio-ink/10 bg-studio-cream/90 px-3 py-2 text-xs font-bold text-studio-ink shadow-soft backdrop-blur`}
            animate={shouldReduceMotion ? { y: 0 } : { y: [0, index % 2 ? 8 : -8, 0] }}
            transition={
              shouldReduceMotion
                ? { duration: 0.2 }
                : {
                    duration: 5.5 + index * 0.35,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
            }
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${node.tone}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            {node.label}
          </motion.div>
        );
      })}
    </div>
  );
}
