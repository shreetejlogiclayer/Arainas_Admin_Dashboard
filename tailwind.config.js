/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "araina-pink": "#ef5f7d",
        "araina-blue": "#6cadba",
        "araina-white": "#ffffff",
        "araina-black": "#17151a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        brand: ["Unbounded", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
