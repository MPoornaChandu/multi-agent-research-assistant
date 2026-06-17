"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clipboard } from "lucide-react";

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyButton({
  text,
  label = "Copy report",
  className = ""
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <button
      type="button"
      disabled={!text}
      onClick={async () => {
        if (!text) return;

        setCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => setCopied(false), 1800);

        try {
          await copyText(text);
        } catch {
          // Some embedded browsers block clipboard writes even after a user gesture.
        }
      }}
      className={`studio-button inline-flex h-10 items-center justify-center gap-2 bg-studio-ink px-3 text-sm font-semibold text-studio-cream disabled:cursor-not-allowed disabled:bg-studio-graphite/25 disabled:text-studio-graphite/50 ${className}`}
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Clipboard className="h-4 w-4" aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
