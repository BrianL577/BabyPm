import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F4F5F7",
        "paper-raised": "#FFFFFF",
        ink: "#1A2233",
        "ink-soft": "#4A5468",
        line: "#D7DBE3",
        accent: "#3A4DE0",
        "accent-soft": "#E8E9FB",
        rag: {
          green: "#2F7A4D",
          "green-bg": "#E5F3EA",
          amber: "#B5780A",
          "amber-bg": "#FBF0DC",
          red: "#B03A2E",
          "red-bg": "#FBE7E4",
        },
      },
      fontFamily: {
        display: ["Iowan Old Style", "Palatino Linotype", "Georgia", "ui-serif", "serif"],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
