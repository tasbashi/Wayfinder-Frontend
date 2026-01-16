import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { cn } from "@/utils/cn";
import type { Floor } from "@/types";
import { formatFloorLevel } from "@/utils/formatters";
import { COLORS } from "@/constants/colors";

interface FloorSelectorProps {
    floors: Floor[];
    selectedFloorId: string | null;
    onSelectFloor: (floor: Floor) => void;
    className?: string;
}

export const FloorSelector: React.FC<FloorSelectorProps> = ({
    floors,
    selectedFloorId,
    onSelectFloor,
    className,
}) => {
    // Sort floors by level
    const sortedFloors = [...floors].sort((a, b) => b.level - a.level);

    return (
        <View className={cn("bg-white rounded-xl p-2 shadow-sm", className)}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 4 }}
            >
                {sortedFloors.map((floor) => {
                    const isSelected = floor.id === selectedFloorId;
                    return (
                        <Pressable
                            key={floor.id}
                            onPress={() => onSelectFloor(floor)}
                            className={cn(
                                "px-4 py-2 rounded-lg",
                                isSelected ? "bg-primary-500" : "bg-gray-100 active:bg-gray-200"
                            )}
                        >
                            <Text
                                className={cn(
                                    "text-sm font-medium",
                                    isSelected ? "text-white" : "text-gray-700"
                                )}
                            >
                                {formatFloorLevel(floor.level)}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};
