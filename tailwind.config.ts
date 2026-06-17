import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./agents/**/*.{js,ts,jsx,tsx,mdx}",
    "./tools/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          paper: "rgb(var(--studio-paper) / <alpha-value>)",
          cream: "rgb(var(--studio-cream) / <alpha-value>)",
          clay: "rgb(var(--studio-clay) / <alpha-value>)",
          ink: "rgb(var(--studio-ink) / <alpha-value>)",
          graphite: "rgb(var(--studio-graphite) / <alpha-value>)",
          coral: "rgb(var(--studio-coral) / <alpha-value>)",
          violet: "rgb(var(--studio-violet) / <alpha-value>)",
          sage: "rgb(var(--studio-sage) / <alpha-value>)",
          amber: "rgb(var(--studio-amber) / <alpha-value>)"
        }
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"]
      }
    }
  },
  plugins: []
};

export default config;
