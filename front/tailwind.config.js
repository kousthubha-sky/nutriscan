export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      
    },
  },
  plugins: [
    import('@tailwindcss/forms'),
    import('@tailwindcss/typography'),
    import('@tailwindcss/base'),
  ],
}