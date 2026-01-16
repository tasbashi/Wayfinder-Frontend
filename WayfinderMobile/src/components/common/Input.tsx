import React from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";
import { cn } from "@/utils/cn";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    className?: string;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className,
    containerClassName,
    ...props
}) => {
    const hasError = !!error;

    return (
        <View className={cn("w-full", containerClassName)}>
            {label && (
                <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
            )}
            <TextInput
                className={cn(
                    "w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900",
                    "placeholder:text-gray-400",
                    hasError ? "border-red-500" : "border-gray-200",
                    "focus:border-primary-500",
                    className
                )}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
            {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
            {helperText && !error && (
                <Text className="text-xs text-gray-500 mt-1">{helperText}</Text>
            )}
        </View>
    );
};
