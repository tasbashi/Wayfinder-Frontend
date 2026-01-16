import React from "react";
import { TextInput, View, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";
import { cn } from "@/utils/cn";
import { COLORS } from "@/constants/colors";

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
    autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChangeText,
    placeholder = "Ara...",
    onClear,
    onFocus,
    onBlur,
    className,
    autoFocus = false,
}) => {
    const handleClear = () => {
        onChangeText("");
        onClear?.();
    };

    return (
        <View
            className={cn(
                "flex-row items-center bg-gray-100 rounded-xl px-4 py-3 gap-3",
                className
            )}
        >
            <Search size={20} color={COLORS.gray[400]} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.gray[400]}
                onFocus={onFocus}
                onBlur={onBlur}
                autoFocus={autoFocus}
                className="flex-1 text-gray-900 text-base"
            />
            {value.length > 0 && (
                <Pressable onPress={handleClear} hitSlop={8}>
                    <X size={18} color={COLORS.gray[400]} />
                </Pressable>
            )}
        </View>
    );
};
