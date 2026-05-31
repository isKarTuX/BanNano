import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(215 28% 17%)",
        input: "hsl(215 28% 17%)",
        ring: "hsl(142 71% 45%)",
        background: "hsl(222 47% 6%)",
        foreground: "hsl(210 40% 98%)",
        primary: {
          DEFAULT: "hsl(142 71% 45%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(215 28% 17%)",
          foreground: "hsl(210 40% 98%)",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(215 28% 17%)",
          foreground: "hsl(215 20% 65%)",
        },
        accent: {
          DEFAULT: "hsl(215 28% 17%)",
          foreground: "hsl(210 40% 98%)",
        },
        card: {
          DEFAULT: "hsl(222 47% 11%)",
          foreground: "hsl(210 40% 98%)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(34, 197, 94, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config
