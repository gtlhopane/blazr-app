import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#ffffff",
        gold: {
          DEFAULT: "#FAD03F",
          dark: "#c9a82e",
        },
        surface: {
          DEFAULT: "#111111",
          raised: "#1a1a1a",
        },
        border: "#2a2a2a",
        muted: {
          DEFAULT: "#111111",
          foreground: "#666666",
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
