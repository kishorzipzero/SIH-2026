/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
      },
      colors: {
        pass: "#15803d",
        fail: "#b91c1c",
        unclear: "#b45309",
        brand: {
          50: "#f2f4ff",
          100: "#e5e9ff",
          200: "#c7cffe",
          300: "#a3aefc",
          400: "#7c85f7",
          500: "#5b5cee",
          600: "#4640d6",
          700: "#3830ab",
          800: "#2c2986",
          900: "#201f5e",
          950: "#141338",
        },
        ink: {
          50: "#f6f7fb",
          100: "#eceef5",
          400: "#7c8399",
          600: "#4b5165",
          800: "#242838",
          900: "#141621",
          950: "#0b0c14",
        },
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgb(20 19 56 / 0.12)",
        glow: "0 0 0 1px rgb(91 92 238 / 0.15), 0 8px 30px -8px rgb(91 92 238 / 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5b5cee 0%, #4640d6 45%, #201f5e 100%)",
        "mesh": "radial-gradient(at 20% 20%, rgba(124,133,247,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(91,92,238,0.2) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(44,41,134,0.2) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
