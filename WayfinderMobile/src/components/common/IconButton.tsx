import React from "react";
import { Pressable } from "react-native";
import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

interface IconButtonProps {
    icon: LucideIcon;
    onPress?: () => void;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "primary" | "ghost";
    disabled?: boolean;
    className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon: Icon,
    onPress,
    size = "md",
    variant = "default",
    disabled = false,
    className,
}) => {
    const sizeStyles = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const variantStyles = {
        default: "bg-gray-100 active:bg-gray-200",
        primary: "bg-primary-500 active:bg-primary-600",
        ghost: "bg-transparent active:bg-gray-100",
    };

    const iconColors = {
        default: COLORS.gray[600],
        primary: COLORS.white,
        ghost: COLORS.gray[600],
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            className={cn(
                "items-center justify-center rounded-full",
                sizeStyles[size],
                variantStyles[variant],
                disabled && "opacity-50",
                className
            )}
        >
            <Icon size={iconSizes[size]} color={iconColors[variant]} />
        </Pressable>
    );
};
