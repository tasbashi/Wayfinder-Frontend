/**
 * Profile/Settings Screen
 * 
 * Settings and accessibility options.
 * Rewritten to use new useSettings hook and components.
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme, getShadowStyle } from '@/theme';
import { useSettings } from '@/features/settings';
import { LargeHeader } from '@/components/common';
import {
    Eye,
    Type,
    Volume2,
    Smartphone,
    Globe,
    ChevronRight,
    Check,
    Info,
} from 'lucide-react-native';

export default function ProfileScreen() {
    const { t } = useTranslation();
    const {
        settings,
        isScreenReaderEnabled,
        fontSizeMultiplier,
        currentLanguage,
        supportedLanguages,
        updateSetting,
        changeLanguage,
        getCurrentLanguageInfo,
    } = useSettings();

    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const currentLangInfo = getCurrentLanguageInfo();

    // Setting toggle handler
    const handleToggle = useCallback(
        async (key: 'highContrast' | 'largerText' | 'voiceNavigation') => {
            await updateSetting(key, !settings[key]);
        },
        [settings, updateSetting]
    );

    // Language change handler
    const handleLanguageChange = useCallback(
        async (langCode: string) => {
            await changeLanguage(langCode as 'en' | 'tr');
            setShowLanguageModal(false);
        },
        [changeLanguage]
    );

    return (
        <View style={styles.container}>
            <LargeHeader title={t('settings.title', 'Settings')} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Language Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t('settings.language', 'Language')}
                    </Text>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => setShowLanguageModal(true)}
                    >
                        <View style={styles.settingInfo}>
                            <View style={styles.settingIcon}>
                                <Globe size={20} color={theme.colors.primary[500]} />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                    {t('settings.selectLanguage', 'Language')}
                                </Text>
                                <Text style={[styles.settingValue, { fontSize: 14 * fontSizeMultiplier }]}>
                                    {currentLangInfo.nativeName}
                                </Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                {/* Display Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t('settings.display', 'Display')}
                    </Text>

                    {/* High Contrast */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    settings.highContrast && styles.settingIconActive,
                                ]}
                            >
                                <Eye
                                    size={20}
                                    color={settings.highContrast ? theme.colors.primary[500] : theme.colors.textTertiary}
                                />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                    {t('settings.highContrast', 'High Contrast')}
                                </Text>
                                <Text style={[styles.settingDesc, { fontSize: 14 * fontSizeMultiplier }]}>
                                    {t('settings.highContrastDesc', 'Increase visibility with higher contrast')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={settings.highContrast}
                            onValueChange={() => handleToggle('highContrast')}
                            trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[300] }}
                            thumbColor={settings.highContrast ? theme.colors.primary[500] : theme.colors.neutral[50]}
                        />
                    </View>

                    {/* Larger Text */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    settings.largerText && styles.settingIconActive,
                                ]}
                            >
                                <Type
                                    size={20}
                                    color={settings.largerText ? theme.colors.primary[500] : theme.colors.textTertiary}
                                />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                    {t('settings.largerText', 'Larger Text')}
                                </Text>
                                <Text style={[styles.settingDesc, { fontSize: 14 * fontSizeMultiplier }]}>
                                    {t('settings.largerTextDesc', 'Increase text size for better readability')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={settings.largerText}
                            onValueChange={() => handleToggle('largerText')}
                            trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[300] }}
                            thumbColor={settings.largerText ? theme.colors.primary[500] : theme.colors.neutral[50]}
                        />
                    </View>
                </View>

                {/* Navigation Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t('settings.navigation', 'Navigation')}
                    </Text>

                    {/* Voice Navigation */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    settings.voiceNavigation && styles.settingIconActive,
                                ]}
                            >
                                <Volume2
                                    size={20}
                                    color={settings.voiceNavigation ? theme.colors.primary[500] : theme.colors.textTertiary}
                                />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                    {t('settings.voiceNavigation', 'Voice Navigation')}
                                </Text>
                                <Text style={[styles.settingDesc, { fontSize: 14 * fontSizeMultiplier }]}>
                                    {t('settings.voiceNavigationDesc', 'Speak turn-by-turn directions aloud')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={settings.voiceNavigation}
                            onValueChange={() => handleToggle('voiceNavigation')}
                            trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[300] }}
                            thumbColor={settings.voiceNavigation ? theme.colors.primary[500] : theme.colors.neutral[50]}
                        />
                    </View>
                </View>

                {/* Screen Reader Status */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t('settings.accessibility', 'Accessibility')}
                    </Text>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <View
                                style={[
                                    styles.settingIcon,
                                    isScreenReaderEnabled && styles.settingIconSuccess,
                                ]}
                            >
                                <Smartphone
                                    size={20}
                                    color={isScreenReaderEnabled ? theme.colors.success[500] : theme.colors.textTertiary}
                                />
                            </View>
                            <View style={styles.settingText}>
                                <Text style={[styles.settingLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                                    {t('settings.screenReader', 'Screen Reader')}
                                </Text>
                                <Text style={[styles.settingDesc, { fontSize: 14 * fontSizeMultiplier }]}>
                                    {isScreenReaderEnabled
                                        ? t('settings.screenReaderActive', 'Screen reader is active')
                                        : t('settings.screenReaderInactive', 'No screen reader detected')}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: isScreenReaderEnabled ? theme.colors.success[500] : theme.colors.neutral[400] },
                            ]}
                        />
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Info size={20} color={theme.colors.primary[500]} />
                    <Text style={[styles.infoText, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t('settings.settingsInfo', 'Settings are saved automatically and will persist across app restarts.')}
                    </Text>
                </View>
            </ScrollView>

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
                            {t('settings.selectLanguage', 'Select Language')}
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
                                    <Check size={20} color={theme.colors.primary[500]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.spacing.xxl,
    },
    section: {
        backgroundColor: theme.colors.backgroundCard,
        marginTop: theme.spacing.md,
        marginHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...getShadowStyle('sm'),
    },
    sectionTitle: {
        ...theme.textStyles.labelSmall,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: theme.spacing.md,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    settingInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    settingIcon: {
        width: 44,
        height: 44,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingIconActive: {
        backgroundColor: theme.colors.primary[50],
    },
    settingIconSuccess: {
        backgroundColor: theme.colors.success[50],
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        ...theme.textStyles.labelLarge,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    settingValue: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.primary[500],
        fontWeight: '500',
    },
    settingDesc: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.textSecondary,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.primary[50],
        marginTop: theme.spacing.md,
        marginHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    infoText: {
        flex: 1,
        ...theme.textStyles.bodySmall,
        color: theme.colors.primary[800],
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    modalContent: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        width: '100%',
        maxWidth: 340,
        ...getShadowStyle('lg'),
    },
    modalTitle: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.neutral[50],
    },
    languageOptionActive: {
        backgroundColor: theme.colors.primary[50],
    },
    languageName: {
        ...theme.textStyles.labelLarge,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    languageNameActive: {
        color: theme.colors.primary[500],
    },
    languageCode: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.textSecondary,
    },
});
