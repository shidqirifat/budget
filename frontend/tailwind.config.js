/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: "450px",
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        lime: { DEFAULT: '#D1FF19' },
        dark: { DEFAULT: '#141414' },
        green: { tx: '#2A9D5C' },
        red: { tx: '#E05C5C' },
        bg: { DEFAULT: '#F5F5F2' },
        border: { DEFAULT: '#EEEEE8' },
      },
    },
  },
  plugins: [],
};
