/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        // "first-color": "#ECF6FF",
        // "hover-first-color": "#216ad9",
        // "head-color": "#234A6B",
        // "text-color": "#0086FF",
        // "p-color": "#757575",
        // "btn-color": "#0086FF",
        // "hover-btn-color": "#0f54bb",
        // "footer-color": "#13324F",
        // "hover-accent-color": "#e9d32c",
        // "hint-color": "#FD5E2B",
        // "hover-hint-link": "#c1c1c1",
      },
    },
  },
  plugins: [],
}