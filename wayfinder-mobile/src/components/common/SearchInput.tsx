/**
 * SearchInput Component
 * 
 * Debounced search input with clear button and loading state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    ActivityIndicator,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';

interface SearchInputProps {
    /** Current search value */
    value?: string;
    /** Callback when search value changes (debounced) */
    onSearch: (query: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Debounce delay in milliseconds */
    debounceMs?: number;
    /** Show loading indicator */
    isLoading?: boolean;
    /** Auto focus on mount */
    autoFocus?: boolean;
    /** Custom container style */
    style?: ViewStyle;
}

export function SearchInput({
    value: controlledValue,
    onSearch,
    placeholder = 'Search...',
    debounceMs = 300,
    isLoading = false,
    autoFocus = false,
    style,
}: SearchInputProps) {
    const [internalValue, setInternalValue] = useState(controlledValue || '');

    // Sync with controlled value
    useEffect(() => {
        if (controlledValue !== undefined) {
            setInternalValue(controlledValue);
        }
    }, [controlledValue]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(internalValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [internalValue, debounceMs, onSearch]);

    const handleClear = useCallback(() => {
        setInternalValue('');
        onSearch('');
    }, [onSearch]);

    const showClear = internalValue.length > 0 && !isLoading;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                <Search size={20} color={theme.colors.textTertiary} />
            </View>

            <TextInput
                style={styles.input}
                value={internalValue}
                onChangeText={setInternalValue}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textTertiary}
                autoFocus={autoFocus}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                </View>
            )}

            {showClear && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        height: theme.componentSizes.inputMedium,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...getShadowStyle('xs'),
    },
    iconContainer: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        padding: 0,
    },
    loadingContainer: {
        marginLeft: theme.spacing.sm,
    },
    clearButton: {
        marginLeft: theme.spacing.sm,
        padding: theme.spacing.xs,
    },
});
