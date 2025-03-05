/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ac-green": "#7FCE2E", // Animal Crossingの特徴的な緑色
        "ac-blue": "#88C9F9", // Animal Crossingの特徴的な青色
      },
    },
  },
  plugins: [],
};
