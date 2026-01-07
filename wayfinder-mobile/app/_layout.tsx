import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" />
            <Stack.Screen name="buildings" />
            <Stack.Screen name="navigation" />
          </Stack>
        </AccessibilityProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
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
