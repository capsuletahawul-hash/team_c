/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
  capsule: {
    navy: "#164961",
    teal: "#387B84",
    gold: "#FFD369",
    darkGold: "#D19E22",
    background: "#F0F5F9",
    border: "#C9D6DF",
    footer: "#7FB1BC", // اللون الرئيسي
  },
},

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      borderRadius: {
        card: "20px",
        button: "12px",
      },

      boxShadow: {
        card: "0 8px 25px rgba(0,0,0,0.08)",
        hover: "0 15px 35px rgba(0,0,0,0.15)",
      },

      backgroundImage: {
        "capsule-gradient":
          "linear-gradient(to right, #2B5F6F, #1E4C5A, #12343F)",
      },
    },
  },

  plugins: [],
};
