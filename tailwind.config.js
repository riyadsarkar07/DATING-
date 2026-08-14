/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05050A',
          900: '#0A0A14',
          800: '#12121F',
          700: '#1A1A2E',
          600: '#24243A',
        },
        violet: {
          50: '#F3EEFF',
          100: '#E5DBFF',
          200: '#CDB8FF',
          300: '#B392FF',
          400: '#9D6FFF',
          500: '#8A4FFF',
          600: '#7C4DFF',
          700: '#6A35E8',
          800: '#5325C4',
          900: '#3D1A96',
        },
        blush: {
          50: '#FFF0F7',
          100: '#FFDCF0',
          200: '#FFB9E2',
          300: '#FF8FD0',
          400: '#FF63BB',
          500: '#FF3EA5',
          600: '#F12593',
          700: '#D1107C',
        },
        aqua: {
          50: '#EBFAFF',
          100: '#CDF3FF',
          200: '#9FE7FF',
          300: '#66DAFF',
          400: '#38CFFC',
          500: '#00D1FF',
          600: '#00AEEB',
        },
        gold: {
          400: '#FFD76A',
          500: '#FFC53D',
          600: '#F5A623',
        },
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Poppins_400Regular'],
        medium: ['Poppins_500Medium'],
        semibold: ['Poppins_600SemiBold'],
        bold: ['Poppins_700Bold'],
        extrabold: ['Poppins_800ExtraBold'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'glow-violet': '0 0 30px rgba(124, 77, 255, 0.35)',
        'glow-blush': '0 0 30px rgba(255, 62, 165, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
