import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { QrCode, X, RefreshCw } from "lucide-react-native";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useScanner } from "@/hooks/useScanner";
import { COLORS } from "@/constants/colors";

export default function ScanScreen() {
    const router = useRouter();
    const {
        permission,
        requestPermission,
        isScanning,
        isProcessing,
        error,
        handleBarCodeScanned,
        resetScanner,
    } = useScanner({
        onScanSuccess: (nodeId) => {
            router.push(`/navigate?startNodeId=${nodeId}`);
        },
    });

    // Permission request
    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <Text>Yükleniyor...</Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 px-5">
                <View className="flex-1 items-center justify-center">
                    <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
                        <QrCode size={40} color={COLORS.primary} />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                        Kamera İzni Gerekli
                    </Text>
                    <Text className="text-gray-500 text-center mb-6">
                        QR kod taramak için kamera erişimine izin vermeniz gerekiyor.
                    </Text>
                    <Button onPress={requestPermission}>İzin Ver</Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Camera */}
            <View className="flex-1">
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
                />

                {/* Overlay */}
                <View className="absolute inset-0 items-center justify-center">
                    {/* Scan frame */}
                    <View className="w-64 h-64 border-2 border-white/50 rounded-3xl" />

                    {/* Instructions */}
                    <View className="absolute bottom-32">
                        <Card className="mx-5">
                            {error ? (
                                <View className="items-center">
                                    <Text className="text-red-500 text-center mb-3">{error}</Text>
                                    <Button variant="secondary" size="sm" icon={RefreshCw} onPress={resetScanner}>
                                        Tekrar Dene
                                    </Button>
                                </View>
                            ) : isProcessing ? (
                                <View className="items-center">
                                    <Text className="text-gray-600 text-center">Konum doğrulanıyor...</Text>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <Text className="text-gray-900 font-semibold text-center mb-1">
                                        QR Kodu Taratın
                                    </Text>
                                    <Text className="text-gray-500 text-sm text-center">
                                        Konumunuzu belirlemek için QR kodu çerçeveye hizalayın
                                    </Text>
                                </View>
                            )}
                        </Card>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
