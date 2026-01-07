/**
 * Scanner Screen
 * 
 * QR code scanner for location identification.
 * Rewritten to use new useScanner hook and components.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CameraView } from 'expo-camera';
import { Camera, QrCode, Navigation, X, RefreshCw, AlertCircle } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { useScanner } from '@/features/scanner';
import { useNavigationStore } from '@/features/navigation';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button, LoadingSpinner, Card } from '@/components/common';
import { NodeTypeIcon } from '@/components/node';
import { floorsApi } from '@/api';

export default function ScannerScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();

    const {
        permission,
        requestPermission,
        scannedNode,
        isScanning,
        isLoading,
        error,
        handleScan,
        resetScan,
    } = useScanner();

    const { startNode, endNode, setStartNode, setEndNode, setCurrentBuilding } = useNavigationStore();

    // State to store building ID from scanned node's floor
    const [scannedBuildingId, setScannedBuildingId] = useState<string | null>(null);

    // Fetch floor information when a node is scanned to get buildingId
    useEffect(() => {
        if (scannedNode?.floorId) {
            floorsApi.getById(scannedNode.floorId)
                .then(floor => {
                    setScannedBuildingId(floor.buildingId);
                })
                .catch(err => {
                    console.error('[Scanner] Failed to fetch floor info:', err);
                    setScannedBuildingId(null);
                });
        } else {
            setScannedBuildingId(null);
        }
    }, [scannedNode]);

    // Handle navigate from scanned location
    // Note: These hooks MUST be defined before any conditional returns
    // to comply with React's Rules of Hooks
    const handleNavigateFrom = useCallback(() => {
        if (scannedNode) {
            // Check if this node is already set as end node
            if (endNode && scannedNode.id === endNode.id) {
                // Can't set same node as both start and end - clear end node first
                setEndNode(null);
            }
            setStartNode(scannedNode);
            
            // Set building context for filtering search
            if (scannedBuildingId) {
                setCurrentBuilding(scannedBuildingId, scannedNode.floorId);
            }
            
            router.push('/navigation/select-end');
        }
    }, [scannedNode, endNode, scannedBuildingId, setStartNode, setEndNode, setCurrentBuilding, router]);

    const handleNavigateTo = useCallback(() => {
        if (scannedNode) {
            // Check if this node is already set as start node
            if (startNode && scannedNode.id === startNode.id) {
                // Can't set same node as both start and end - clear start node first
                setStartNode(null);
            }
            setEndNode(scannedNode);
            
            // Set building context for filtering search
            if (scannedBuildingId) {
                setCurrentBuilding(scannedBuildingId, scannedNode.floorId);
            }
            
            router.push('/navigation/select-start');
        }
    }, [scannedNode, startNode, scannedBuildingId, setStartNode, setEndNode, setCurrentBuilding, router]);

    // Auto-navigate if end node already selected
    // This handles the case where user is selecting start node via QR scan
    useEffect(() => {
        if (scannedNode && endNode && !startNode && scannedBuildingId) {
            // End node already selected, user is scanning for start node
            // Check if scanned node is different from end node
            if (scannedNode.id === endNode.id) {
                // Same node - don't auto-navigate, show the result screen
                return;
            }
            setStartNode(scannedNode);
            
            // Set building context
            setCurrentBuilding(scannedBuildingId, scannedNode.floorId);
            
            router.replace('/navigation/result');
        } else if (scannedNode && startNode && !endNode && scannedBuildingId) {
            // Start node already selected, user is scanning for end node
            // Check if scanned node is different from start node
            if (scannedNode.id === startNode.id) {
                // Same node - don't auto-navigate, show the result screen
                return;
            }
            setEndNode(scannedNode);
            
            // Set building context
            setCurrentBuilding(scannedBuildingId, scannedNode.floorId);
            
            router.replace('/navigation/result');
        }
    }, [scannedNode, endNode, startNode, scannedBuildingId, setStartNode, setEndNode, setCurrentBuilding, router]);

    // Check if we should auto-navigate (don't show location found screen)
    // Only auto-navigate if the scanned node is different from the already selected node
    const shouldAutoNavigate = 
        scannedNode && 
        ((startNode && !endNode && scannedNode.id !== startNode.id) ||
         (endNode && !startNode && scannedNode.id !== endNode.id));

    // Permission request view
    if (!permission?.granted) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.permissionCard}>
                    <View style={styles.permissionIcon}>
                        <Camera size={48} color={theme.colors.primary[500]} />
                    </View>
                    <Text style={[styles.permissionTitle, { fontSize: 20 * fontSizeMultiplier }]}>
                        {t('scanner.cameraPermission', 'Camera Permission Required')}
                    </Text>
                    <Text style={[styles.permissionDesc, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t(
                            'scanner.cameraPermissionDesc',
                            'We need camera access to scan QR codes and identify your location.'
                        )}
                    </Text>
                    <Button
                        title={t('scanner.allowCamera', 'Allow Camera Access')}
                        variant="primary"
                        size="large"
                        onPress={requestPermission}
                        fullWidth
                    />
                </View>
            </View>
        );
    }

    // Show scanned node result ONLY if we're not auto-navigating
    // If start or end node is already selected, skip this screen and auto-navigate
    if (scannedNode && !shouldAutoNavigate) {
        return (
            <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                    <TouchableOpacity style={styles.closeButton} onPress={resetScan}>
                        <X size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.resultTitle, { fontSize: 18 * fontSizeMultiplier }]}>
                        {t('scanner.locationFound', 'Location Found!')}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.nodeCard}>
                    <NodeTypeIcon
                        nodeType={scannedNode.nodeType}
                        size={28}
                        showBackground
                    />
                    <View style={styles.nodeInfo}>
                        <Text style={[styles.nodeName, { fontSize: 20 * fontSizeMultiplier }]}>
                            {scannedNode.name || 'Unnamed Location'}
                        </Text>
                        {scannedNode.qrCode && (
                            <View style={styles.qrCodeRow}>
                                <QrCode size={14} color={theme.colors.textTertiary} />
                                <Text style={[styles.qrCode, { fontSize: 12 * fontSizeMultiplier }]}>
                                    {scannedNode.qrCode}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Warning if this location is already selected */}
                {((startNode && scannedNode.id === startNode.id) || 
                  (endNode && scannedNode.id === endNode.id)) && (
                    <View style={styles.warningBanner}>
                        <AlertCircle size={20} color={theme.colors.warning[600]} />
                        <Text style={[styles.warningText, { fontSize: 14 * fontSizeMultiplier }]}>
                            {startNode && scannedNode.id === startNode.id
                                ? t('scanner.alreadyStartNode', 'This location is already set as your starting point')
                                : t('scanner.alreadyEndNode', 'This location is already set as your destination')}
                        </Text>
                    </View>
                )}

                <View style={styles.actionButtons}>
                    <Button
                        title={t('scanner.navigateFrom', 'Navigate From Here')}
                        variant="outline"
                        size="large"
                        onPress={handleNavigateFrom}
                        fullWidth
                        leftIcon={<Navigation size={18} color={theme.colors.primary[500]} />}
                    />
                    <Button
                        title={t('scanner.navigateTo', 'Navigate To Here')}
                        variant="primary"
                        size="large"
                        onPress={handleNavigateTo}
                        fullWidth
                        leftIcon={<Navigation size={18} color="#fff" />}
                    />
                </View>

                <TouchableOpacity style={styles.scanAgainButton} onPress={resetScan}>
                    <RefreshCw size={18} color={theme.colors.primary[500]} />
                    <Text style={[styles.scanAgainText, { fontSize: 14 * fontSizeMultiplier }]}>
                        {t('scanner.scanAgain', 'Scan Another QR Code')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Camera view with overlay
    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={isScanning ? handleScan : undefined}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Top section */}
                <View style={styles.overlayTop}>
                    <Text style={[styles.instructions, { fontSize: 16 * fontSizeMultiplier }]}>
                        {t('scanner.instructions', 'Point at a Wayfinder QR code')}
                    </Text>
                </View>

                {/* Scan frame */}
                <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                </View>

                {/* Bottom section */}
                <View style={styles.overlayBottom}>
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <LoadingSpinner size="small" color="#fff" message={t('scanner.identifying', 'Identifying...')} />
                        </View>
                    )}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={[styles.errorText, { fontSize: 14 * fontSizeMultiplier }]}>
                                {error}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    overlayTop: {
        paddingTop: theme.layout.safeAreaTop + theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingBottom: theme.spacing.xl,
    },
    instructions: {
        ...theme.textStyles.body,
        color: '#fff',
        textAlign: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        alignSelf: 'center',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: theme.colors.primary[400],
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
    overlayBottom: {
        paddingBottom: theme.layout.tabBarHeight + theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingTop: theme.spacing.xl,
    },
    loadingContainer: {
        padding: theme.spacing.md,
    },
    errorContainer: {
        backgroundColor: theme.colors.error[500],
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    errorText: {
        ...theme.textStyles.bodySmall,
        color: '#fff',
        textAlign: 'center',
    },

    // Permission screen
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    permissionCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        alignItems: 'center',
        maxWidth: 340,
        ...getShadowStyle('md'),
    },
    permissionIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    permissionTitle: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    permissionDesc: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },

    // Result screen
    resultContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: theme.layout.safeAreaTop,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    closeButton: {
        padding: theme.spacing.sm,
    },
    resultTitle: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
    },
    nodeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: theme.spacing.md,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.md,
        ...getShadowStyle('md'),
    },
    nodeInfo: {
        flex: 1,
    },
    nodeName: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    qrCodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    qrCode: {
        ...theme.textStyles.caption,
        color: theme.colors.textTertiary,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.warning[50],
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.warning[200],
        gap: theme.spacing.sm,
    },
    warningText: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.warning[800],
        flex: 1,
    },
    actionButtons: {
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    scanAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    scanAgainText: {
        ...theme.textStyles.label,
        color: theme.colors.primary[500],
    },
});
