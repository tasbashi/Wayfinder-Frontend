/**
 * ErrorState Component
 * 
 * Display when an error occurs.
 * Shows error icon, message, and retry button.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { theme } from '@/theme';
import { Button } from './Button';

interface ErrorStateProps {
    /** Error message to display */
    message?: string;
    /** Detailed error description */
    description?: string;
    /** Retry button callback */
    onRetry?: () => void;
    /** Retry button title */
    retryTitle?: string;
    /** Custom icon */
    icon?: React.ReactNode;
    /** Custom container style */
    style?: ViewStyle;
}

export function ErrorState({
    message = 'Something went wrong',
    description,
    onRetry,
    retryTitle = 'Try Again',
    icon,
    style,
}: ErrorStateProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                {icon || <AlertCircle size={48} color={theme.colors.error[500]} />}
            </View>

            <Text style={styles.title}>{message}</Text>

            {description && (
                <Text style={styles.description}>{description}</Text>
            )}

            {onRetry && (
                <View style={styles.actionContainer}>
                    <Button
                        title={retryTitle}
                        variant="primary"
                        size="medium"
                        onPress={onRetry}
                        leftIcon={<RefreshCw size={18} color="#fff" />}
                    />
                </View>
            )}
        </View>
    );
}

/**
 * Inline ErrorState Component
 * 
 * Smaller error display for inline use within cards or sections.
 */
interface InlineErrorProps {
    message: string;
    onRetry?: () => void;
    style?: ViewStyle;
}

export function InlineError({ message, onRetry, style }: InlineErrorProps) {
    return (
        <View style={[styles.inlineContainer, style]}>
            <AlertCircle size={16} color={theme.colors.error[500]} />
            <Text style={styles.inlineMessage}>{message}</Text>
            {onRetry && (
                <Button
                    title="Retry"
                    variant="ghost"
                    size="small"
                    onPress={onRetry}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.error[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    description: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 22,
    },
    actionContainer: {
        marginTop: theme.spacing.lg,
    },

    // Inline styles
    inlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.error[50],
        borderRadius: theme.borderRadius.sm,
        gap: theme.spacing.sm,
    },
    inlineMessage: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.error[700],
        flex: 1,
    },
});
