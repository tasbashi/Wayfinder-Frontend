import React, { memo } from "react";
import { Pressable, View, Text } from "react-native";
import { cn } from "@/utils/cn";
import { getNodeTypeConfig } from "@/constants/nodeTypes";
import type { Node } from "@/types";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

interface NodeCardProps {
    node: Node;
    onPress?: () => void;
    showChevron?: boolean;
    compact?: boolean;
    selected?: boolean;
    className?: string;
}

export const NodeCard: React.FC<NodeCardProps> = memo(
    ({ node, onPress, showChevron = true, compact = false, selected = false, className }) => {
        const config = getNodeTypeConfig(node.type);
        const Icon = config.icon;

        return (
            <Pressable
                onPress={onPress}
                className={cn(
                    "flex-row items-center bg-white rounded-xl active:bg-gray-50",
                    compact ? "p-3 gap-3" : "p-4 gap-4",
                    selected && "border-2 border-primary-500",
                    className
                )}
            >
                <View
                    style={{ backgroundColor: config.bgColor }}
                    className={cn(
                        "items-center justify-center rounded-xl",
                        compact ? "w-10 h-10" : "w-12 h-12"
                    )}
                >
                    <Icon size={compact ? 20 : 24} color={config.color} />
                </View>
                <View className="flex-1">
                    <Text
                        className={cn(
                            "font-semibold text-gray-900",
                            compact ? "text-sm" : "text-base"
                        )}
                        numberOfLines={1}
                    >
                        {node.name}
                    </Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                        {config.labelTr}
                        {node.isAccessible && " • ♿ Erişilebilir"}
                    </Text>
                </View>
                {showChevron && (
                    <ChevronRight size={20} color={COLORS.gray[400]} />
                )}
            </Pressable>
        );
    }
);

NodeCard.displayName = "NodeCard";
