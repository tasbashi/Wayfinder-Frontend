/**
 * useScanner Hook
 * 
 * Hook for QR code scanning with node identification.
 */

import { useState, useCallback, useRef } from 'react';
import { useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { nodesApi } from '@/api';
import { NodeDto } from '@/api/types';

interface UseScannerResult {
    /** Camera permission info */
    permission: ReturnType<typeof useCameraPermissions>[0];
    /** Request camera permission */
    requestPermission: ReturnType<typeof useCameraPermissions>[1];
    /** Scanned node result */
    scannedNode: NodeDto | null;
    /** Scanning state */
    isScanning: boolean;
    /** Loading state (identifying node) */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Handle barcode scan */
    handleScan: (result: BarcodeScanningResult) => Promise<void>;
    /** Reset scanner for new scan */
    resetScan: () => void;
    /** Start scanning */
    startScanning: () => void;
    /** Stop scanning */
    stopScanning: () => void;
}

export function useScanner(): UseScannerResult {
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedNode, setScannedNode] = useState<NodeDto | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent duplicate scans
    const lastScannedRef = useRef<string | null>(null);

    const handleScan = useCallback(async (result: BarcodeScanningResult) => {
        // Skip if already processing or same QR code
        if (isLoading || !isScanning) return;
        if (lastScannedRef.current === result.data) return;

        lastScannedRef.current = result.data;
        setIsScanning(false);
        setIsLoading(true);
        setError(null);

        try {
            const node = await nodesApi.scanQRCode(result.data);
            setScannedNode(node);
        } catch (err) {
            console.error('[useScanner] Scan failed:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to identify location from QR code'
            );
            // Reset to allow retry
            setIsScanning(true);
            lastScannedRef.current = null;
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isScanning]);

    const resetScan = useCallback(() => {
        setScannedNode(null);
        setError(null);
        setIsScanning(true);
        lastScannedRef.current = null;
    }, []);

    const startScanning = useCallback(() => {
        setIsScanning(true);
        lastScannedRef.current = null;
    }, []);

    const stopScanning = useCallback(() => {
        setIsScanning(false);
    }, []);

    return {
        permission,
        requestPermission,
        scannedNode,
        isScanning,
        isLoading,
        error,
        handleScan,
        resetScan,
        startScanning,
        stopScanning,
    };
}
