import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        terrain: {
          50: "#f1f6f4",
          100: "#dcebe5",
          200: "#b8d6cb",
          300: "#8fbcac",
          400: "#639e89",
          500: "#437f6e",
          600: "#316559",
          700: "#295148",
          800: "#23423c",
          900: "#1e3833",
        },
        clinical: {
          50: "#eef4fb",
          100: "#d7e6f4",
          200: "#b0cde9",
          300: "#82adda",
          400: "#5a8ec7",
          500: "#3c70ac",
          600: "#2d578a",
          700: "#26456e",
          800: "#213a5b",
          900: "#1d314c",
        },
        alert: {
          amber: "#b5720c",
          red: "#b3261e",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px 0 rgba(20, 30, 28, 0.06), 0 1px 6px -1px rgba(20, 30, 28, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
