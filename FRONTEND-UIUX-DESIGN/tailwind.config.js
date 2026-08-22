/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#16324F',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#16324F',
          950: '#0F2338',
        },
        arogya: {
          teal: '#0D9488',
          emerald: '#10B981',
          darkTeal: '#0F766E',
          lightTeal: '#CCFBF1',
          cream: '#FAF8F5',
          sand: '#F5EFEB',
          error: '#B33A3A',
          charcoal: '#1E293B',
          mutedText: '#64748B',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(22, 50, 79, 0.08)',
        button: '0 4px 14px 0 rgba(22, 50, 79, 0.25)',
      },
    },
  },
  plugins: [],
};
