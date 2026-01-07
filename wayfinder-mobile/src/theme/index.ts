/**
 * Wayfinder Mobile - Theme System
 * 
 * Central export for all theme tokens and utilities.
 * Import from '@/theme' to access all design system values.
 */

// Export all theme modules
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';

// Import for combined theme object
import { colors, primary, neutral, success, warning, error, info, nodeTypes, nodeTypeBackgrounds, semantic } from './colors';
import { spacing, layout, borderRadius, iconSizes, componentSizes } from './spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, textStyles } from './typography';
import { shadows, applyShadow, getShadowStyle } from './shadows';

/**
 * Combined theme object for easy access to all design tokens
 */
export const theme = {
    colors: {
        primary,
        neutral,
        success,
        warning,
        error,
        info,
        nodeTypes,
        nodeTypeBackgrounds,
        ...semantic,
    },
    spacing,
    layout,
    borderRadius,
    iconSizes,
    componentSizes,
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    textStyles,
    shadows,
} as const;

// Utility exports
export { applyShadow, getShadowStyle };

// Type exports
export type Theme = typeof theme;

/**
 * Hook-style access to theme (can be extended with ThemeProvider later)
 */
export function useTheme() {
    return theme;
}

/**
 * Helper to create consistent card styles
 */
export function createCardStyle(options?: {
    shadow?: keyof typeof shadows;
    radius?: keyof typeof borderRadius;
    padding?: keyof typeof spacing;
}) {
    const {
        shadow = 'sm',
        radius = 'md',
        padding = 'md',
    } = options || {};

    return {
        backgroundColor: colors.backgroundCard,
        borderRadius: borderRadius[radius],
        padding: spacing[padding],
        ...getShadowStyle(shadow),
    };
}

/**
 * Helper to get node type colors
 */
export function getNodeTypeColor(nodeType: string): string {
    return nodeTypes[nodeType as keyof typeof nodeTypes] || nodeTypes.Unknown;
}

/**
 * Helper to get node type background color
 */
export function getNodeTypeBackground(nodeType: string): string {
    return nodeTypeBackgrounds[nodeType as keyof typeof nodeTypeBackgrounds] || nodeTypeBackgrounds.Unknown;
}
