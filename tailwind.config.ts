import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50:  "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
        },
        ink: {
          50:  "hsl(var(--ink-50))",
          100: "hsl(var(--ink-100))",
          200: "hsl(var(--ink-200))",
          300: "hsl(var(--ink-300))",
          400: "hsl(var(--ink-400))",
          500: "hsl(var(--ink-500))",
          600: "hsl(var(--ink-600))",
          700: "hsl(var(--ink-700))",
          800: "hsl(var(--ink-800))",
          900: "hsl(var(--ink-900))",
        },
        warm: {
          100: "hsl(var(--warm-100))",
          500: "hsl(var(--warm-500))",
          600: "hsl(var(--warm-600))",
        },
        risk: {
          low:  "hsl(var(--risk-low-500))",
          "low-bg":  "hsl(var(--risk-low-100))",
          "low-ink": "hsl(var(--risk-low-600))",
          med:  "hsl(var(--risk-med-500))",
          "med-bg":  "hsl(var(--risk-med-100))",
          "med-ink": "hsl(var(--risk-med-600))",
          high: "hsl(var(--risk-high-500))",
          "high-bg":  "hsl(var(--risk-high-100))",
          "high-ink": "hsl(var(--risk-high-600))",
        },
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        soft: "0 1px 2px hsl(215 18% 22% / 0.04), 0 4px 12px -6px hsl(215 18% 22% / 0.08)",
        lift: "0 6px 16px -4px hsl(215 18% 22% / 0.12), 0 2px 4px -2px hsl(215 18% 22% / 0.06)",
        pop:  "0 24px 48px -20px hsl(215 18% 22% / 0.2), 0 4px 12px -4px hsl(215 18% 22% / 0.08)",
        brand: "0 10px 24px -6px hsl(211 53% 55% / 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in-up":     "fade-in-up 0.35s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
