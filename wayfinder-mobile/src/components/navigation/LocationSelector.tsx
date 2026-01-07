/**
 * LocationSelector Component
 * 
 * Shared component for selecting start/end locations.
 * Includes search, recent, and QR scan options.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { QrCode, MapPin, Clock, Search } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { useSearch } from '@/features/search';
import { NodeDto } from '@/api/types';
import { NodeCard } from '@/components/node';
import { SearchInput, EmptyState, LoadingSpinner } from '@/components/common';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface LocationSelectorProps {
    /** Type of selection (for title/messaging) */
    type: 'start' | 'end';
    /** Called when location is selected */
    onSelect: (node: NodeDto) => void;
    /** Building ID to filter by */
    buildingId?: string;
    /** Floor ID to filter by */
    floorId?: string;
    /** Current location (to exclude from selection) */
    excludeNodeId?: string;
    /** Recent locations */
    recentLocations?: NodeDto[];
    /** Show scan QR button */
    showScanQR?: boolean;
    /** Current selected node (optional) */
    selectedNode?: NodeDto | null;
}

export function LocationSelector({
    type,
    onSelect,
    buildingId,
    floorId,
    excludeNodeId,
    recentLocations = [],
    showScanQR = true,
    selectedNode,
}: LocationSelectorProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    const {
        query,
        results,
        isLoading,
        setQuery,
    } = useSearch({ buildingId, floorId });

    const [showResults, setShowResults] = useState(false);

    // Handle search input change
    const handleSearch = useCallback(
        (text: string) => {
            setQuery(text);
            setShowResults(text.length >= 2);
        },
        [setQuery]
    );

    // Handle node selection
    const handleNodePress = useCallback(
        (node: NodeDto) => {
            onSelect(node);
        },
        [onSelect]
    );

    // Go to scanner
    const handleScanQR = useCallback(() => {
        router.push('/(tabs)/scanner');
    }, [router]);

    // Filter results to exclude current node
    const filteredResults = excludeNodeId
        ? results.filter((node) => node.id !== excludeNodeId)
        : results;

    // Filter recent to exclude current node
    const filteredRecent = excludeNodeId
        ? recentLocations.filter((node) => node.id !== excludeNodeId)
        : recentLocations;

    const title =
        type === 'start'
            ? t('navigation.selectStart', 'Where are you?')
            : t('navigation.selectEnd', 'Where do you want to go?');

    return (
        <View style={styles.container}>
            {/* Title */}
            <Text style={[styles.title, { fontSize: 20 * fontSizeMultiplier }]}>
                {title}
            </Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <SearchInput
                    value={query}
                    onSearch={handleSearch}
                    placeholder={t('navigation.searchPlaceholder', 'Search for a location...')}
                    isLoading={isLoading}
                    autoFocus
                />
            </View>

            {/* Scan QR Button */}
            {showScanQR && !showResults && (
                <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
                    <View style={styles.scanIcon}>
                        <QrCode size={24} color={theme.colors.primary[500]} />
                    </View>
                    <View style={styles.scanContent}>
                        <Text style={[styles.scanTitle, { fontSize: 16 * fontSizeMultiplier }]}>
                            {t('navigation.scanQR', 'Scan QR Code')}
                        </Text>
                        <Text style={[styles.scanDesc, { fontSize: 14 * fontSizeMultiplier }]}>
                            {t('navigation.scanQRDesc', 'Quickly find your location')}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Search Results */}
            {showResults ? (
                <View style={styles.resultsContainer}>
                    {isLoading ? (
                        <LoadingSpinner message={t('common.searching', 'Searching...')} />
                    ) : filteredResults.length > 0 ? (
                        <FlatList
                            data={filteredResults}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <NodeCard
                                    node={item}
                                    onPress={() => handleNodePress(item)}
                                    compact
                                    showArrow={false}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <EmptyState
                            icon={<Search size={40} color={theme.colors.textTertiary} />}
                            title={t('navigation.noResults', 'No Results')}
                            description={t('navigation.noResultsDesc', 'Try a different search term')}
                        />
                    )}
                </View>
            ) : (
                <>
                    {/* Recent Locations */}
                    {filteredRecent.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Clock size={16} color={theme.colors.textSecondary} />
                                <Text style={[styles.sectionTitle, { fontSize: 14 * fontSizeMultiplier }]}>
                                    {t('navigation.recent', 'Recent')}
                                </Text>
                            </View>
                            {filteredRecent.slice(0, 5).map((node) => (
                                <NodeCard
                                    key={node.id}
                                    node={node}
                                    onPress={() => handleNodePress(node)}
                                    compact
                                    showArrow={false}
                                />
                            ))}
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary[50],
        marginHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...getShadowStyle('sm'),
    },
    scanIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    scanContent: {
        flex: 1,
    },
    scanTitle: {
        ...theme.textStyles.label,
        color: theme.colors.primary[700],
        marginBottom: 2,
    },
    scanDesc: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.primary[600],
    },
    resultsContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.xxl,
    },
    section: {
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
        ...theme.textStyles.labelSmall,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
