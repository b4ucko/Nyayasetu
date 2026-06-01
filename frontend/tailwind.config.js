/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        govblue: '#0F52BA',
        govorange: '#FF9933',
        govgreen: '#138808'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
