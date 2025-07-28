/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#10a37f',
          600: '#0d8f6f',
          700: '#0a7560',
        },
        dark: {
          50: '#ececf1',
          100: '#8e8ea0',
          200: '#565869',
          300: '#40414f',
          400: '#343541',
          500: '#212121',
          600: '#202123',
          700: '#171717',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}