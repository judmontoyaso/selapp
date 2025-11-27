import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Colores del logo Selapp
        selapp: {
          brown: "#4A403A",      // Darker, richer coffee (Primary Text/Bg)
          "brown-dark": "#2C2420", // Almost black brown
          "brown-light": "#8C7E74", // Muted taupe
          beige: "#F9F7F2",      // Alabaster (Main Bg)
          "beige-dark": "#EBE5DA", // Darker beige for borders
          cream: "#FFFFFF",      // White (Card Bg)
          accent: "#C5A880",     // Muted Gold (Buttons/Highlights)
          "accent-light": "#E5D4BC", // Light gold
          success: "#8B9D77",    // Sage Green
        },
      },
    },
  },
  plugins: [],
};
export default config;
