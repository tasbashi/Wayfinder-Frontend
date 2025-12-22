import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { NodeService } from "@/api/node.service";
import { NodeDto } from "@/types/node.types";
import { Camera, X, Navigation } from "lucide-react-native";

function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedNode, setScannedNode] = useState<NodeDto | null>(null);
  const router = useRouter();
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
        "Error",
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
        pathname: "/navigation",
        params: { startNodeId: scannedNode.id },
      });
    }
  }

  function handleScanAgain() {
    setScanned(false);
    setScannedNode(null);
    lastScannedRef.current = null;
  }

  // Loading permission state
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Camera size={64} color="#6b7280" />
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.text}>
          Please grant camera permission to scan QR codes
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Node scanned successfully
  if (scannedNode) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successCheckmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>You are at:</Text>
          <Text style={styles.nodeName}>{scannedNode.name}</Text>
          <Text style={styles.nodeType}>
            {scannedNode.nodeType === 0
              ? "Room"
              : scannedNode.nodeType === 1
                ? "Corridor"
                : "Location"}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleNavigate}
            >
              <Navigation size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Navigate from here</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleScanAgain}
            >
              <Text style={styles.secondaryButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Scanner active
  return (
    <View style={styles.container}>
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
          <Text style={styles.loadingText}>Identifying location...</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerArea}>
          <View style={styles.scannerFrame} />
          <Text style={styles.instructionText}>
            Position QR code within the frame
          </Text>
        </View>

        {scanned && !isLoading && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={handleScanAgain}
          >
            <Text style={styles.scanAgainText}>Tap to scan again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  scanAgainButton: {
    padding: 20,
    alignItems: "center",
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  successCheckmark: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 8,
  },
  nodeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  nodeType: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
    textAlign: "center",
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default ScannerScreen;
