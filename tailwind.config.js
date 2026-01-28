/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        revpilot: {
          gold: '#f7db5a',
          orange: '#ffbd57',
          pink: '#e44e6f',
          navy: '#1a1a2e',
          'navy-light': '#16213e',
          'navy-dark': '#0f0f23',
        },
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(247, 219, 90, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(228, 78, 111, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
}
