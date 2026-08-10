// tailwind.config.js
module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        // "font-sans" → Plus Jakarta Sans with system fallbacks
        sans: [
          '"Plus Jakarta Sans"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      colors: {
        background: '#050814',
        secondary: '#080D1A',
        card: '#0D1424',
        elevated: '#111A2C',
        border: 'rgba(148,163,184,0.14)',
        primary: {
          DEFAULT: '#8B5CF6',
          bright: '#A855F7',
        },
        accent: '#38BDF8',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: {
          DEFAULT: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        }
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};
