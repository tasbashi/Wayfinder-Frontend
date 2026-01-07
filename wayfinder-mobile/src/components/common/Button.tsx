/**
 * Button Component
 * 
 * Reusable button with multiple variants and sizes.
 * Supports icons, loading state, and disabled state.
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import { theme, getShadowStyle } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    /** Button label text */
    title: string;
    /** Button variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Icon to show before the title */
    leftIcon?: React.ReactNode;
    /** Icon to show after the title */
    rightIcon?: React.ReactNode;
    /** Loading state - shows spinner */
    isLoading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Full width button */
    fullWidth?: boolean;
    /** Custom style */
    style?: ViewStyle;
}

export function Button({
    title,
    variant = 'primary',
    size = 'medium',
    leftIcon,
    rightIcon,
    isLoading = false,
    disabled = false,
    fullWidth = false,
    style,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || isLoading;

    const containerStyles: ViewStyle[] = [
        styles.base,
        styles[`${variant}Container`],
        styles[`${size}Container`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    const textStyles: TextStyle[] = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        isDisabled && styles.disabledText,
    ].filter(Boolean) as TextStyle[];

    return (
        <TouchableOpacity
            style={containerStyles}
            disabled={isDisabled}
            activeOpacity={0.7}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? '#fff' : theme.colors.primary[500]}
                    size="small"
                />
            ) : (
                <View style={styles.content}>
                    {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                    <Text style={textStyles}>{title}</Text>
                    {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borderRadius.md,
    },

    // Variants - Container
    primaryContainer: {
        backgroundColor: theme.colors.primary[500],
        ...getShadowStyle('sm'),
    },
    secondaryContainer: {
        backgroundColor: theme.colors.primary[50],
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
    },
    ghostContainer: {
        backgroundColor: 'transparent',
    },

    // Variants - Text
    primaryText: {
        color: '#ffffff',
    },
    secondaryText: {
        color: theme.colors.primary[600],
    },
    outlineText: {
        color: theme.colors.primary[500],
    },
    ghostText: {
        color: theme.colors.primary[500],
    },

    // Sizes - Container
    smallContainer: {
        paddingHorizontal: theme.spacing.md,
        height: theme.componentSizes.buttonSmall,
        borderRadius: theme.borderRadius.sm,
    },
    mediumContainer: {
        paddingHorizontal: theme.spacing.lg,
        height: theme.componentSizes.buttonMedium,
    },
    largeContainer: {
        paddingHorizontal: theme.spacing.xl,
        height: theme.componentSizes.buttonLarge,
    },

    // Sizes - Text
    smallText: {
        ...theme.textStyles.buttonSmall,
    },
    mediumText: {
        ...theme.textStyles.button,
    },
    largeText: {
        ...theme.textStyles.buttonLarge,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.7,
    },

    // Layout
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
    },
    leftIcon: {
        marginRight: theme.spacing.sm,
    },
    rightIcon: {
        marginLeft: theme.spacing.sm,
    },
});
