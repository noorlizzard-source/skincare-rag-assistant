/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F6',
          100: '#E3EBE8',
          500: '#2A5C52',
          800: '#1B3B36',
          900: '#122925',
        },
        rose: {
          50: '#FDF8F5',
          100: '#F7EBE5',
          200: '#EED6CC',
          500: '#C88D7B',
        },
        amber: {
          500: '#D99B6A',
          600: '#C28453',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
