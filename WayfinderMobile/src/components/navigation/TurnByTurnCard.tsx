import React from "react";
import { View, Text } from "react-native";
import { Card } from "../common/Card";
import { getNodeTypeConfig } from "@/constants/nodeTypes";
import { ArrowUp, ArrowLeft, ArrowRight, MoveUp, MoveDown } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import type { Node } from "@/types";

interface TurnByTurnCardProps {
    currentNode: Node;
    nextNode: Node | null;
    stepNumber: number;
    totalSteps: number;
    direction?: "straight" | "left" | "right" | "up" | "down";
    className?: string;
}

const DirectionIcon: React.FC<{ direction?: string }> = ({ direction }) => {
    const iconProps = { size: 32, color: COLORS.primary };

    switch (direction) {
        case "left":
            return <ArrowLeft {...iconProps} />;
        case "right":
            return <ArrowRight {...iconProps} />;
        case "up":
            return <MoveUp {...iconProps} />;
        case "down":
            return <MoveDown {...iconProps} />;
        default:
            return <ArrowUp {...iconProps} />;
    }
};

export const TurnByTurnCard: React.FC<TurnByTurnCardProps> = ({
    currentNode,
    nextNode,
    stepNumber,
    totalSteps,
    direction = "straight",
    className,
}) => {
    const currentConfig = getNodeTypeConfig(currentNode.type);
    const CurrentIcon = currentConfig.icon;

    return (
        <Card variant="elevated" className={className}>
            {/* Progress indicator */}
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-gray-500">
                    Adım {stepNumber} / {totalSteps}
                </Text>
                <View className="flex-1 h-1 bg-gray-200 rounded-full mx-3">
                    <View
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                    />
                </View>
            </View>

            <View className="flex-row items-center gap-4">
                {/* Direction */}
                <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center">
                    <DirectionIcon direction={direction} />
                </View>

                {/* Instruction */}
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                        {currentNode.name}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-1">
                        <CurrentIcon size={14} color={currentConfig.color} />
                        <Text className="text-sm text-gray-500">{currentConfig.labelTr}</Text>
                    </View>
                    {nextNode && (
                        <Text className="text-xs text-gray-400 mt-1">
                            Sonraki: {nextNode.name}
                        </Text>
                    )}
                </View>
            </View>
        </Card>
    );
};
