import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    Building,
    QrCode,
    Search,
    Star,
    Clock,
    Navigation,
    ChevronRight,
} from "lucide-react-native";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export default function HomeTab() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();
    const [refreshing, setRefreshing] = useState(false);

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t("greeting.morning");
        if (hour < 18) return t("greeting.afternoon");
        return t("greeting.evening");
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // Just simulate refresh
        setTimeout(() => setRefreshing(false), 500);
    };

    const quickActions = [
        {
            id: "building",
            icon: Building,
            title: t("home.selectBuilding"),
            description: t("home.selectBuildingDesc"),
            onPress: () => router.push("/buildings"),
            color: "#3b82f6",
            bgColor: "#eff6ff",
        },
        {
            id: "scan",
            icon: QrCode,
            title: t("home.scanQR"),
            description: t("home.scanQRDesc"),
            onPress: () => router.push("/(tabs)/scanner"),
            color: "#8b5cf6",
            bgColor: "#f5f3ff",
        },
        {
            id: "search",
            icon: Search,
            title: t("home.searchDestination"),
            description: t("home.searchDestinationDesc"),
            onPress: () => router.push("/search"),
            color: "#10b981",
            bgColor: "#ecfdf5",
        },
        {
            id: "favorites",
            icon: Star,
            title: t("home.favorites"),
            description: t("home.favoritesDesc"),
            onPress: () => router.push("/favorites"),
            color: "#f59e0b",
            bgColor: "#fffbeb",
        },
        {
            id: "recent",
            icon: Clock,
            title: t("home.recentSearches"),
            description: t("home.recentSearchesDesc"),
            onPress: () => router.push("/recent"),
            color: "#6b7280",
            bgColor: "#f3f4f6",
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.greeting, { fontSize: 16 * fontSizeMultiplier }]}>
                    {getGreeting()}
                </Text>
                <Text style={[styles.title, { fontSize: 28 * fontSizeMultiplier }]}>
                    {t("home.welcome")}
                </Text>
                <Text style={[styles.subtitle, { fontSize: 14 * fontSizeMultiplier }]}>
                    {t("home.subtitle")}
                </Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Main CTA */}
                <TouchableOpacity
                    style={styles.mainCTA}
                    onPress={() => router.push("/(tabs)/navigate")}
                    activeOpacity={0.8}
                >
                    <View style={styles.mainCTAContent}>
                        <View style={styles.mainCTAIcon}>
                            <Navigation size={28} color="#fff" />
                        </View>
                        <View style={styles.mainCTAText}>
                            <Text style={[styles.mainCTATitle, { fontSize: 18 * fontSizeMultiplier }]}>
                                {t("home.startNavigation")}
                            </Text>
                            <Text style={[styles.mainCTASubtitle, { fontSize: 14 * fontSizeMultiplier }]}>
                                {t("home.whereToGo")}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight size={24} color="#fff" />
                </TouchableOpacity>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { fontSize: 18 * fontSizeMultiplier }]}>
                    {t("home.quickActions")}
                </Text>

                {quickActions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.actionCard}
                        onPress={action.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
                            <action.icon size={24} color={action.color} />
                        </View>
                        <View style={styles.actionText}>
                            <Text style={[styles.actionTitle, { fontSize: 16 * fontSizeMultiplier }]}>
                                {action.title}
                            </Text>
                            <Text style={[styles.actionDesc, { fontSize: 13 * fontSizeMultiplier }]}>
                                {action.description}
                            </Text>
                        </View>
                        <ChevronRight size={20} color="#9ca3af" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    greeting: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#9ca3af",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    mainCTA: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#3b82f6",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    mainCTAContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    mainCTAIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    mainCTAText: {
        flex: 1,
    },
    mainCTATitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    mainCTASubtitle: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 16,
    },
    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 13,
        color: "#6b7280",
    },
});
