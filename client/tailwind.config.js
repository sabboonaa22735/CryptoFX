/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#7c3aed',
        dark: {
          50: '#f7f7f8',
          100: '#eaeaea',
          200: '#c8c8cc',
          300: '#9e9ea6',
          400: '#75757f',
          500: '#5c5c66',
          600: '#4a4a52',
          700: '#3b3b41',
          800: '#2e2e33',
          900: '#1f1f23',
          950: '#0a0a0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 2s',
        'float-delayed-2': 'float 10s ease-in-out infinite 4s',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-shift': 'gradient 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'translateY(-15px) rotateX(5deg) rotateY(5deg)' },
          '50%': { transform: 'translateY(-25px) rotateX(0deg) rotateY(0deg)' },
          '75%': { transform: 'translateY(-10px) rotateX(-5deg) rotateY(-5deg)' },
        },
        glow: {
          '0%': { opacity: 0.3, transform: 'scale(1)' },
          '100%': { opacity: 0.6, transform: 'scale(1.1)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      perspective: {
        '1000': '1000px',
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
    },
  },
  plugins: [],
}
