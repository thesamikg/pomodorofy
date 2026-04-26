/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "rgb(var(--brand-rgb) / <alpha-value>)",
        panel: "rgb(var(--panel-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        drift: "drift 18s linear infinite",
        grain: "grain 8s steps(10) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        drift: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.08)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -4%)" },
          "20%": { transform: "translate(-6%, 2%)" },
          "30%": { transform: "translate(4%, -2%)" },
          "40%": { transform: "translate(-4%, 6%)" },
          "50%": { transform: "translate(2%, -6%)" },
          "60%": { transform: "translate(6%, 0%)" },
          "70%": { transform: "translate(0%, 4%)" },
          "80%": { transform: "translate(-2%, -2%)" },
          "90%": { transform: "translate(4%, 2%)" },
        },
      },
    },
  },
  plugins: [],
};
