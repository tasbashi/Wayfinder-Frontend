/**
 * Wayfinder Mobile - Spacing System
 * 
 * Consistent spacing scale based on 4px base unit.
 * Use these values for margins, padding, and gaps.
 */

// Base spacing unit (4px)
const BASE_UNIT = 4;

// Spacing scale
export const spacing = {
    /** 0px */
    none: 0,
    /** 2px - Hairline spacing */
    hairline: BASE_UNIT * 0.5,
    /** 4px - Extra small */
    xs: BASE_UNIT,
    /** 8px - Small */
    sm: BASE_UNIT * 2,
    /** 12px - Medium small */
    ms: BASE_UNIT * 3,
    /** 16px - Medium (default) */
    md: BASE_UNIT * 4,
    /** 20px - Medium large */
    ml: BASE_UNIT * 5,
    /** 24px - Large */
    lg: BASE_UNIT * 6,
    /** 32px - Extra large */
    xl: BASE_UNIT * 8,
    /** 40px - 2x Extra large */
    xxl: BASE_UNIT * 10,
    /** 48px - 3x Extra large */
    xxxl: BASE_UNIT * 12,
    /** 64px - Huge */
    huge: BASE_UNIT * 16,
} as const;

// Layout-specific spacing
export const layout = {
    /** Screen horizontal padding */
    screenPaddingHorizontal: spacing.md,
    /** Screen vertical padding */
    screenPaddingVertical: spacing.md,
    /** Card internal padding */
    cardPadding: spacing.md,
    /** Section gap between major sections */
    sectionGap: spacing.lg,
    /** Item gap in lists */
    listItemGap: spacing.sm,
    /** Icon margin from text */
    iconGap: spacing.sm,
    /** Safe area top (will be overridden by SafeAreaView) */
    safeAreaTop: 60,
    /** Tab bar height */
    tabBarHeight: 65,
    /** Header height */
    headerHeight: 56,
} as const;

// Border radius presets
export const borderRadius = {
    /** 0px */
    none: 0,
    /** 4px - Small elements */
    xs: 4,
    /** 8px - Buttons, inputs */
    sm: 8,
    /** 12px - Cards, modals */
    md: 12,
    /** 16px - Large cards */
    lg: 16,
    /** 20px - Hero elements */
    xl: 20,
    /** 24px - Rounded elements */
    xxl: 24,
    /** 9999px - Fully rounded (pills, circles) */
    full: 9999,
} as const;

// Icon sizes
export const iconSizes = {
    /** 16px - Inline icons */
    xs: 16,
    /** 20px - Small icons */
    sm: 20,
    /** 24px - Default icons */
    md: 24,
    /** 28px - Medium icons */
    lg: 28,
    /** 32px - Large icons */
    xl: 32,
    /** 48px - Hero icons */
    xxl: 48,
} as const;

// Component sizes
export const componentSizes = {
    /** Button heights */
    buttonSmall: 36,
    buttonMedium: 44,
    buttonLarge: 52,

    /** Input heights */
    inputSmall: 36,
    inputMedium: 44,
    inputLarge: 52,

    /** Avatar/Icon container sizes */
    avatarSmall: 32,
    avatarMedium: 44,
    avatarLarge: 64,

    /** Touch target minimum */
    touchTarget: 44,
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type BorderRadius = typeof borderRadius;
