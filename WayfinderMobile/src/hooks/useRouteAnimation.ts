import { useEffect } from "react";
import { useSharedValue, withTiming, withRepeat, withSequence, Easing } from "react-native-reanimated";
import type { PathResult } from "@/types";
import { APP_CONFIG } from "@/config/app.config";

interface UseRouteAnimationOptions {
    route: PathResult | null;
    isActive?: boolean;
    duration?: number;
}

export const useRouteAnimation = (options: UseRouteAnimationOptions) => {
    const { route, isActive = true, duration = 2000 } = options;

    // Animation progress (0 to 1)
    const progress = useSharedValue(0);

    // Dash offset for animated path
    const dashOffset = useSharedValue(0);

    // Pulse animation for markers
    const pulse = useSharedValue(1);

    // Start/stop route animation
    useEffect(() => {
        if (route && isActive) {
            // Animate dash offset for "marching ants" effect
            dashOffset.value = withRepeat(
                withTiming(20, {
                    duration: 1000,
                    easing: Easing.linear,
                }),
                -1, // Infinite repeat
                false
            );

            // Pulse animation for current position marker
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            dashOffset.value = 0;
            pulse.value = 1;
        }
    }, [route, isActive, dashOffset, pulse]);

    // Animate to specific step
    const animateToStep = (stepIndex: number) => {
        if (!route) return;

        const targetProgress = stepIndex / (route.pathNodes.length - 1);
        progress.value = withTiming(targetProgress, {
            duration: APP_CONFIG.map.animationDuration,
            easing: Easing.inOut(Easing.ease),
        });
    };

    // Reset animation
    const resetAnimation = () => {
        progress.value = 0;
        dashOffset.value = 0;
        pulse.value = 1;
    };

    return {
        progress,
        dashOffset,
        pulse,
        animateToStep,
        resetAnimation,
    };
};
