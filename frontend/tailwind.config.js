/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pastel blue–purple design tokens
        lav: {
          50: '#F7F5FF',
          100: '#EFEBFF',
          200: '#E2DCFF',
          300: '#CFC5FF',
          400: '#B8B5FF',
          500: '#9D8DF1',
          600: '#7E6BD9',
          700: '#6553B8',
          800: '#4D3F8F',
          900: '#2D2B55',
        },
        peri: {
          100: '#E8ECFB',
          200: '#D3DAF5',
          300: '#BCC7EC',
          400: '#A6B1E1',
          500: '#8B98D4',
          600: '#6F7EC0',
        },
        sky2: {
          100: '#EAF6FB',
          200: '#CDEAF4',
          300: '#A8D8EA',
          400: '#7FC3DE',
          500: '#57AACB',
        },
        // Warm accent — used sparingly for focal points (CTAs, featured, cursor)
        coral: {
          200: '#FFD9C7',
          300: '#FFC2A8',
          400: '#FF9E7A',
          500: '#FA7F55',
          600: '#EC6640',
        },
        ink: '#2D2B55',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '50%': { transform: 'translate(-25px, 25px) scale(0.94)' },
          '75%': { transform: 'translate(20px, 35px) scale(1.04)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(4%, -6%) rotate(8deg) scale(1.15)' },
          '66%': { transform: 'translate(-5%, 4%) rotate(-6deg) scale(0.95)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        blob: 'blob 16s ease-in-out infinite',
        'blob-slow': 'blob 22s ease-in-out infinite reverse',
        float: 'float 5s ease-in-out infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        aurora: 'aurora 24s ease-in-out infinite',
        'aurora-slow': 'aurora 34s ease-in-out infinite reverse',
        marquee: 'marquee 32s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        blink: 'blink 1s step-end infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(125, 107, 217, 0.25)',
        'soft-lg': '0 20px 60px -15px rgba(125, 107, 217, 0.35)',
        glow: '0 0 24px 2px rgba(184, 181, 255, 0.55)',
      },
    },
  },
  plugins: [],
};
