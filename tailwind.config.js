/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'battle-bg': '#1a1a2e',
        'battle-board': '#16213e',
        'debug-box': '#e94560',
        theme: {
          primary: 'var(--color-primary)',
          'primary-light': 'var(--color-primary-light)',
          'primary-dark': 'var(--color-primary-dark)',
          secondary: 'var(--color-secondary)',
          'secondary-light': 'var(--color-secondary-light)',
          accent: 'var(--color-accent)',
          'accent-light': 'var(--color-accent-light)',
          background: 'var(--color-background)',
          'background-light': 'var(--color-background-light)',
          'background-dark': 'var(--color-background-dark)',
          surface: 'var(--color-surface)',
          'surface-light': 'var(--color-surface-light)',
          'surface-dark': 'var(--color-surface-dark)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          'text-light': 'var(--color-text-light)',
          border: 'var(--color-border)',
          'border-light': 'var(--color-border-light)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
          info: 'var(--color-info)',
          gold: 'var(--color-gold)',
          'gold-light': 'var(--color-gold-light)',
          'gold-dark': 'var(--color-gold-dark)',
        },
      },
      backgroundImage: {
        'theme-primary': 'var(--gradient-primary)',
        'theme-secondary': 'var(--gradient-secondary)',
        'theme-accent': 'var(--gradient-accent)',
        'theme-surface': 'var(--gradient-surface)',
        'theme-card': 'var(--gradient-card)',
        'theme-hero': 'var(--gradient-hero)',
        'theme-enemy': 'var(--gradient-enemy)',
      },
      boxShadow: {
        'theme-primary': 'var(--shadow-primary)',
        'theme-glow': 'var(--shadow-glow)',
        'theme-card': 'var(--shadow-card)',
        'theme-elevated': 'var(--shadow-elevated)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: 'var(--shadow-primary)',
            opacity: '1',
          },
          '50%': { 
            boxShadow: 'var(--shadow-glow)',
            opacity: '0.9',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
