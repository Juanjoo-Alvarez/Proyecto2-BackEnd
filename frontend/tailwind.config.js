/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azulPalido: "#EFFAFD",   // Fondo claro
        azulReal: "#4A8BDF",     // Color primario
        berenjena: "#A0006D",    // Acento
      },
    },
  },
  plugins: [],
};
