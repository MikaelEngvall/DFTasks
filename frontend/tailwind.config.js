/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Cinzel", "serif"],
    },
    extend: {
      colors: {
        df: {
          primary: "#1B365D", // Mörkblå från loggan
          secondary: "#4A90E2", // Ljusare blå accent
          light: "#F5F7FA", // Ljus bakgrund
          dark: "#1a1a1a", // Mörk bakgrund
          accent: "#E2B33F", // Guldaktig accent från loggan
        },
        primary: "#24ab8f",
        "primary-dark": "#268d77",
      },
      animation: {
        loader: "loader 1s linear infinite",
      },
      keyframes: {
        loader: {
          "0%": { transform: "rotate(0) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.5)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
      },
      backgroundColor: {
        light: "#F5F7FA",
        dark: "#1a1a1a",
      },
    },
  },
  plugins: [],
};
