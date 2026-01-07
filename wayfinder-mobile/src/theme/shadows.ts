/**
 * Wayfinder Mobile - Shadow System
 * 
 * Consistent shadow presets for elevation and depth.
 * Uses platform-specific shadow properties.
 */

import { Platform, ViewStyle } from 'react-native';

interface ShadowStyle {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
}

// Shadow presets
export const shadows = {
    /** No shadow */
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    } as ShadowStyle,

    /** Subtle shadow for cards */
    xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    } as ShadowStyle,

    /** Light shadow for interactive elements */
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    } as ShadowStyle,

    /** Medium shadow for cards */
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    } as ShadowStyle,

    /** Large shadow for modals and popovers */
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    } as ShadowStyle,

    /** Extra large shadow for floating elements */
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    } as ShadowStyle,

    /** Hero shadow with brand color */
    hero: {
        shadowColor: '#3b82f6', // primary[500]
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    } as ShadowStyle,

    /** Tab bar shadow */
    tabBar: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    } as ShadowStyle,

    /** Header shadow */
    header: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
    } as ShadowStyle,
};

/**
 * Helper function to apply shadow styles
 * Handles platform differences automatically
 */
export function applyShadow(shadowKey: keyof typeof shadows): ViewStyle {
    const shadow = shadows[shadowKey];

    if (Platform.OS === 'android') {
        // Android only uses elevation
        return {
            elevation: shadow.elevation,
        };
    }

    // iOS uses all shadow properties
    return {
        shadowColor: shadow.shadowColor,
        shadowOffset: shadow.shadowOffset,
        shadowOpacity: shadow.shadowOpacity,
        shadowRadius: shadow.shadowRadius,
    };
}

/**
 * Get shadow style for both platforms
 */
export function getShadowStyle(shadowKey: keyof typeof shadows): ViewStyle {
    const shadow = shadows[shadowKey];
    return {
        shadowColor: shadow.shadowColor,
        shadowOffset: shadow.shadowOffset,
        shadowOpacity: shadow.shadowOpacity,
        shadowRadius: shadow.shadowRadius,
        elevation: shadow.elevation,
    };
}

export type Shadows = typeof shadows;
export type ShadowKey = keyof typeof shadows;
