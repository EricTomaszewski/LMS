/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tells Tailwind to scan these files for classes
  ],
  theme: {
    extend: {}, // You can customize Tailwind theme here if needed later
  },
  plugins: [],
}
