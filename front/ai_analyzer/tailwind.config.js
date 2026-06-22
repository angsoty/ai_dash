/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        binance: "#0b0e11",
        panel: "#161a1e",
        card: "#1e2329",
        border: "#2b3139",
        greenTrade: "#0ecb81",
        redTrade: "#f6465d",
      },
    },
  },
  plugins: [],
};