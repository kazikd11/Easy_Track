/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: '#0D0D0D',
        secondary: '#260101',
        tertiary: '#400101',
        quaternary: '#73020C',
        quinary: '#A60311',
      }
    },
  },
  plugins: [],
}