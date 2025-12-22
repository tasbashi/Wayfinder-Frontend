import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Modal,
    Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLanguage } from "@/hooks/useLanguage";
import { initializeVoiceNavigation } from "@/utils/voiceNavigation";
import {
    Eye,
    Type,
    Volume2,
    Smartphone,
    Globe,
    ChevronRight,
    Check,
    Info,
    HelpCircle,
} from "lucide-react-native";

export default function SettingsTab() {
    const { t } = useTranslation();
    const { settings, updateSettings, isScreenReaderEnabled, fontSizeMultiplier } =
        useAccessibility();
    const { currentLanguage, setLanguage, supportedLanguages, getCurrentLanguageInfo } =
        useLanguage();
    const [localSettings, setLocalSettings] = useState(settings);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        initializeVoiceNavigation(localSettings.voiceNavigation);
    }, [localSettings.voiceNavigation]);

    async function handleToggle(setting: keyof typeof settings) {
        const updated = { ...localSettings, [setting]: !localSettings[setting] };
        setLocalSettings(updated);
        await updateSettings({ [setting]: updated[setting] });
    }

    async function handleLanguageChange(langCode: string) {
        await setLanguage(langCode as "en" | "tr");
        setShowLanguageModal(false);
    }

    const currentLangInfo = getCurrentLanguageInfo();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { fontSize: 28 * fontSizeMultiplier }]}>
                    {t("settings.title")}
                </Text>
            </View>

            {/* Language Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("settings.language")}
                </Text>
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => setShowLanguageModal(true)}
                >
                    <View style={styles.settingInfo}>
                        <View style={styles.settingIcon}>
                            <Globe size={20} color="#3b82f6" />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                {t("settings.selectLanguage")}
                            </Text>
                            <Text style={[styles.settingValue, { fontSize: 14 * fontSizeMultiplier }]}>
                                {currentLangInfo.nativeName}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            {/* Display Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("settings.display")}
                </Text>

                {/* High Contrast */}
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <View style={[styles.settingIcon, localSettings.highContrast && styles.settingIconActive]}>
                            <Eye size={20} color={localSettings.highContrast ? "#3b82f6" : "#6b7280"} />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                {t("settings.highContrast")}
                            </Text>
                            <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                                {t("settings.highContrastDesc")}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={localSettings.highContrast}
                        onValueChange={() => handleToggle("highContrast")}
                        trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
                        thumbColor={localSettings.highContrast ? "#3b82f6" : "#f4f3f4"}
                    />
                </View>

                {/* Larger Text */}
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <View style={[styles.settingIcon, localSettings.largerText && styles.settingIconActive]}>
                            <Type size={20} color={localSettings.largerText ? "#3b82f6" : "#6b7280"} />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                {t("settings.largerText")}
                            </Text>
                            <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                                {t("settings.largerTextDesc")}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={localSettings.largerText}
                        onValueChange={() => handleToggle("largerText")}
                        trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
                        thumbColor={localSettings.largerText ? "#3b82f6" : "#f4f3f4"}
                    />
                </View>
            </View>

            {/* Navigation Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("settings.navigation")}
                </Text>

                {/* Voice Navigation */}
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <View style={[styles.settingIcon, localSettings.voiceNavigation && styles.settingIconActive]}>
                            <Volume2 size={20} color={localSettings.voiceNavigation ? "#3b82f6" : "#6b7280"} />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                {t("settings.voiceNavigation")}
                            </Text>
                            <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                                {t("settings.voiceNavigationDesc")}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={localSettings.voiceNavigation}
                        onValueChange={() => handleToggle("voiceNavigation")}
                        trackColor={{ false: "#e5e7eb", true: "#93c5fd" }}
                        thumbColor={localSettings.voiceNavigation ? "#3b82f6" : "#f4f3f4"}
                    />
                </View>
            </View>

            {/* Screen Reader Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("settings.screenReader")}
                </Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <View style={[styles.settingIcon, isScreenReaderEnabled && styles.settingIconSuccess]}>
                            <Smartphone size={20} color={isScreenReaderEnabled ? "#10b981" : "#6b7280"} />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                {t("settings.screenReader")}
                            </Text>
                            <Text style={[styles.settingDescription, { fontSize: 14 * fontSizeMultiplier }]}>
                                {isScreenReaderEnabled
                                    ? t("settings.screenReaderActive")
                                    : t("settings.screenReaderInactive")}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: isScreenReaderEnabled ? "#10b981" : "#9ca3af" },
                        ]}
                    />
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoCard}>
                <Info size={20} color="#3b82f6" />
                <Text style={[styles.infoText, { fontSize: 14 * fontSizeMultiplier }]}>
                    {t("settings.settingsInfo")}
                </Text>
            </View>

            {/* Language Modal */}
            <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowLanguageModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { fontSize: 20 * fontSizeMultiplier }]}>
                            {t("settings.selectLanguage")}
                        </Text>
                        {supportedLanguages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    currentLanguage === lang.code && styles.languageOptionActive,
                                ]}
                                onPress={() => handleLanguageChange(lang.code)}
                            >
                                <View>
                                    <Text
                                        style={[
                                            styles.languageName,
                                            { fontSize: 16 * fontSizeMultiplier },
                                            currentLanguage === lang.code && styles.languageNameActive,
                                        ]}
                                    >
                                        {lang.nativeName}
                                    </Text>
                                    <Text style={[styles.languageCode, { fontSize: 14 * fontSizeMultiplier }]}>
                                        {lang.name}
                                    </Text>
                                </View>
                                {currentLanguage === lang.code && (
                                    <Check size={20} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    content: {
        paddingBottom: 32,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 0.5,
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
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    settingIconActive: {
        backgroundColor: "#eff6ff",
    },
    settingIconSuccess: {
        backgroundColor: "#f0fdf4",
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    settingValue: {
        fontSize: 14,
        color: "#3b82f6",
        fontWeight: "500",
    },
    settingDescription: {
        fontSize: 14,
        color: "#6b7280",
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    infoCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        backgroundColor: "#eff6ff",
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: "#1e40af",
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 340,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 20,
        textAlign: "center",
    },
    languageOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: "#f9fafb",
    },
    languageOptionActive: {
        backgroundColor: "#eff6ff",
    },
    languageName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    languageNameActive: {
        color: "#3b82f6",
    },
    languageCode: {
        fontSize: 14,
        color: "#6b7280",
    },
});
