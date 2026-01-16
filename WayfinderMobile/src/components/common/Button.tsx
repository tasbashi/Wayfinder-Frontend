import React from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react-native";

interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    className?: string;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onPress,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = "left",
    className,
    fullWidth = false,
}) => {
    const isDisabled = disabled || loading;

    const baseStyles = "flex-row items-center justify-center rounded-xl active:opacity-80";

    const variantStyles = {
        primary: "bg-primary-500 active:bg-primary-600",
        secondary: "bg-gray-100 border border-gray-200 active:bg-gray-200",
        ghost: "bg-transparent active:bg-gray-100",
        danger: "bg-red-500 active:bg-red-600",
    };

    const sizeStyles = {
        sm: "px-3 py-2 gap-1.5",
        md: "px-4 py-3 gap-2",
        lg: "px-6 py-4 gap-2.5",
    };

    const textVariantStyles = {
        primary: "text-white",
        secondary: "text-gray-800",
        ghost: "text-gray-700",
        danger: "text-white",
    };

    const textSizeStyles = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const iconColor = {
        primary: "#FFFFFF",
        secondary: "#1F2937",
        ghost: "#374151",
        danger: "#FFFFFF",
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                isDisabled && "opacity-50",
                fullWidth && "w-full",
                className
            )}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === "primary" || variant === "danger" ? "#FFFFFF" : "#6B7280"}
                />
            ) : (
                <>
                    {Icon && iconPosition === "left" && (
                        <Icon size={iconSizes[size]} color={iconColor[variant]} />
                    )}
                    <Text
                        className={cn(
                            "font-semibold",
                            textVariantStyles[variant],
                            textSizeStyles[size]
                        )}
                    >
                        {children}
                    </Text>
                    {Icon && iconPosition === "right" && (
                        <Icon size={iconSizes[size]} color={iconColor[variant]} />
                    )}
                </>
            )}
        </Pressable>
    );
};
