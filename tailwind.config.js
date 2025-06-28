/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pink palette
        'soft-pink': '#FFB6C1',
        'pink': '#FFC0CB',
        'light-pink': '#FFE4E1',
        'rose-gold': '#E8B4B8',
        'blush': '#F8BBD9',
        'dusty-rose': '#DCAE96',
        // Additional shades for gradients
        'pink-50': '#fdf2f8',
        'pink-100': '#fce7f3',
        'pink-200': '#fbcfe8',
        'pink-300': '#f9a8d4',
        'pink-400': '#f472b6',
        'pink-500': '#ec4899',
        'pink-600': '#db2777',
        'pink-700': '#be185d',
        'pink-800': '#9d174d',
        'pink-900': '#831843',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'ui': ['Orbitron', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'kawaii': '8px',
        'kawaii-lg': '12px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'kawaii': '0 8px 16px -4px rgba(236, 72, 153, 0.15), 0 4px 8px -2px rgba(236, 72, 153, 0.1)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'drift': 'drift 20s linear infinite',
        'drift-slow': 'drift 30s linear infinite',
        'sparkle': 'sparkle 1s ease-in-out',
        'heart-float': 'heartFloat 2s ease-out forwards',
        'heart-drift': 'heartDrift 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        drift: {
          '0%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(calc(100vw + 100px))' },
        },
        sparkle: {
          '0%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
          '100%': { opacity: '0', transform: 'scale(0) rotate(360deg)' },
        },
        heartFloat: {
          '0%': { opacity: '1', transform: 'translateY(0px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(1.2)' },
        },
        heartDrift: {
          '0%': { transform: 'translateX(-50px) translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateX(calc(25vw)) translateY(-20px) rotate(90deg)' },
          '50%': { transform: 'translateX(calc(50vw)) translateY(10px) rotate(180deg)' },
          '75%': { transform: 'translateX(calc(75vw)) translateY(-15px) rotate(270deg)' },
          '100%': { transform: 'translateX(calc(100vw + 50px)) translateY(0px) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
