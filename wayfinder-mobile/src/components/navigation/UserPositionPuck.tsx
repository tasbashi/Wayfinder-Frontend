/**
 * UserPositionPuck
 * 
 * Animated indicator showing the user's current position on the floor plan.
 * Features a pulsing outer ring and solid inner dot.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';

interface UserPositionPuckProps {
    /** X coordinate on floor plan */
    x: number;
    /** Y coordinate on floor plan */
    y: number;
    /** Size of the puck in pixels */
    size?: number;
    /** Whether to show the pulsing animation */
    showPulse?: boolean;
}

export function UserPositionPuck({
    x,
    y,
    size = 24,
    showPulse = true,
}: UserPositionPuckProps) {
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);

    useEffect(() => {
        if (showPulse) {
            pulseScale.value = withRepeat(
                withTiming(2.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
            pulseOpacity.value = withRepeat(
                withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
        }
    }, [showPulse, pulseScale, pulseOpacity]);

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const outerSize = size;
    const innerSize = size * 0.5;

    return (
        <View
            style={[
                styles.container,
                {
                    left: x - outerSize / 2,
                    top: y - outerSize / 2,
                    width: outerSize,
                    height: outerSize,
                },
            ]}
        >
            {/* Pulsing ring */}
            {showPulse && (
                <Animated.View
                    style={[
                        styles.pulseRing,
                        pulseAnimatedStyle,
                        {
                            width: outerSize,
                            height: outerSize,
                            borderRadius: outerSize / 2,
                            backgroundColor: theme.colors.primary[500],
                        },
                    ]}
                />
            )}

            {/* Outer circle */}
            <View
                style={[
                    styles.outerCircle,
                    {
                        width: outerSize,
                        height: outerSize,
                        borderRadius: outerSize / 2,
                        backgroundColor: theme.colors.primary[500],
                    },
                ]}
            >
                {/* Inner white dot */}
                <View
                    style={[
                        styles.innerDot,
                        {
                            width: innerSize,
                            height: innerSize,
                            borderRadius: innerSize / 2,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
    },
    outerCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },
    innerDot: {
        backgroundColor: '#ffffff',
    },
});
