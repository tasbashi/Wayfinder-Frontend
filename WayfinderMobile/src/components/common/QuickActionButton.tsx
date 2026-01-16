import React from "react";
import { Pressable, View, Text } from "react-native";
import { cn } from "@/utils/cn";
import type { QuickAction } from "@/constants/quickActions";

interface QuickActionButtonProps {
    action: QuickAction;
    onPress?: () => void;
    className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    action,
    onPress,
    className,
}) => {
    const Icon = action.icon;

    return (
        <Pressable
            onPress={onPress}
            className={cn(
                "items-center justify-center p-4 rounded-2xl bg-white active:scale-95",
                className
            )}
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            <View
                style={{ backgroundColor: action.bgColor }}
                className="w-12 h-12 items-center justify-center rounded-xl mb-2"
            >
                <Icon size={24} color={action.color} />
            </View>
            <Text className="text-xs font-medium text-gray-700 text-center">
                {action.labelTr}
            </Text>
        </Pressable>
    );
};
