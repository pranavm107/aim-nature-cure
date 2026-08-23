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
      colors: {
        primary: {
          DEFAULT: '#2E7D32', // Healing Forest Deep Green
          light: '#81C784',   // Soft Green Accent
          dark: '#1B5E20'
        },
        semantic: {
          success: '#059669', // Emerald 600
          warning: '#D97706', // Amber 600
          error: '#DC2626',   // Red 600
          info: '#2563EB',    // Blue 600
        },
        background: '#F8FAFC', // Slate 50
        surface: '#FFFFFF',
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0', // Borders
          300: '#CBD5E1',
          400: '#94A3B8', // Text Disabled
          500: '#64748B',
          600: '#475569', // Text Secondary
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // Text Primary
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}