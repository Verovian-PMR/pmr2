import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E8EEF9", 100: "#C5D3F0", 200: "#9FB5E6", 300: "#7997DB",
          400: "#5C81D4", 500: "#0F52BA", 600: "#0D49A7", 700: "#0A3D91",
          800: "#08327B", 900: "#041F55",
        },
        secondary: {
          50: "#E3F2FD", 100: "#BBDEFB", 200: "#90CAF9", 300: "#64B5F6",
          400: "#42A5F5", 500: "#1E88E5", 600: "#1976D2", 700: "#1565C0",
          800: "#0D47A1", 900: "#0A3272",
        },
        success: { light: "#E8F5E9", main: "#2E7D32", dark: "#1B5E20" },
        warning: { light: "#FFF3E0", main: "#E65100", dark: "#BF360C" },
        error: { light: "#FFEBEE", main: "#C62828", dark: "#B71C1C" },
        neutral: {
          0: "#FFFFFF", 50: "#FAFAFA", 100: "#F5F5F5", 200: "#EEEEEE",
          300: "#E0E0E0", 400: "#BDBDBD", 500: "#9E9E9E", 600: "#757575",
          700: "#616161", 800: "#424242", 900: "#212121",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
