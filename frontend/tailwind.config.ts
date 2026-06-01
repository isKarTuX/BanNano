import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        health: {
          good: "#77b8a1",
          bad: "#d95c5c",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
        pixel: ["var(--font-pixel)"],
      },
      fontSize: {
        "pixel-xs": ["0.5rem", { lineHeight: "1.6" }],
        "pixel-sm": ["0.625rem", { lineHeight: "1.6" }],
        "pixel-base": ["0.75rem", { lineHeight: "1.6" }],
        "pixel-lg": ["1rem", { lineHeight: "1.6" }],
        "pixel-xl": ["1.25rem", { lineHeight: "1.6" }],
        "pixel-2xl": ["1.5rem", { lineHeight: "1.6" }],
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px var(--pixel-shadow-color)",
        "pixel-sm": "2px 2px 0px 0px var(--pixel-shadow-color)",
        "pixel-md": "4px 4px 0px 0px var(--pixel-shadow-color)",
        "pixel-lg": "6px 6px 0px 0px var(--pixel-shadow-color)",
        "pixel-inset": "inset 2px 2px 0px 0px rgba(0,0,0,0.1)",
      },
      keyframes: {
        "pixel-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "progress-stripes": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "16px 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pixel-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pixel-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "pixel-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      animation: {
        "pixel-pulse": "pixel-pulse 2s step-end infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "slide-up": "slide-up 300ms ease-out forwards",
        "scale-in": "scale-in 200ms ease-out forwards",
        blink: "blink 1s step-end infinite",
        "progress-stripes": "progress-stripes 800ms linear infinite",
        float: "float 3s ease-in-out infinite",
        "pixel-spin": "pixel-spin 1.5s steps(8) infinite",
        "pixel-bounce": "pixel-bounce 1s steps(4) infinite",
        "pixel-shake": "pixel-shake 0.5s steps(4) infinite",
        glitch: "glitch 0.3s steps(4) infinite",
        scanline: "scanline 4s linear infinite",
      },
      transitionTimingFunction: {
        "pixel": "steps(4)",
        "pixel-sm": "steps(2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
