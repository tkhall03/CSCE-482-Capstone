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
        'aggie-maroon': '#500000',
        'fadded-aggie-maroon': '#50000066',
        'ut-orange': '#bf5700',
      },
    },
  },
  plugins: [],
};
export default config;
