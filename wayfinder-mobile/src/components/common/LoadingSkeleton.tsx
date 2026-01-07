/**
 * LoadingSkeleton Component
 * 
 * Animated placeholder for loading content.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface LoadingSkeletonProps {
    /** Width of skeleton */
    width?: number | string;
    /** Height of skeleton */
    height?: number;
    /** Border radius */
    borderRadius?: number;
    /** Custom style */
    style?: ViewStyle;
}

export function LoadingSkeleton({
    width = '100%',
    height = 20,
    borderRadius = theme.borderRadius.sm,
    style,
}: LoadingSkeletonProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as number,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
}

/**
 * Skeleton for card-like content
 */
interface CardSkeletonProps {
    /** Number of lines to show */
    lines?: number;
    /** Show icon placeholder */
    showIcon?: boolean;
    /** Custom style */
    style?: ViewStyle;
}

export function CardSkeleton({
    lines = 2,
    showIcon = true,
    style,
}: CardSkeletonProps) {
    return (
        <View style={[styles.card, style]}>
            {showIcon && (
                <LoadingSkeleton
                    width={48}
                    height={48}
                    borderRadius={theme.borderRadius.md}
                    style={styles.cardIcon}
                />
            )}
            <View style={styles.cardContent}>
                <LoadingSkeleton width="70%" height={16} />
                {Array.from({ length: lines - 1 }).map((_, index) => (
                    <LoadingSkeleton
                        key={index}
                        width={`${60 - index * 10}%`}
                        height={14}
                        style={styles.cardLine}
                    />
                ))}
            </View>
        </View>
    );
}

/**
 * Skeleton for list of cards
 */
interface ListSkeletonProps {
    /** Number of cards to show */
    count?: number;
    /** Card props */
    cardProps?: CardSkeletonProps;
    /** Custom style */
    style?: ViewStyle;
}

export function ListSkeleton({
    count = 5,
    cardProps,
    style,
}: ListSkeletonProps) {
    return (
        <View style={[styles.list, style]}>
            {Array.from({ length: count }).map((_, index) => (
                <CardSkeleton key={index} {...cardProps} />
            ))}
        </View>
    );
}

/**
 * Skeleton for building card
 */
export function BuildingCardSkeleton() {
    return (
        <View style={styles.buildingCard}>
            <LoadingSkeleton
                width={48}
                height={48}
                borderRadius={theme.borderRadius.md}
                style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
                <LoadingSkeleton width="60%" height={16} />
                <LoadingSkeleton width="80%" height={14} style={styles.cardLine} />
                <LoadingSkeleton width="30%" height={12} style={styles.cardLine} />
            </View>
        </View>
    );
}

/**
 * Skeleton for node card
 */
export function NodeCardSkeleton() {
    return (
        <View style={styles.nodeCard}>
            <LoadingSkeleton
                width={44}
                height={44}
                borderRadius={22}
                style={styles.cardIcon}
            />
            <View style={styles.cardContent}>
                <LoadingSkeleton width="50%" height={15} />
                <LoadingSkeleton width={60} height={20} borderRadius={4} style={styles.cardLine} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: theme.colors.neutral[200],
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    cardIcon: {
        marginRight: theme.spacing.sm,
    },
    cardContent: {
        flex: 1,
    },
    cardLine: {
        marginTop: theme.spacing.xs,
    },
    list: {
        padding: theme.spacing.md,
    },
    buildingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    nodeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
});
