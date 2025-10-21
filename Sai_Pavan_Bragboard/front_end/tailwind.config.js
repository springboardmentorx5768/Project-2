/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css", // Scans your new CSS file
  ],
  theme: {
    extend: {
      // Your custom color palette
      colors: {
        'brand-violet': {
          light: '#8b5cf6',
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
        },
        'brand-cyan': {
          DEFAULT: '#06b6d4',
        },
      },
    },
  },
  plugins: [],
}