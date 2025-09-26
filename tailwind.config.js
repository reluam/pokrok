/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e7',
          100: '#fde4c4',
          200: '#fbc98d',
          300: '#f9a855',
          400: '#f68b1d',
          500: '#E8871E',
          600: '#d16a0a',
          700: '#b04f08',
          800: '#8f3d0c',
          900: '#76320e',
        },
        background: '#FFFAF5',
        'text-primary': '#000000',
        'white-50': 'rgba(255, 255, 255, 0.5)',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
