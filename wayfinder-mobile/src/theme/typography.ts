/**
 * Wayfinder Mobile - Typography System
 * 
 * Consistent typography scale for all text elements.
 * Based on system fonts for optimal performance.
 */

import { Platform, TextStyle } from 'react-native';

// Font families
export const fontFamily = {
    // System fonts for cross-platform consistency
    regular: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
    }),
    medium: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
    }),
    bold: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
    }),
} as const;

// Font weights
export const fontWeight = {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
} as const;

// Font sizes
export const fontSize = {
    /** 10px - Tiny labels */
    xxs: 10,
    /** 12px - Small labels, captions */
    xs: 12,
    /** 14px - Body small, secondary text */
    sm: 14,
    /** 16px - Body default */
    md: 16,
    /** 18px - Body large, section titles */
    lg: 18,
    /** 20px - Heading 4 */
    xl: 20,
    /** 24px - Heading 3 */
    xxl: 24,
    /** 28px - Heading 2 */
    xxxl: 28,
    /** 32px - Heading 1 */
    display: 32,
    /** 40px - Large display */
    displayLg: 40,
} as const;

// Line heights
export const lineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
} as const;

// Text styles (pre-composed)
export const textStyles = {
    // Display / Headings
    displayLarge: {
        fontSize: fontSize.displayLg,
        fontWeight: fontWeight.bold,
        lineHeight: fontSize.displayLg * lineHeight.tight,
    } as TextStyle,

    display: {
        fontSize: fontSize.display,
        fontWeight: fontWeight.bold,
        lineHeight: fontSize.display * lineHeight.tight,
    } as TextStyle,

    h1: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        lineHeight: fontSize.xxxl * lineHeight.tight,
    } as TextStyle,

    h2: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        lineHeight: fontSize.xxl * lineHeight.tight,
    } as TextStyle,

    h3: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.xl * lineHeight.tight,
    } as TextStyle,

    h4: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.lg * lineHeight.tight,
    } as TextStyle,

    // Body text
    bodyLarge: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.lg * lineHeight.normal,
    } as TextStyle,

    body: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.md * lineHeight.normal,
    } as TextStyle,

    bodySmall: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.sm * lineHeight.normal,
    } as TextStyle,

    // Labels
    labelLarge: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.md * lineHeight.tight,
    } as TextStyle,

    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        lineHeight: fontSize.sm * lineHeight.tight,
    } as TextStyle,

    labelSmall: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        lineHeight: fontSize.xs * lineHeight.tight,
    } as TextStyle,

    // Captions
    caption: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.xs * lineHeight.normal,
    } as TextStyle,

    captionSmall: {
        fontSize: fontSize.xxs,
        fontWeight: fontWeight.regular,
        lineHeight: fontSize.xxs * lineHeight.normal,
    } as TextStyle,

    // Button text
    buttonLarge: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.lg * lineHeight.tight,
    } as TextStyle,

    button: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.md * lineHeight.tight,
    } as TextStyle,

    buttonSmall: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        lineHeight: fontSize.sm * lineHeight.tight,
    } as TextStyle,
} as const;

export type TextStyles = typeof textStyles;
export type FontSize = typeof fontSize;
