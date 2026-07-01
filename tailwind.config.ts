import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary action — fresh mint/lime
        mint: {
          50: "#effdf4",
          100: "#d8fbe5",
          200: "#b2f5cd",
          300: "#74e9a8",
          400: "#36d57f",
          500: "#12bb62",
          600: "#079650",
          700: "#067642",
          800: "#085d37",
          900: "#074c2f",
        },
        // High-intensity / work — rose
        heat: {
          50: "#fff1f3",
          100: "#ffe0e6",
          200: "#ffc6d2",
          300: "#ff9db1",
          400: "#fb6587",
          500: "#f23a64",
          600: "#df1c4e",
          700: "#bb1241",
          800: "#9d133d",
          900: "#861439",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.12)",
      },
    },
  },
  plugins: [],
};
export default config;
