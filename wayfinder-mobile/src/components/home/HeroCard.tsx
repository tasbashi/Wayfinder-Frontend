/**
 * HeroCard Component
 * 
 * Main hero section for the home screen.
 */

import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Navigation, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, getShadowStyle } from '@/theme';
import { Button } from '@/components/common';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';

interface HeroCardProps {
    /** Start navigation button handler */
    onStartNavigation: () => void;
    /** Current location text */
    currentLocation?: string;
}

export function HeroCard({ onStartNavigation, currentLocation }: HeroCardProps) {
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Navigation size={28} color="#fff" />
                        </View>
                        <View>
                            <Text style={[styles.title, { fontSize: 24 * fontSizeMultiplier }]}>
                                {t('home.heroTitle', 'Find Your Way')}
                            </Text>
                            <Text style={[styles.subtitle, { fontSize: 14 * fontSizeMultiplier }]}>
                                {t('home.heroSubtitle', 'Indoor navigation made easy')}
                            </Text>
                        </View>
                    </View>

                    {currentLocation && (
                        <View style={styles.locationRow}>
                            <MapPin size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={[styles.locationText, { fontSize: 13 * fontSizeMultiplier }]}>
                                {currentLocation}
                            </Text>
                        </View>
                    )}

                    <Button
                        title={t('home.startNavigation', 'Start Navigation')}
                        variant="secondary"
                        size="large"
                        onPress={onStartNavigation}
                        fullWidth
                        leftIcon={<Navigation size={18} color={theme.colors.primary[600]} />}
                    />
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.md,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        ...getShadowStyle('hero'),
    },
    gradient: {
        borderRadius: theme.borderRadius.xl,
    },
    content: {
        padding: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius.md,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...theme.textStyles.h2,
        color: '#fff',
    },
    subtitle: {
        ...theme.textStyles.body,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    locationText: {
        ...theme.textStyles.bodySmall,
        color: 'rgba(255,255,255,0.9)',
        flex: 1,
    },
});
