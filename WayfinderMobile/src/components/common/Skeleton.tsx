import React from "react";
import { View, type DimensionValue } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
} from "react-native-reanimated";
import { cn } from "@/utils/cn";
import { useEffect } from "react";

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = "100%",
    height = 16,
    borderRadius = 8,
    className,
}) => {
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 750 }),
                withTiming(0.5, { duration: 750 })
            ),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={{ width, height, borderRadius, backgroundColor: "#E5E7EB" }}>
            <Animated.View
                style={[
                    { flex: 1, borderRadius },
                    animatedStyle,
                ]}
                className={className}
            />
        </View>
    );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
    <View className={cn("bg-white rounded-2xl p-4 space-y-3", className)}>
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} width="80%" />
        <Skeleton height={14} width="40%" />
    </View>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
    <View className="flex-row items-center p-4 gap-3">
        <Skeleton width={48} height={48} borderRadius={24} />
        <View className="flex-1 gap-2">
            <Skeleton height={16} width="70%" />
            <Skeleton height={14} width="50%" />
        </View>
    </View>
);
