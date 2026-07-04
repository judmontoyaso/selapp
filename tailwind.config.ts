import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Lora", "Georgia", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Colores del logo Selapp
        selapp: {
          brown: "#6B4E3D",
          "brown-dark": "#4A3429",
          "brown-light": "#8B6F5C",
          beige: "#FAF5EB",
          "beige-dark": "#F0E6D7",
          cream: "#FFF9F0",
          accent: "#D4A574",
        },
      },
    },
  },
  plugins: [],
};
export default config;
