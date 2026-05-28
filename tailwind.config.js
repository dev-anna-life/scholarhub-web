/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#008751",
        accent: "#FF9F1C",
        dark: "#1F2A1F",
        light: "#F8FAF7",
      },
    },
  },
  plugins: [],
};
