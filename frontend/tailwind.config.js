/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pass: "#15803d",
        fail: "#b91c1c",
        unclear: "#b45309",
      },
    },
  },
  plugins: [],
};
