/**
 * Tab Layout
 * 
 * Main tab navigation with 5 tabs:
 * Home, Explore, Scanner, Profile
 */

import { Tabs } from "expo-router";
import { Home, Search, QrCode, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, Platform } from "react-native";
import { theme, getShadowStyle } from "@/theme";

export default function TabLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary[500],
                tabBarInactiveTintColor: theme.colors.neutral[400],
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIconStyle: styles.tabBarIcon,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("tabs.home", "Home"),
                    tabBarIcon: ({ color, size }) => (
                        <Home size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: t("tabs.explore", "Explore"),
                    tabBarIcon: ({ color, size }) => (
                        <Search size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scanner"
                options={{
                    title: t("tabs.scanner", "Scan"),
                    tabBarIcon: ({ color, size }) => (
                        <QrCode size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t("tabs.profile", "Profile"),
                    tabBarIcon: ({ color, size }) => (
                        <User size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: theme.colors.backgroundCard,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        height: theme.layout.tabBarHeight,
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? 20 : 8,
        ...getShadowStyle("tabBar"),
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
    tabBarIcon: {
        marginBottom: -2,
    },
});
