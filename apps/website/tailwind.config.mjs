import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#07080D',
          900: '#0D071E',
          850: '#160A3E',
          800: '#210C5F',
          700: '#32118A',
          600: '#4A18B7',
          500: '#616062',
          400: '#79787B',
          300: '#A2A1A4',
          200: '#C5C4C7',
          100: '#E4E3E5',
          50: '#F7F5FA',
        },
        accent: {
          950: '#160540',
          900: '#210C5F',
          800: '#37108D',
          700: '#4B17B7',
          600: '#601FE8',
          500: '#7434EC',
          400: '#9E5EF6',
          300: '#B77BF6',
          200: '#C696F5',
          100: '#DDC2FA',
          50: '#F1E7FD',
        },
        warm: {
          500: '#d4a853',
          400: '#e0bc6a',
          300: '#ecd08a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '9xl': ['8rem', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'tv-scan': 'tvScan 3s linear infinite',
        'tv-flicker': 'tvFlicker 0.15s infinite',
        'tv-glow': 'tvGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        tvScan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        tvFlicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.95' },
          '10%': { opacity: '0.98' },
          '15%': { opacity: '0.94' },
          '20%': { opacity: '0.98' },
          '50%': { opacity: '0.96' },
          '80%': { opacity: '0.98' },
          '90%': { opacity: '0.95' },
          '100%': { opacity: '0.98' },
        },
        tvGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(96, 31, 232, 0.3), 0 0 60px rgba(96, 31, 232, 0.1), inset 0 0 30px rgba(96, 31, 232, 0.05)' },
          '50%': { boxShadow: '0 0 40px rgba(158, 94, 246, 0.4), 0 0 80px rgba(158, 94, 246, 0.15), inset 0 0 40px rgba(198, 150, 245, 0.08)' },
        },
      },
    },
  },
  plugins: [typography],
};
