/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Primary Brand Colors
                primary: {
                    50: "#EEF2FF",
                    100: "#E0E7FF",
                    200: "#C7D2FE",
                    300: "#A5B4FC",
                    400: "#818CF8",
                    500: "#6366F1", // Main primary
                    600: "#4F46E5",
                    700: "#4338CA",
                    800: "#3730A3",
                    900: "#312E81",
                    950: "#1E1B4B",
                },
                // Accent Colors
                accent: {
                    50: "#ECFDF5",
                    100: "#D1FAE5",
                    200: "#A7F3D0",
                    300: "#6EE7B7",
                    400: "#34D399",
                    500: "#10B981", // Main accent
                    600: "#059669",
                    700: "#047857",
                    800: "#065F46",
                    900: "#064E3B",
                },
                // Semantic Colors
                success: "#22C55E",
                warning: "#F59E0B",
                error: "#EF4444",
                info: "#3B82F6",
                // Background Colors
                background: {
                    primary: "#FFFFFF",
                    secondary: "#F8FAFC",
                    tertiary: "#F1F5F9",
                },
                // Dark Mode
                dark: {
                    background: "#0F172A",
                    surface: "#1E293B",
                    border: "#334155",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                heading: ["Inter", "system-ui", "sans-serif"],
            },
            spacing: {
                "safe-top": "env(safe-area-inset-top)",
                "safe-bottom": "env(safe-area-inset-bottom)",
                "safe-left": "env(safe-area-inset-left)",
                "safe-right": "env(safe-area-inset-right)",
            },
            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem",
            },
            boxShadow: {
                "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
                "card": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
            },
        },
    },
    plugins: [],
};
