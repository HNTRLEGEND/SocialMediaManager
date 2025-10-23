import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './ui/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        background: '#F4F6F8',
        foreground: '#0A192F',
        accent: {
          DEFAULT: '#FF8A00',
          foreground: '#0A192F'
        },
        primary: {
          DEFAULT: '#00D8FF',
          foreground: '#0A192F'
        },
        navy: '#0A192F'
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-poppins)', ...fontFamily.sans]
      },
      boxShadow: {
        glow: '0 0 40px rgba(0, 216, 255, 0.3)',
        card: '0 20px 45px -20px rgba(10, 25, 47, 0.8)'
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at center, rgba(0,216,255,0.12) 0, rgba(10,25,47,0) 55%)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
