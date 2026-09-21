/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#111111', 800: '#1C1C1E', 700: '#2C2C2E', 600: '#3A3A3C' },
        paper: '#F7F7F8',
        silver: {
          50: '#FAFAFB',
          100: '#F1F1F4',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#AEAEB2',
          500: '#8E8E93',
        },
        accent: {
          DEFAULT: '#6C2BD9',
          dark: '#5A21B8',
          soft: '#F3EDFD',
          ring: 'rgba(108,43,217,0.35)',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'IBM Plex Sans Arabic', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(17,17,17,0.12)',
        card: '0 4px 24px -8px rgba(17,17,17,0.08)',
        glow: '0 8px 30px -6px rgba(108,43,217,0.45)',
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
