import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { NodeService } from "@/api/node.service";
import { NodeDto } from "@/types/node.types";
import { Camera, Navigation, RefreshCw } from "lucide-react-native";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export default function ScannerTab() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scannedNode, setScannedNode] = useState<NodeDto | null>(null);
    const router = useRouter();
    const { t } = useTranslation();
    const { fontSizeMultiplier } = useAccessibility();
    const lastScannedRef = useRef<string | null>(null);

    async function handleBarCodeScanned(result: BarcodeScanningResult) {
        if (scanned || isLoading) return;

        // Prevent duplicate scans of the same QR code
        if (lastScannedRef.current === result.data) return;
        lastScannedRef.current = result.data;

        setScanned(true);
        setIsLoading(true);

        try {
            const node = await NodeService.scanQRCode(result.data);
            setScannedNode(node);
        } catch (error) {
            Alert.alert(
                t("common.error"),
                error instanceof Error
                    ? error.message
                    : "Failed to identify node from QR code"
            );
            setScanned(false);
            lastScannedRef.current = null;
        } finally {
            setIsLoading(false);
        }
    }

    function handleNavigate() {
        if (scannedNode) {
            router.push({
                pathname: "/route/calculate",
                params: { startNodeId: scannedNode.id },
            });
        }
    }

    function handleScanAgain() {
        setScanned(false);
        setScannedNode(null);
        lastScannedRef.current = null;
    }

    // Requesting permission
    if (!permission) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={[styles.description, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("common.loading")}
                </Text>
            </View>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.iconCircle}>
                    <Camera size={48} color="#6b7280" />
                </View>
                <Text style={[styles.title, { fontSize: 24 * fontSizeMultiplier }]}>
                    {t("scanner.permissionRequired")}
                </Text>
                <Text style={[styles.description, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("scanner.permissionDesc")}
                </Text>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.primaryButtonText}>
                        {t("scanner.grantPermission")}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Node scanned successfully
    if (scannedNode) {
        return (
            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={[styles.successLabel, { fontSize: 16 * fontSizeMultiplier }]}>
                    {t("scanner.youAreAt")}
                </Text>
                <Text style={[styles.nodeName, { fontSize: 28 * fontSizeMultiplier }]}>
                    {scannedNode.name}
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleNavigate}
                    >
                        <Navigation size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>
                            {t("scanner.navigateFrom")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleScanAgain}
                    >
                        <RefreshCw size={20} color="#374151" />
                        <Text style={styles.secondaryButtonText}>
                            {t("scanner.scanAnother")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Scanner active
    return (
        <View style={styles.scannerContainer}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>{t("scanner.identifying")}</Text>
                </View>
            )}

            <View style={styles.overlay}>
                <View style={styles.scannerArea}>
                    <View style={styles.scannerFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <Text style={styles.instruction}>{t("scanner.positionQR")}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#f9fafb",
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center",
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#3b82f6",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        width: "100%",
        marginBottom: 12,
    },
    primaryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        gap: 8,
        width: "100%",
    },
    secondaryButtonText: {
        color: "#374151",
        fontWeight: "600",
        fontSize: 16,
    },
    successContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#f9fafb",
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#10b981",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    checkmark: {
        fontSize: 40,
        color: "#fff",
        fontWeight: "bold",
    },
    successLabel: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 8,
    },
    nodeName: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center",
        marginBottom: 32,
    },
    buttonContainer: {
        width: "100%",
        gap: 12,
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: "#000",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
        marginTop: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scannerArea: {
        alignItems: "center",
    },
    scannerFrame: {
        width: 250,
        height: 250,
        position: "relative",
    },
    corner: {
        position: "absolute",
        width: 40,
        height: 40,
        borderColor: "#3b82f6",
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 12,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 12,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 12,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 12,
    },
    instruction: {
        color: "#fff",
        fontSize: 16,
        marginTop: 24,
        textAlign: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
});
