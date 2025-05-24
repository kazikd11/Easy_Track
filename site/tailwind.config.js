import {COLORS} from "./src/utils/colors.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors:{
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        tertiary: COLORS.tertiary,
        quaternary: COLORS.quaternary,
        quinary: COLORS.quinary,
        cwhite: COLORS.cwhite,
        cblack: COLORS.cblack,
        cgray: COLORS.cgray,
        transparentRed: COLORS.transparentRed,
      },
    },
  },
  plugins: [],
}