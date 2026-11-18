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
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        base: "var(--bg-base)",
        surface: {
          DEFAULT: "var(--bg-surface-1)",
          1: "var(--bg-surface-1)",
          2: "var(--bg-surface-2)",
          3: "var(--bg-surface-3)",
          50: "var(--bg-surface-2)",
          100: "var(--bg-surface-1)",
          200: "var(--bg-surface-2)",
          300: "var(--bg-base)",
        },
        border: {
          DEFAULT: "var(--border-subtle)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent-500)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          tint: "var(--accent-tint)",
        },
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)",
          info: "var(--status-info)",
        },
        aix: {
          blue: {
            DEFAULT: "#38BDF8",
            dark: "#0284C7",
            light: "#7DD3FC",
          },
          violet: {
            DEFAULT: "#A78BFA",
            dark: "#7C3AED",
            light: "#C4B5FD",
          },
          cyan: "#38BDF8",
          amber: "#F5A623",
          rose: "#F43F5E",
          emerald: "#34D399",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Consolas", "Courier New", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        e1: "var(--elevation-e1)",
        e2: "var(--elevation-e2)",
        e3: "var(--elevation-e3)",
      },
    },
  },
  plugins: [],
};

export default config;
