/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--sm-ink) / <alpha-value>)",
        paper: "rgb(var(--sm-paper) / <alpha-value>)",
        line: "rgb(var(--sm-line) / <alpha-value>)",
        violet: "rgb(var(--sm-primary) / <alpha-value>)",
        mint: "rgb(var(--sm-success) / <alpha-value>)",
        coral: "rgb(var(--sm-danger) / <alpha-value>)",
      },
      boxShadow: { soft: "var(--shadow-card)", float: "var(--shadow-modal)" },
      borderRadius: { "2xl": "var(--radius-lg)", xl: "var(--radius-md)" },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
