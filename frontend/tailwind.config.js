/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // TeraDeck theme colors
        teradeck: {
          backend: '#2196f3', // Blue
          frontend: '#ffc107', // Yellow
          mobile: '#f44336', // Red
          'data-science': '#4caf50', // Green
          multicolor: {
            start: '#2196f3',
            end: '#4caf50',
          },
        },
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#2196f3',
          600: '#1976d2',
          700: '#1565c0',
          900: '#0d47a1',
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        'bug-pulse': 'bug-pulse 1s ease-in-out infinite',
        'stabilized-glow': 'stabilized-glow 2s ease-in-out infinite',
        'card-flip': 'card-flip 0.6s ease-in-out',
        'card-slide-in': 'card-slide-in 0.4s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
        },
        'bug-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'stabilized-glow': {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.1)' },
        },
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        'card-slide-in': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 8px 20px rgba(0, 0, 0, 0.2)',
        'glow-blue': '0 0 10px rgba(33, 150, 243, 0.3)',
        'glow-red': '0 0 10px rgba(244, 67, 54, 0.3)',
        'glow-yellow': '0 0 15px rgba(255, 193, 7, 0.5)',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
