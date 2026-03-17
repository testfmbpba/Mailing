import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf0',
          100: '#dcfce8',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#67b960',
          600: '#4ea1ee',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          DEFAULT: '#4ea1ee',
          dark: '#2563eb',
        },
        brand: {
          green: '#67b960',
          blue: '#4ea1ee',
        }
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(103,185,96,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(103,185,96,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
export default config
