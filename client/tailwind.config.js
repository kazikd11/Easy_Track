/** @type {{primary: string, secondary: string, tertiary: string, quaternary: string, quinary: string}|{readonly default?: {primary: string, secondary: string, tertiary: string, quaternary: string, quinary: string}}} */

const COLORS = require("./utils/colors");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
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
      },
      textColor:{
        DEFAULT: COLORS.cwhite
      }
    },
  },
  plugins: [],
}