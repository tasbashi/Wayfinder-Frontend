import React from "react";
import { Tabs } from "expo-router";
import { Home, Map, ScanLine, Settings } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray[400],
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.gray[200],
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 64,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Ana Sayfa",
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Keşfet",
                    tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: "Tara",
                    tabBarIcon: ({ color, size }) => <ScanLine size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Ayarlar",
                    tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
