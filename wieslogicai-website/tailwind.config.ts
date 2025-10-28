import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Grant Cardone 10X Energy Colors
        primary: {
          DEFAULT: '#0A0E27',
          50: '#F0F1F5',
          100: '#E0E3EB',
          200: '#C1C7D7',
          300: '#A2ABC3',
          400: '#838FAF',
          500: '#64739B',
          600: '#455687',
          700: '#2E3B63',
          800: '#1A2340',
          900: '#0A0E27',
          950: '#050712',
        },
        electric: {
          DEFAULT: '#00F0FF',
          50: '#E5FEFF',
          100: '#CCFDFF',
          200: '#99FBFF',
          300: '#66F9FF',
          400: '#33F6FF',
          500: '#00F0FF',
          600: '#00C0CC',
          700: '#009099',
          800: '#006066',
          900: '#003033',
        },
        neon: {
          DEFAULT: '#FF0080',
          50: '#FFE5F2',
          100: '#FFCCE5',
          200: '#FF99CC',
          300: '#FF66B2',
          400: '#FF3399',
          500: '#FF0080',
          600: '#CC0066',
          700: '#99004D',
          800: '#660033',
          900: '#33001A',
        },
        gold: {
          DEFAULT: '#FFD700',
          50: '#FFFDF0',
          100: '#FFF9D6',
          200: '#FFF3AD',
          300: '#FFED85',
          400: '#FFE75C',
          500: '#FFD700',
          600: '#CCAC00',
          700: '#998100',
          800: '#665600',
          900: '#332B00',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.6), 0 0 80px rgba(0, 240, 255, 0.3)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow': {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.5)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300F0FF' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
