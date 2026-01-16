import React from "react";
import { View, Text, ScrollView, Switch, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Sun,
    Moon,
    Globe,
    Accessibility,
    Info,
    ChevronRight,
    Bell,
    Smartphone
} from "lucide-react-native";
import { Card } from "@/components/common/Card";
import { useAppStore } from "@/store/useAppStore";
import { COLORS } from "@/constants/colors";

interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
}) => (
    <Pressable
        onPress={onPress}
        className="flex-row items-center py-4 px-4 active:bg-gray-50"
    >
        <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
            {icon}
        </View>
        <View className="flex-1">
            <Text className="text-base font-medium text-gray-900">{title}</Text>
            {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
        </View>
        {rightElement || <ChevronRight size={20} color={COLORS.gray[400]} />}
    </Pressable>
);

export default function SettingsScreen() {
    const {
        theme,
        setTheme,
        isAccessibilityMode,
        toggleAccessibilityMode,
        language,
        setLanguage
    } = useAppStore();

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-4 pb-6">
                    <Text className="text-2xl font-bold text-gray-900">Ayarlar</Text>
                </View>

                {/* Appearance */}
                <View className="px-5 mb-4">
                    <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Görünüm
                    </Text>
                    <Card padding="none">
                        <SettingItem
                            icon={<Sun size={20} color={COLORS.gray[600]} />}
                            title="Tema"
                            subtitle={theme === "light" ? "Açık" : theme === "dark" ? "Koyu" : "Sistem"}
                            rightElement={
                                <View className="flex-row bg-gray-100 rounded-lg p-1">
                                    <Pressable
                                        onPress={() => setTheme("light")}
                                        className={`px-3 py-1 rounded-md ${theme === "light" ? "bg-white" : ""}`}
                                    >
                                        <Sun size={16} color={theme === "light" ? COLORS.primary : COLORS.gray[400]} />
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setTheme("dark")}
                                        className={`px-3 py-1 rounded-md ${theme === "dark" ? "bg-white" : ""}`}
                                    >
                                        <Moon size={16} color={theme === "dark" ? COLORS.primary : COLORS.gray[400]} />
                                    </Pressable>
                                </View>
                            }
                        />
                        <View className="h-px bg-gray-100 mx-4" />
                        <SettingItem
                            icon={<Globe size={20} color={COLORS.gray[600]} />}
                            title="Dil"
                            subtitle={language === "tr" ? "Türkçe" : "English"}
                            rightElement={
                                <View className="flex-row bg-gray-100 rounded-lg p-1">
                                    <Pressable
                                        onPress={() => setLanguage("tr")}
                                        className={`px-3 py-1 rounded-md ${language === "tr" ? "bg-white" : ""}`}
                                    >
                                        <Text className={language === "tr" ? "text-primary-500" : "text-gray-400"}>TR</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setLanguage("en")}
                                        className={`px-3 py-1 rounded-md ${language === "en" ? "bg-white" : ""}`}
                                    >
                                        <Text className={language === "en" ? "text-primary-500" : "text-gray-400"}>EN</Text>
                                    </Pressable>
                                </View>
                            }
                        />
                    </Card>
                </View>

                {/* Accessibility */}
                <View className="px-5 mb-4">
                    <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Erişilebilirlik
                    </Text>
                    <Card padding="none">
                        <SettingItem
                            icon={<Accessibility size={20} color={COLORS.gray[600]} />}
                            title="Erişilebilirlik Modu"
                            subtitle="Tekerlekli sandalye erişimi için rotalar"
                            rightElement={
                                <Switch
                                    value={isAccessibilityMode}
                                    onValueChange={toggleAccessibilityMode}
                                    trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
                                    thumbColor={COLORS.white}
                                />
                            }
                        />
                    </Card>
                </View>

                {/* About */}
                <View className="px-5 mb-4">
                    <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Hakkında
                    </Text>
                    <Card padding="none">
                        <SettingItem
                            icon={<Info size={20} color={COLORS.gray[600]} />}
                            title="Uygulama Bilgisi"
                            subtitle="Wayfinder v1.0.0"
                        />
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
