/**
 * Wayfinder Mobile - Color Palette
 * 
 * Complete color system following Material Design principles
 * with semantic naming and node type specific colors.
 */

// Primary color (Blue) with full shade range
export const primary = {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
} as const;

// Neutral colors (Gray scale)
export const neutral = {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
} as const;

// Success color (Green)
export const success = {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981',  // Main success color
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
} as const;

// Warning color (Amber)
export const warning = {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main warning color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
} as const;

// Error color (Red)
export const error = {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main error color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
} as const;

// Info color (Cyan)
export const info = {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',  // Main info color
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
} as const;

// Node type specific colors for visual differentiation
export const nodeTypes = {
    Room: '#3b82f6',           // Blue - general rooms
    Corridor: '#6b7280',       // Gray - walkways
    Elevator: '#10b981',       // Green - vertical transport
    Stairs: '#f59e0b',         // Amber - stairs
    Entrance: '#8b5cf6',       // Purple - entry points
    Restroom: '#ec4899',       // Pink - restrooms
    InformationDesk: '#06b6d4', // Cyan - info desks
    Unknown: '#9ca3af',        // Gray - unknown types
} as const;

// Node type background colors (lighter versions for cards/badges)
export const nodeTypeBackgrounds = {
    Room: '#eff6ff',
    Corridor: '#f3f4f6',
    Elevator: '#f0fdf4',
    Stairs: '#fffbeb',
    Entrance: '#f5f3ff',
    Restroom: '#fdf2f8',
    InformationDesk: '#ecfeff',
    Unknown: '#f9fafb',
} as const;

// Common semantic colors
export const semantic = {
    // Text colors
    textPrimary: neutral[900],
    textSecondary: neutral[600],
    textTertiary: neutral[400],
    textInverse: '#ffffff',

    // Background colors
    background: neutral[50],
    backgroundCard: '#ffffff',
    backgroundModal: '#ffffff',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',

    // Border colors
    border: neutral[200],
    borderLight: neutral[100],
    borderFocused: primary[500],

    // Interactive states
    pressed: 'rgba(0, 0, 0, 0.05)',
    disabled: neutral[300],

    // Status colors
    online: success[500],
    offline: neutral[400],
    active: primary[500],
    inactive: neutral[400],
} as const;

// Combined colors export
export const colors = {
    primary,
    neutral,
    success,
    warning,
    error,
    info,
    nodeTypes,
    nodeTypeBackgrounds,
    ...semantic,
} as const;

export type ColorPalette = typeof colors;
export type NodeTypeColor = keyof typeof nodeTypes;
