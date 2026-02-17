import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./messages/**/*.json"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#102C26",
          secondary: "#F7E7CE",
          accent: "#245d4f"
        }
      },
      borderRadius: {
        "2xl": "1.25rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(16, 44, 38, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
