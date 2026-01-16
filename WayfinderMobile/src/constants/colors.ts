/**
 * Color Palette
 */
export const COLORS = {
    // Brand Colors
    primary: "#6366F1",
    primaryLight: "#818CF8",
    primaryDark: "#4F46E5",

    // Accent Colors
    accent: "#10B981",
    accentLight: "#34D399",
    accentDark: "#059669",

    // Semantic Colors
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Neutral Colors
    white: "#FFFFFF",
    black: "#000000",
    gray: {
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
    },

    // Background Colors
    background: {
        primary: "#FFFFFF",
        secondary: "#F8FAFC",
        tertiary: "#F1F5F9",
    },

    // Dark Mode Colors
    dark: {
        background: "#0F172A",
        surface: "#1E293B",
        border: "#334155",
        text: "#F1F5F9",
        textMuted: "#94A3B8",
    },

    // Map Colors
    map: {
        route: "#3B82F6",
        routeActive: "#6366F1",
        currentLocation: "#22C55E",
        destination: "#EF4444",
        node: "#6B7280",
        nodeHighlight: "#6366F1",
        edge: "#D1D5DB",
    },
} as const;

export type ColorKey = keyof typeof COLORS;
