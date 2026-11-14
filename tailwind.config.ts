import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090c",
        foreground: "#f0f3f8",
        card: {
          DEFAULT: "#0f1117",
          foreground: "#f0f3f8",
        },
        surface: {
          50: "#181b24",
          100: "#13151c",
          200: "#0f1117",
          300: "#0a0c10",
        },
        border: "#1f2430",
        aix: {
          blue: {
            DEFAULT: "#00d2ff",
            dark: "#0095b6",
            light: "#66e3ff",
            glow: "rgba(0, 210, 255, 0.15)",
          },
          violet: {
            DEFAULT: "#8a2be2",
            dark: "#681dae",
            light: "#b169f5",
            glow: "rgba(138, 43, 226, 0.15)",
          },
          cyan: "#00f5d4",
          amber: "#f59e0b",
          rose: "#f43f5e",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Consolas", "Courier New", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px -5px rgba(0, 210, 255, 0.3)",
        "glow-violet": "0 0 20px -5px rgba(138, 43, 226, 0.3)",
        "terminal": "0 4px 20px 0 rgba(0, 0, 0, 0.75)",
      },
    },
  },
  plugins: [],
};

export default config;
