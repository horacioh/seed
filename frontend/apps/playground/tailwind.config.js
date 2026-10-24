/** @type {import('tailwindcss').Config} */
const themeColor = (name) => `color-mix(in oklab, var(--${name}) calc(<alpha-value> * 100%), transparent)`

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: themeColor('border'),
        input: themeColor('input'),
        ring: themeColor('ring'),
        background: themeColor('background'),
        foreground: themeColor('foreground'),
        primary: {DEFAULT: themeColor('primary'), foreground: themeColor('primary-foreground')},
        secondary: {DEFAULT: themeColor('secondary'), foreground: themeColor('secondary-foreground')},
        muted: {DEFAULT: themeColor('muted'), foreground: themeColor('muted-foreground')},
        accent: {DEFAULT: themeColor('accent'), foreground: themeColor('accent-foreground')},
        destructive: {DEFAULT: themeColor('destructive'), foreground: themeColor('destructive-foreground')},
        card: {DEFAULT: themeColor('card'), foreground: themeColor('card-foreground')},
        popover: {DEFAULT: themeColor('popover'), foreground: themeColor('popover-foreground')},
      },
    },
  },
  plugins: [],
}
