import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, Navigation } from "lucide-react-native";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { QuickActionButton } from "@/components/common/QuickActionButton";
import { SearchInput } from "@/components/common/SearchInput";
import { QUICK_ACTIONS } from "@/constants/quickActions";
import { COLORS } from "@/constants/colors";
import { useLocationStore } from "@/store/useLocationStore";

export default function HomeScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
    const { currentNode } = useLocationStore();

    const handleQuickAction = (actionId: string) => {
        router.push(`/navigate?type=${actionId}`);
    };

    const handleSearch = () => {
        router.push("/explore");
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-4 pb-6">
                    <Text className="text-sm text-gray-500 mb-1">Hoş geldiniz</Text>
                    <Text className="text-2xl font-bold text-gray-900">Wayfinder</Text>
                </View>

                {/* Search */}
                <View className="px-5 mb-6">
                    <SearchInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Nereye gitmek istiyorsunuz?"
                        onFocus={handleSearch}
                    />
                </View>

                {/* Current Location Card */}
                <View className="px-5 mb-6">
                    <Card variant="elevated" className="bg-gradient-to-r from-primary-500 to-primary-600">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                    <MapPin size={20} color={COLORS.white} />
                                </View>
                                <View>
                                    <Text className="text-white/80 text-xs">Konumunuz</Text>
                                    <Text className="text-white font-semibold text-base">
                                        {currentNode?.name || "Konum belirlenmedi"}
                                    </Text>
                                </View>
                            </View>
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={() => router.push("/(tabs)/scan")}
                                className="bg-white/20"
                            >
                                <Text className="text-white text-sm">QR Tara</Text>
                            </Button>
                        </View>
                    </Card>
                </View>

                {/* Quick Actions */}
                <View className="px-5 mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">Hızlı Erişim</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {QUICK_ACTIONS.map((action) => (
                            <View key={action.id} className="w-[30%]">
                                <QuickActionButton
                                    action={action}
                                    onPress={() => handleQuickAction(action.id)}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Navigate Button */}
                <View className="px-5 mb-6">
                    <Button
                        fullWidth
                        size="lg"
                        icon={Navigation}
                        onPress={() => router.push("/navigate")}
                    >
                        Navigasyonu Başlat
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
