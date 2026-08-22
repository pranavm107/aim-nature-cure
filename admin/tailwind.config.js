/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))'
      },
      colors:{
        primary: {
          DEFAULT: '#0d9488', // Teal 600 - Calming healthcare primary
          light: '#ccfbf1',
          dark: '#0f766e'
        },
        secondary: {
          DEFAULT: '#64748b', // Slate 500
          light: '#f1f5f9',
          dark: '#334155'
        },
        background: '#f8fafc',
        surface: '#ffffff',
      }
    },
  },
  plugins: [],
}