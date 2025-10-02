/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg1: "#0b0f19",
        bg2: "#0a0f1d",
        card1: "#11182b",
        card2: "#0f1526",
        accent: "#7c5cff",
        accent2: "#57d6b3"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.25)"
      }
    }
  },
  plugins: []
};
