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
          paper: "#F7F1E8",
          cream: "#FFFDF8",
          clay: "#EFE7DA",
          ink: "#1F1F1F",
          graphite: "#3A342E",
          coral: "#FF7A59",
          violet: "#B68CFF",
          sage: "#9CAF88",
          amber: "#F5B84B"
        }
      },
      boxShadow: {
        soft: "0 24px 60px rgba(58, 52, 46, 0.12)",
        lift: "0 18px 34px rgba(58, 52, 46, 0.16)"
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
