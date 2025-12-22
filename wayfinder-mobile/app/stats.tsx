import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Navigation, MapPin, Clock, Footprints } from "lucide-react-native";
import { Storage } from "@/utils/storage";

interface UserStats {
    routesCalculated: number;
    distanceTraveled: number; // in meters
    buildingsVisited: number;
    timeSaved: number; // in minutes (estimated)
}

export default function StatsScreen() {
    const [stats, setStats] = useState<UserStats>({
        routesCalculated: 0,
        distanceTraveled: 0,
        buildingsVisited: 0,
        timeSaved: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            setIsLoading(true);
            // In a real app, we would calculate this from stored history
            // For now, we'll mock it based on recent searches count
            const recent = await Storage.getRecentSearches();
            const favorites = await Storage.getFavorites();

            // Mock calculations
            const routesCount = recent.length * 3 + 12; // Mock multiplier
            setStats({
                routesCalculated: routesCount,
                distanceTraveled: routesCount * 150, // Avg 150m per route
                buildingsVisited: new Set(recent.map(r => r.buildingName)).size + 2,
                timeSaved: Math.round(routesCount * 2.5), // Avg 2.5 mins saved per route
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Activity</Text>
                <Text style={styles.subtitle}>
                    Track your navigation history and savings
                </Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: "#dbeafe" }]}>
                        <Navigation size={24} color="#2563eb" />
                    </View>
                    <Text style={styles.cardValue}>{stats.routesCalculated}</Text>
                    <Text style={styles.cardLabel}>Routes Taken</Text>
                </View>

                <View style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: "#dcfce7" }]}>
                        <Footprints size={24} color="#16a34a" />
                    </View>
                    <Text style={styles.cardValue}>
                        {(stats.distanceTraveled / 1000).toFixed(1)}km
                    </Text>
                    <Text style={styles.cardLabel}>Distance Walked</Text>
                </View>

                <View style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: "#f3e8ff" }]}>
                        <MapPin size={24} color="#9333ea" />
                    </View>
                    <Text style={styles.cardValue}>{stats.buildingsVisited}</Text>
                    <Text style={styles.cardLabel}>Buildings Visited</Text>
                </View>

                <View style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: "#ffedd5" }]}>
                        <Clock size={24} color="#ea580c" />
                    </View>
                    <Text style={styles.cardValue}>{stats.timeSaved}m</Text>
                    <Text style={styles.cardLabel}>Time Saved</Text>
                </View>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Did you know?</Text>
                <Text style={styles.infoText}>
                    Using Wayfinder saves an average of 2.5 minutes per trip compared to
                    traditional signage navigation.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        padding: 24,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
    },
    grid: {
        padding: 16,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "47%", // Slightly less than 50% to account for gap
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: "center",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    infoSection: {
        margin: 16,
        padding: 20,
        backgroundColor: "#eff6ff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#dbeafe",
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e40af",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: "#1e3a8a",
        lineHeight: 20,
    },
});
