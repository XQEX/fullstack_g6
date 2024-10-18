import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "world-end": "url('/img/logo.jpg')",
      },

      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
      colors: {
        rich_black: {
          DEFAULT: "#01161e",
          100: "#000406",
          200: "#00090c",
          300: "#010d12",
          400: "#011118",
          500: "#01161e",
          600: "#04597b",
          700: "#079cd8",
          800: "#45c6f9",
          900: "#a2e3fc",
        },
        midnight_green: {
          DEFAULT: "#124559",
          100: "#040e12",
          200: "#071c24",
          300: "#0b2935",
          400: "#0f3747",
          500: "#124559",
          600: "#20799c",
          700: "#36a9d6",
          800: "#79c5e4",
          900: "#bce2f1",
        },
        air_force_blue: {
          DEFAULT: "#598392",
          100: "#121a1d",
          200: "#24343a",
          300: "#354e57",
          400: "#476874",
          500: "#598392",
          600: "#769dab",
          700: "#99b6c0",
          800: "#bbced5",
          900: "#dde7ea",
        },
        ash_gray: {
          DEFAULT: "#aec3b0",
          100: "#1f2a20",
          200: "#3e5441",
          300: "#5e7f61",
          400: "#83a386",
          500: "#aec3b0",
          600: "#bdcebf",
          700: "#cedbcf",
          800: "#dee7df",
          900: "#eff3ef",
        },
        beige: {
          DEFAULT: "#eff6e0",
          100: "#384915",
          200: "#71912a",
          300: "#a4cc4e",
          400: "#c9e197",
          500: "#eff6e0",
          600: "#f2f8e6",
          700: "#f5f9ec",
          800: "#f8fbf2",
          900: "#fcfdf9",
        },

        palette1: "#ffa8bd",
        palette2: "#c889c2",
        palette3: "#9269c6",
        palette4: "#5b4acb",
        palette5: "#5256cc",
        // title suggest
        Vbackground: "#a5e9fc",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
