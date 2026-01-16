import React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/utils/cn";

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: "default" | "elevated" | "outlined";
    padding?: "none" | "sm" | "md" | "lg";
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = "default",
    padding = "md",
    className,
    ...props
}) => {
    const baseStyles = "rounded-2xl bg-white";

    const variantStyles = {
        default: "shadow-sm",
        elevated: "shadow-lg",
        outlined: "border border-gray-200",
    };

    const paddingStyles = {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
    };

    return (
        <View
            className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
            {...props}
        >
            {children}
        </View>
    );
};
