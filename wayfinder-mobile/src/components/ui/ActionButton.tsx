import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight } from '@/utils/theme';

interface ActionButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export function ActionButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
}: ActionButtonProps) {
    const buttonStyles = [
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        (disabled || loading) && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${size}`],
        styles[`textVariant_${variant}`],
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.surface : colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    <Text style={textStyles}>{title}</Text>
                    {icon && iconPosition === 'right' && icon}
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: borderRadius.md,
    },
    // Sizes
    size_sm: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    size_md: {
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    size_lg: {
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
    // Variants
    variant_primary: {
        backgroundColor: colors.primary,
    },
    variant_secondary: {
        backgroundColor: colors.secondary,
    },
    variant_outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    variant_ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.6,
    },
    // Text
    text: {
        fontWeight: fontWeight.semibold,
    },
    text_sm: {
        fontSize: fontSize.sm,
    },
    text_md: {
        fontSize: fontSize.base,
    },
    text_lg: {
        fontSize: fontSize.lg,
    },
    // Text Variants
    textVariant_primary: {
        color: colors.surface,
    },
    textVariant_secondary: {
        color: colors.surface,
    },
    textVariant_outline: {
        color: colors.text,
    },
    textVariant_ghost: {
        color: colors.primary,
    },
});

export default ActionButton;
