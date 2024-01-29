/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        rotateCircle: {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(360deg)" },
        },
      },
      animation: {
        rotateCircle: "rotateCircle 1s linear",
      },
    },
    screens: {
      phone: "823px",
      tablet2: "899px",
      tablet: "981px",
      laptop: "1140px",
      desktop: "1322px",
    },
  },
  plugins: [],
};
