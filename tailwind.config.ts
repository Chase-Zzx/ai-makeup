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
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#faf9f6',
          card: '#ffffff',
          muted: '#f4f3ef',
          dark: '#1a1a1a',
        },
        fg: {
          DEFAULT: '#1a1a1a',
          secondary: '#6b6b6b',
          muted: '#a1a1a1',
          inverse: '#faf9f6',
        },
        accent: {
          DEFAULT: '#b8908f',
          light: '#d4b5b4',
          dark: '#956b6a',
          bg: '#faf0ef',
        },
        border: {
          DEFAULT: 'rgba(0,0,0,0.08)',
          strong: 'rgba(0,0,0,0.15)',
        },
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
export default config;
