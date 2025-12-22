import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { initializeVoiceNavigation } from "@/utils/voiceNavigation";
import { ArrowLeft, Eye, Type, Volume2, Smartphone } from "lucide-react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, isScreenReaderEnabled, fontSizeMultiplier } =
    useAccessibility();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    // Initialize voice navigation when setting changes
    initializeVoiceNavigation(localSettings.voiceNavigation);
  }, [localSettings.voiceNavigation]);

  async function handleToggle(setting: keyof typeof settings) {
    const updated = { ...localSettings, [setting]: !localSettings[setting] };
    setLocalSettings(updated);
    await updateSettings({ [setting]: updated[setting] });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: 24 * fontSizeMultiplier }]}>
          Accessibility Settings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: 18 * fontSizeMultiplier }]}>
          Display
        </Text>

        {/* High Contrast */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Eye size={20} color={localSettings.highContrast ? "#3b82f6" : "#6b7280"} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                High Contrast Mode
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                Increase contrast for better visibility
              </Text>
            </View>
          </View>
          <Switch
            value={localSettings.highContrast}
            onValueChange={() => handleToggle("highContrast")}
            accessibilityLabel="Toggle high contrast mode"
            accessibilityRole="switch"
          />
        </View>

        {/* Larger Text */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Type size={20} color={localSettings.largerText ? "#3b82f6" : "#6b7280"} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                Larger Text
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                Increase text size by 30%
              </Text>
            </View>
          </View>
          <Switch
            value={localSettings.largerText}
            onValueChange={() => handleToggle("largerText")}
            accessibilityLabel="Toggle larger text"
            accessibilityRole="switch"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: 18 * fontSizeMultiplier }]}>
          Navigation
        </Text>

        {/* Voice Navigation */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Volume2 size={20} color={localSettings.voiceNavigation ? "#3b82f6" : "#6b7280"} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                Voice Navigation
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                Hear turn-by-turn instructions aloud
              </Text>
            </View>
          </View>
          <Switch
            value={localSettings.voiceNavigation}
            onValueChange={() => handleToggle("voiceNavigation")}
            accessibilityLabel="Toggle voice navigation"
            accessibilityRole="switch"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: 18 * fontSizeMultiplier }]}>
          Screen Reader
        </Text>

        {/* Screen Reader Status */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Smartphone
                size={20}
                color={isScreenReaderEnabled ? "#10b981" : "#6b7280"}
              />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                Screen Reader
              </Text>
              <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                {isScreenReaderEnabled
                  ? "Screen reader is active"
                  : "Screen reader is not active"}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isScreenReaderEnabled ? "#10b981" : "#9ca3af" },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.infoText, { fontSize: 14 * fontSizeMultiplier }]}>
          These settings help make the app more accessible. Changes are saved automatically.
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
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    padding: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoSection: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
});

