/**
 * NavigationBottomSheet
 * 
 * Draggable bottom panel containing navigation instructions and controls.
 */

import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { StopCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { RouteNodeDto } from '@/api/types';
import { theme } from '@/theme';
import { PrimaryInstruction } from './PrimaryInstruction';
import { NextStepPreview } from './NextStepPreview';
import { NavigationStats } from './NavigationStats';
import { Button } from '../common';

interface NavigationBottomSheetProps {
    /** Current route node */
    currentNode: RouteNodeDto;
    /** Next route node (if available) */
    nextNode?: RouteNodeDto;
    /** Current step index (0-based) */
    currentStepIndex: number;
    /** Total steps */
    totalSteps: number;
    /** Remaining time in seconds */
    remainingTimeSeconds: number;
    /** Remaining distance in meters */
    remainingDistance: number;
    /** Distance to next waypoint */
    distanceToNext: number;
    /** Called when next step preview is tapped */
    onNextStepPress?: () => void;
    /** Called when end route is pressed */
    onEndRoute: () => void;
}

export function NavigationBottomSheet({
    currentNode,
    nextNode,
    currentStepIndex,
    totalSteps,
    remainingTimeSeconds,
    remainingDistance,
    distanceToNext,
    onNextStepPress,
    onEndRoute,
}: NavigationBottomSheetProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Bottom sheet ref
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Snap points - percentages of screen height
    // Small: Just shows primary instruction (~25%)
    // Medium: Shows primary + next step + stats (~45%)
    // Large: Fully expanded with more space (~70%)
    const snapPoints = useMemo(() => ['25%', '45%', '70%'], []);

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={1} // Start at medium position
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            handleIndicatorStyle={{
                backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.3)'
                    : theme.colors.neutral[400],
            }}
            backgroundStyle={{
                backgroundColor: isDark ? '#1c1d27' : '#ffffff',
            }}
            style={styles.bottomSheet}
        >
            <BottomSheetScrollView
                contentContainerStyle={[
                    styles.contentContainer,
                    {
                        paddingBottom: insets.bottom + theme.spacing.lg,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Primary Instruction */}
                <PrimaryInstruction
                    routeNode={currentNode}
                    distance={distanceToNext}
                />

                {/* Next Step Preview */}
                {nextNode && (
                    <NextStepPreview
                        routeNode={nextNode}
                        onPress={onNextStepPress}
                    />
                )}

                {/* Stats & Progress */}
                <NavigationStats
                    remainingTimeSeconds={remainingTimeSeconds}
                    remainingDistance={remainingDistance}
                    currentStep={currentStepIndex}
                    totalSteps={totalSteps}
                />

                {/* End Route Button */}
                <Button
                    title={t('navigation.endRoute', 'End Route')}
                    variant='primary'
                    style={styles.endButton}
                    onPress={onEndRoute}
                    accessibilityLabel={t('navigation.endRoute', 'End Route')}
                    accessibilityRole="button"
                    rightIcon={<StopCircle size={25} color={theme.colors.error[300]} />}
                />
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    bottomSheet: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        zIndex: 30,
    },
    contentContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        gap: theme.spacing.lg,
    },
    endButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        minHeight: 56,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.xs,
    },
    endButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.error[400],
    },
});
