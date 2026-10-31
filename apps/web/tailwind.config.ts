import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#1d4ed8', 700: '#1e40af' },
      },
    },
  },
  plugins: [],
};
export default config;
