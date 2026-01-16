import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import { useMapStore } from "@/store/useMapStore";
import { APP_CONFIG } from "@/config/app.config";

interface UseMapGesturesOptions {
    initialZoom?: number;
    minZoom?: number;
    maxZoom?: number;
}

export const useMapGestures = (options: UseMapGesturesOptions = {}) => {
    const {
        initialZoom = APP_CONFIG.map.defaultZoom,
        minZoom = APP_CONFIG.map.minZoom,
        maxZoom = APP_CONFIG.map.maxZoom,
    } = options;

    const { setZoomLevel, setPanOffset } = useMapStore();

    // Shared values for gestures
    const scale = useSharedValue(initialZoom);
    const savedScale = useSharedValue(initialZoom);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    // Update store with zoom level
    const updateZoom = useCallback((zoom: number) => {
        setZoomLevel(zoom);
    }, [setZoomLevel]);

    // Update store with pan offset
    const updatePan = useCallback((x: number, y: number) => {
        setPanOffset({ x, y });
    }, [setPanOffset]);

    // Pinch to zoom gesture
    const pinchGesture = Gesture.Pinch()
        .onStart((event) => {
            focalX.value = event.focalX;
            focalY.value = event.focalY;
        })
        .onUpdate((event) => {
            const newScale = savedScale.value * event.scale;
            scale.value = Math.max(minZoom, Math.min(maxZoom, newScale));
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            runOnJS(updateZoom)(scale.value);
        });

    // Pan gesture
    const panGesture = Gesture.Pan()
        .onStart(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = savedTranslateX.value + event.translationX;
            translateY.value = savedTranslateY.value + event.translationY;
        })
        .onEnd(() => {
            runOnJS(updatePan)(translateX.value, translateY.value);
        });

    // Double tap to reset
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            scale.value = withSpring(initialZoom);
            savedScale.value = initialZoom;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
            runOnJS(updateZoom)(initialZoom);
            runOnJS(updatePan)(0, 0);
        });

    // Combine gestures
    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        panGesture,
        doubleTapGesture
    );

    return {
        gesture: composedGesture,
        scale,
        translateX,
        translateY,
        focalX,
        focalY,
    };
};
