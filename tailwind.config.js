/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moovea: "#014644",
        "moovea-light": "#E8F5F5",
        "moovea-dark": "#003D3D",
        offwhite: "#fefcfb",
        accent: "#F4B942",
        "accent-dark": "#D49100",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'slide-up': 'slide-up 1s ease-out forwards',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
