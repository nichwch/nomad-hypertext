/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,svelte}"],
  theme: {
    extend: {
      colors: {
        crimsonHighlight: "rgb(153 27 27 / 0.4)",
      },
    },
  },
  plugins: [],
};
