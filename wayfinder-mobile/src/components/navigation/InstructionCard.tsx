/**
 * InstructionCard Component
 * 
 * Single navigation instruction step.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { theme, getShadowStyle, getNodeTypeColor } from '@/theme';
import { RouteNodeDto, NodeType, getNodeTypeName } from '@/api/types';
import { NodeTypeIcon } from '@/components/node';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface InstructionCardProps {
    /** Route node with instruction */
    routeNode: RouteNodeDto;
    /** Step index (1-based for display) */
    stepIndex: number;
    /** Total steps */
    totalSteps: number;
    /** Is current step */
    isCurrent?: boolean;
    /** Is completed step */
    isCompleted?: boolean;
    /** Card press handler */
    onPress?: () => void;
}

export function InstructionCard({
    routeNode,
    stepIndex,
    totalSteps,
    isCurrent = false,
    isCompleted = false,
    onPress,
}: InstructionCardProps) {
    const { fontSizeMultiplier } = useAccessibility();
    const nodeType = typeof routeNode.nodeType === 'number' ? routeNode.nodeType : NodeType.Unknown;

    const isFirst = stepIndex === 1;
    const isLast = stepIndex === totalSteps;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isCurrent && styles.containerCurrent,
                isCompleted && styles.containerCompleted,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            {/* Step indicator */}
            <View style={styles.stepColumn}>
                <View
                    style={[
                        styles.stepCircle,
                        isCurrent && styles.stepCircleCurrent,
                        isCompleted && styles.stepCircleCompleted,
                    ]}
                >
                    {isCompleted ? (
                        <Check size={14} color="#fff" />
                    ) : (
                        <Text style={styles.stepNumber}>{stepIndex}</Text>
                    )}
                </View>
                {!isLast && <View style={styles.stepLine} />}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <NodeTypeIcon nodeType={nodeType} size={16} />
                    <Text
                        style={[styles.nodeName, { fontSize: 15 * fontSizeMultiplier }]}
                        numberOfLines={1}
                    >
                        {routeNode.name || getNodeTypeName(nodeType)}
                    </Text>
                </View>

                <Text
                    style={[
                        styles.instruction,
                        { fontSize: 14 * fontSizeMultiplier },
                        isCurrent && styles.instructionCurrent,
                    ]}
                >
                    {routeNode.instruction}
                </Text>

                {routeNode.distanceFromPrevious > 0 && (
                    <Text style={[styles.distance, { fontSize: 12 * fontSizeMultiplier }]}>
                        {Math.round(routeNode.distanceFromPrevious)}m
                    </Text>
                )}

                {routeNode.floorName && (
                    <Text style={[styles.floor, { fontSize: 12 * fontSizeMultiplier }]}>
                        {routeNode.floorName}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...getShadowStyle('xs'),
    },
    containerCurrent: {
        backgroundColor: theme.colors.primary[50],
        borderWidth: 2,
        borderColor: theme.colors.primary[500],
    },
    containerCompleted: {
        opacity: 0.7,
    },
    stepColumn: {
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleCurrent: {
        backgroundColor: theme.colors.primary[500],
    },
    stepCircleCompleted: {
        backgroundColor: theme.colors.success[500],
    },
    stepNumber: {
        ...theme.textStyles.labelSmall,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    stepLine: {
        width: 2,
        flex: 1,
        minHeight: 20,
        backgroundColor: theme.colors.border,
        marginTop: theme.spacing.xs,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    nodeName: {
        ...theme.textStyles.label,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    instruction: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    instructionCurrent: {
        color: theme.colors.primary[700],
        fontWeight: '500',
    },
    distance: {
        ...theme.textStyles.caption,
        color: theme.colors.textTertiary,
        marginTop: theme.spacing.xs,
    },
    floor: {
        ...theme.textStyles.caption,
        color: theme.colors.info[600],
        marginTop: 2,
    },
});
