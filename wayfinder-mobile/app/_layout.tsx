import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { initI18n } from "@/i18n";
import "@/i18n"; // Ensure i18n is imported

export default function RootLayout() {
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    const init = async () => {
      try {
        await initI18n();
        setIsI18nReady(true);
      } catch (error) {
        console.error("Failed to initialize i18n:", error);
        setIsI18nReady(true); // Continue anyway with fallback
      }
    };
    init();
  }, []);

  // Show loading while i18n initializes
  if (!isI18nReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <OfflineIndicator />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="buildings"
            options={{
              title: "Buildings",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="buildings/[id]"
            options={{
              title: "Building Details",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="navigation"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="search"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="route/calculate"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="route/result"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="favorites"
            options={{
              title: "Favorites",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="recent"
            options={{
              title: "Recent",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="scanner"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
});
