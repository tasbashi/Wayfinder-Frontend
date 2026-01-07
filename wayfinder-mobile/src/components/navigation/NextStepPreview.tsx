/**
 * NextStepPreview
 * 
 * Subtle card showing the upcoming navigation step.
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Navigation,
    ChevronRight,
    Footprints,
} from 'lucide-react-native';
import { RouteNodeDto, NodeType } from '@/api/types';
import { theme } from '@/theme';

interface NextStepPreviewProps {
    /** Next route node */
    routeNode: RouteNodeDto;
    /** Called when preview is tapped */
    onPress?: () => void;
}

/**
 * Get icon for node type or instruction
 */
function getStepIcon(nodeType: NodeType, instruction: string) {
    const lower = instruction.toLowerCase();

    if (lower.includes('elevator')) return ArrowUpCircle;
    if (lower.includes('stairs')) return Footprints;
    if (lower.includes('down')) return ArrowDownCircle;

    return Navigation;
}

export function NextStepPreview({ routeNode, onPress }: NextStepPreviewProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const StepIcon = getStepIcon(routeNode.nodeType, routeNode.instruction);

    // Build preview text
    let previewText = routeNode.instruction;
    if (routeNode.floorName && routeNode.instruction.toLowerCase().includes('floor')) {
        previewText = routeNode.instruction;
    } else if (routeNode.name) {
        previewText = `Then, ${routeNode.instruction.toLowerCase()}`;
    }

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: isDark
                        ? 'rgba(40, 43, 57, 0.8)'
                        : theme.colors.neutral[100],
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityLabel={`Next step: ${previewText}`}
            accessibilityRole="button"
        >
            <View style={styles.content}>
                {/* Icon */}
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: isDark
                                ? 'rgba(255, 255, 255, 0.1)'
                                : theme.colors.neutral[200],
                        },
                    ]}
                >
                    <StepIcon
                        size={18}
                        color={isDark ? theme.colors.neutral[400] : theme.colors.textSecondary}
                    />
                </View>

                {/* Text */}
                <Text
                    style={[
                        styles.text,
                        { color: isDark ? theme.colors.neutral[300] : theme.colors.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    {previewText}
                </Text>
            </View>

            {/* Chevron */}
            <ChevronRight
                size={20}
                color={isDark ? theme.colors.neutral[600] : theme.colors.neutral[400]}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: theme.spacing.sm,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});
