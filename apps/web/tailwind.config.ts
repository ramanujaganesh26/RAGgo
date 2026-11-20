import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222 47% 11%)",
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(215 16% 47%)",
        },
        primary: {
          DEFAULT: "hsl(221 83% 53%)",
          foreground: "hsl(210 40% 98%)",
          hover: "hsl(221 83% 45%)",
        },
        surface: {
          DEFAULT: "hsl(0 0% 100%)",
          subtle: "hsl(210 40% 98%)",
        },
        status: {
          pending: "hsl(215 16% 47%)",
          progress: "hsl(221 83% 53%)",
          success: "hsl(142 71% 45%)",
          warning: "hsl(38 92% 50%)",
          error: "hsl(0 84% 60%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
