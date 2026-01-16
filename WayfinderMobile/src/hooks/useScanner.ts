import { useState, useCallback, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNodeByQRCode } from "@/api/hooks/useNodes";
import { useLocationStore } from "@/store/useLocationStore";
import { isValidQRCode } from "@/utils/validators";

interface UseScannerOptions {
    onScanSuccess?: (nodeId: string) => void;
    onScanError?: (error: string) => void;
    autoSetLocation?: boolean;
}

interface UseScannerReturn {
    permission: ReturnType<typeof useCameraPermissions>[0];
    requestPermission: ReturnType<typeof useCameraPermissions>[1];
    isScanning: boolean;
    scannedCode: string | null;
    isProcessing: boolean;
    error: string | null;
    handleBarCodeScanned: (data: { data: string }) => void;
    resetScanner: () => void;
}

export const useScanner = (options: UseScannerOptions = {}): UseScannerReturn => {
    const { onScanSuccess, onScanError, autoSetLocation = true } = options;

    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(true);
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lastScannedRef = useRef<string | null>(null);
    const { setFromQRScan } = useLocationStore();

    // Node lookup query
    const { data: node, isLoading: isLoadingNode, error: nodeError } = useNodeByQRCode(scannedCode ?? undefined);

    // Handle node lookup result
    useEffect(() => {
        if (node && scannedCode) {
            if (autoSetLocation) {
                setFromQRScan(scannedCode, node);
            }
            onScanSuccess?.(node.id);
            setIsProcessing(false);
        }
    }, [node, scannedCode, autoSetLocation, setFromQRScan, onScanSuccess]);

    // Handle node lookup error
    useEffect(() => {
        if (nodeError && scannedCode) {
            const errorMessage = "QR kod tanınanamadı. Lütfen tekrar deneyin.";
            setError(errorMessage);
            onScanError?.(errorMessage);
            setIsProcessing(false);
            // Reset for retry
            setTimeout(() => {
                setScannedCode(null);
                setIsScanning(true);
                setError(null);
            }, 2000);
        }
    }, [nodeError, scannedCode, onScanError]);

    const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
        // Prevent duplicate scans
        if (lastScannedRef.current === data || isProcessing) {
            return;
        }

        // Validate QR code format
        if (!isValidQRCode(data)) {
            setError("Geçersiz QR kod formatı");
            return;
        }

        lastScannedRef.current = data;
        setIsScanning(false);
        setIsProcessing(true);
        setScannedCode(data);
        setError(null);
    }, [isProcessing]);

    const resetScanner = useCallback(() => {
        lastScannedRef.current = null;
        setScannedCode(null);
        setIsScanning(true);
        setIsProcessing(false);
        setError(null);
    }, []);

    return {
        permission,
        requestPermission,
        isScanning,
        scannedCode,
        isProcessing: isProcessing || isLoadingNode,
        error,
        handleBarCodeScanned,
        resetScanner,
    };
};
