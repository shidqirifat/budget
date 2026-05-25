/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "450px",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        // Backgrounds
        "bg-primary": "var(--color-bg-primary)",
        "bg-white": "var(--color-bg-white)",
        "bg-lime": "var(--color-bg-lime)",
        // Text
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-income": "var(--color-text-income)",
        "text-expense": "var(--color-text-expense)",
        // Border
        "border-default": "var(--color-border-default)",
        "border-input": "var(--color-border-input)",
        // Surface
        "surface-card": "var(--color-surface-card)",
        "surface-error": "var(--color-surface-error)",
        // Accent
        "accent-amber": "var(--color-accent-amber)",
        // Surface extended
        "surface-lime": "var(--color-surface-lime)",
        // Dark surface
        dark: "var(--color-dark)",
      },
    },
  },
  plugins: [],
};
