/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        goose: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 700: '#b45309' },
        dream: { 50: '#f3e8ff', 100: '#e9d5ff', 500: '#a855f7', 700: '#7e22ce' },
        pocket: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 700: '#15803d' }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        }
      }
    },
  },
  plugins: [],
}