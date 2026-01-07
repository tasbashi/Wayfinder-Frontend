/**
 * EmptyState Component
 * 
 * Display when a list or section has no data.
 * Shows icon, title, description, and optional action button.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Button } from './Button';

interface EmptyStateProps {
    /** Icon component to display */
    icon?: React.ReactNode;
    /** Main title */
    title: string;
    /** Description text */
    description?: string;
    /** Action button title */
    actionTitle?: string;
    /** Action button callback */
    onAction?: () => void;
    /** Custom container style */
    style?: ViewStyle;
}

export function EmptyState({
    icon,
    title,
    description,
    actionTitle,
    onAction,
    style,
}: EmptyStateProps) {
    return (
        <View style={[styles.container, style]}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}

            <Text style={styles.title}>{title}</Text>

            {description && (
                <Text style={styles.description}>{description}</Text>
            )}

            {actionTitle && onAction && (
                <View style={styles.actionContainer}>
                    <Button
                        title={actionTitle}
                        variant="primary"
                        size="medium"
                        onPress={onAction}
                    />
                </View>
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
        marginBottom: theme.spacing.lg,
        opacity: 0.5,
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
});
