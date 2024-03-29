/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#202020',
        outline: '#6E6E76',
        accent: '#F3B605'
      }
    }
  },
  plugins: []
}
