/**
 * Animated Components
 * 
 * Reusable animation wrappers for smooth UI transitions.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, ViewProps } from 'react-native';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface FadeInProps extends ViewProps {
    children: React.ReactNode;
    /** Duration in milliseconds */
    duration?: number;
    /** Delay before animation starts */
    delay?: number;
    /** Style */
    style?: ViewStyle;
}

/**
 * FadeIn animation wrapper
 */
export function FadeIn({
    children,
    duration = 300,
    delay = 0,
    style,
    ...props
}: FadeInProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const { settings } = useAccessibility();

    useEffect(() => {
        // Skip animation if reduce motion is preferred
        if (settings.highContrast) {
            opacity.setValue(1);
            return;
        }

        const animation = Animated.timing(opacity, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        });
        animation.start();
    }, [opacity, duration, delay, settings.highContrast]);

    return (
        <Animated.View style={[{ opacity }, style]} {...props}>
            {children}
        </Animated.View>
    );
}

interface SlideInProps extends ViewProps {
    children: React.ReactNode;
    /** Direction to slide from */
    from?: 'left' | 'right' | 'top' | 'bottom';
    /** Distance to slide */
    distance?: number;
    /** Duration in milliseconds */
    duration?: number;
    /** Delay before animation starts */
    delay?: number;
    /** Style */
    style?: ViewStyle;
}

/**
 * SlideIn animation wrapper
 */
export function SlideIn({
    children,
    from = 'bottom',
    distance = 20,
    duration = 300,
    delay = 0,
    style,
    ...props
}: SlideInProps) {
    const translateValue = useRef(new Animated.Value(distance)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const { settings } = useAccessibility();

    useEffect(() => {
        // Skip animation if reduce motion is preferred
        if (settings.highContrast) {
            translateValue.setValue(0);
            opacity.setValue(1);
            return;
        }

        const animations = Animated.parallel([
            Animated.timing(translateValue, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
        animations.start();
    }, [translateValue, opacity, duration, delay, settings.highContrast]);

    const transform = (() => {
        switch (from) {
            case 'left':
                return [{ translateX: Animated.multiply(translateValue, -1) }];
            case 'right':
                return [{ translateX: translateValue }];
            case 'top':
                return [{ translateY: Animated.multiply(translateValue, -1) }];
            case 'bottom':
            default:
                return [{ translateY: translateValue }];
        }
    })();

    return (
        <Animated.View style={[{ opacity, transform }, style]} {...props}>
            {children}
        </Animated.View>
    );
}

interface ScaleInProps extends ViewProps {
    children: React.ReactNode;
    /** Initial scale */
    initialScale?: number;
    /** Duration in milliseconds */
    duration?: number;
    /** Delay before animation starts */
    delay?: number;
    /** Style */
    style?: ViewStyle;
}

/**
 * ScaleIn animation wrapper
 */
export function ScaleIn({
    children,
    initialScale = 0.9,
    duration = 200,
    delay = 0,
    style,
    ...props
}: ScaleInProps) {
    const scale = useRef(new Animated.Value(initialScale)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const { settings } = useAccessibility();

    useEffect(() => {
        // Skip animation if reduce motion is preferred
        if (settings.highContrast) {
            scale.setValue(1);
            opacity.setValue(1);
            return;
        }

        const animations = Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                delay,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]);
        animations.start();
    }, [scale, opacity, duration, delay, settings.highContrast]);

    return (
        <Animated.View
            style={[{ opacity, transform: [{ scale }] }, style]}
            {...props}
        >
            {children}
        </Animated.View>
    );
}

interface StaggeredListProps {
    children: React.ReactNode[];
    /** Delay between each item */
    staggerDelay?: number;
    /** Animation component to use */
    AnimationComponent?: typeof FadeIn | typeof SlideIn | typeof ScaleIn;
    /** Props to pass to animation component */
    animationProps?: Partial<FadeInProps | SlideInProps | ScaleInProps>;
}

/**
 * Staggered list animation - animates children one by one
 */
export function StaggeredList({
    children,
    staggerDelay = 50,
    AnimationComponent = FadeIn,
    animationProps = {},
}: StaggeredListProps) {
    return (
        <>
            {React.Children.map(children, (child, index) => (
                <AnimationComponent
                    key={index}
                    delay={index * staggerDelay}
                    {...animationProps}
                >
                    {child}
                </AnimationComponent>
            ))}
        </>
    );
}
