"use client";

import { motion } from "framer-motion";
import { FileText, Quote, SearchCheck } from "lucide-react";

const cards = [
  {
    title: "Sub-question",
    text: "What evidence changed this year?",
    icon: SearchCheck,
    accent: "bg-studio-sage",
    className: "left-[2%] top-8 rotate-[-7deg]"
  },
  {
    title: "Citation",
    text: "[3] Market analysis with primary sources",
    icon: Quote,
    accent: "bg-studio-violet",
    className: "left-[34%] top-24 rotate-[4deg]"
  },
  {
    title: "Synthesis",
    text: "Key findings merged into one dossier",
    icon: FileText,
    accent: "bg-studio-coral",
    className: "right-[2%] top-2 rotate-[8deg]"
  }
];

export function FloatingCards() {
  return (
    <div className="relative min-h-[270px] w-full [perspective:900px]" aria-hidden="true">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            className={`absolute w-[230px] rounded-lg border border-studio-ink/10 bg-studio-cream/85 p-4 shadow-soft backdrop-blur ${card.className}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            animate={{ y: [0, index % 2 ? -8 : 8, 0] }}
            transition={{
              duration: 6 + index * 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={`mb-5 flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
              <Icon className="h-4 w-4 text-studio-ink" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-studio-graphite/65">
              {card.title}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-studio-ink">
              {card.text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
