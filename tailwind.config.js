/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#09090B', 800: '#18181B', 700: '#27272A', 600: '#3F3F46' },
        paper: '#F4F4F5',
        silver: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
        },
        accent: {
          DEFAULT: '#09090B',
          dark: '#000000',
          soft: '#F4F4F5',
          ring: 'rgba(9,9,11,0.25)',
        },
        flame: {
          DEFAULT: '#E11D48',
          dark: '#BE123C',
          soft: '#FFF1F2',
        },
        wa: '#25D366',
      },
      fontFamily: {
        sans: ['Tajawal', 'IBM Plex Sans Arabic', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(9,9,11,0.14)',
        card: '0 4px 24px -8px rgba(9,9,11,0.08)',
        glow: '0 8px 24px -8px rgba(9,9,11,0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease both',
        'slide-in': 'slide-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
        pop: 'pop 0.35s ease',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
