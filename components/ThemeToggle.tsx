"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { type ThemeMode, useTheme } from "@/components/ThemeProvider";

const themeOptions: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Light mode",
    description: "Warm cream research studio",
    icon: Sun
  },
  {
    value: "dark",
    label: "Dark mode",
    description: "Graphite and espresso studio",
    icon: Moon
  },
  {
    value: "system",
    label: "System mode",
    description: "Follow device preference",
    icon: Monitor
  }
];

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { mounted, setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedTheme = mounted ? theme : "system";
  const currentOption =
    themeOptions.find((option) => option.value === selectedTheme) ??
    themeOptions[2];
  const CurrentIcon = currentOption.icon;
  const selectedIndex = Math.max(
    themeOptions.findIndex((option) => option.value === selectedTheme),
    0
  );
  const menuId = "theme-toggle-menu";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus();
    });
  }, [isOpen, selectedIndex]);

  function focusOption(index: number) {
    const normalizedIndex =
      (index + themeOptions.length) % themeOptions.length;
    optionRefs.current[normalizedIndex]?.focus();
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const currentIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement
    );
    const activeIndex = currentIndex >= 0 ? currentIndex : selectedIndex;

    if (event.key === "ArrowDown") {
      focusOption(activeIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      focusOption(activeIndex - 1);
      return;
    }

    focusOption(event.key === "Home" ? 0 : themeOptions.length - 1);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Choose color theme. Current theme: ${currentOption.label}`}
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className="studio-button inline-flex h-10 w-10 items-center justify-center gap-2 bg-studio-cream px-0 text-sm font-semibold text-studio-graphite sm:w-[11.75rem] sm:justify-between sm:px-3"
      >
        <CurrentIcon className="h-4 w-4 text-studio-coral" aria-hidden="true" />
        <span className="hidden sm:inline">{currentOption.label}</span>
        <ChevronDown
          className={`hidden h-4 w-4 transition sm:block ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Theme options"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-studio-ink/10 bg-studio-cream p-2 text-studio-graphite shadow-lift"
        >
          {themeOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedTheme === option.value;

            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-studio-clay focus:bg-studio-clay ${
                  isSelected
                    ? "bg-studio-clay ring-1 ring-studio-coral/30"
                    : ""
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-studio-clay">
                  <Icon className="h-4 w-4 text-studio-coral" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-studio-ink">
                    {option.label}
                  </span>
                  <span className="block text-xs font-medium leading-5 text-studio-graphite/70">
                    {option.description}
                  </span>
                </span>
                {isSelected ? (
                  <Check className="h-4 w-4 text-studio-sage" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
