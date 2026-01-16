/**
 * App Configuration
 */
export const APP_CONFIG = {
    name: "Wayfinder",
    version: "1.0.0",

    // Navigation Settings
    navigation: {
        defaultWalkingSpeed: 1.4, // meters per second (average walking speed)
        stepAnnouncementThreshold: 5, // meters before announcing next step
        recalculationThreshold: 10, // meters off route before recalculation
    },

    // Map Settings
    map: {
        defaultZoom: 1,
        minZoom: 0.5,
        maxZoom: 3,
        nodeMarkerSize: 12,
        routeLineWidth: 4,
        animationDuration: 300,
    },

    // Cache Settings (for React Query)
    cache: {
        buildingsStaleTime: 5 * 60 * 1000, // 5 minutes
        floorsStaleTime: 5 * 60 * 1000, // 5 minutes
        nodesStaleTime: 2 * 60 * 1000, // 2 minutes
        routeStaleTime: 0, // Always fresh
    },

    // Feature Flags
    features: {
        enableAccessibilityMode: true,
        enableVoiceNavigation: false,
        enableOfflineMode: false,
        enableDarkMode: true,
    },
} as const;

/**
 * Languages
 */
export const SUPPORTED_LANGUAGES = ["tr", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Theme
 */
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
