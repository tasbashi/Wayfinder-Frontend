/**
 * Toast Component
 * 
 * Toast notifications for user feedback.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastStore {
    toasts: ToastData[];
    show: (toast: Omit<ToastData, 'id'>) => void;
    hide: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
}

let toastId = 0;

export const useToast = create<ToastStore>((set, get) => ({
    toasts: [],

    show: (toast) => {
        const id = `toast-${++toastId}`;
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));

        // Auto-hide after duration
        const duration = toast.duration ?? 4000;
        if (duration > 0) {
            setTimeout(() => {
                get().hide(id);
            }, duration);
        }
    },

    hide: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },

    success: (title, message) => {
        get().show({ type: 'success', title, message });
    },

    error: (title, message) => {
        get().show({ type: 'error', title, message, duration: 6000 });
    },

    info: (title, message) => {
        get().show({ type: 'info', title, message });
    },

    warning: (title, message) => {
        get().show({ type: 'warning', title, message });
    },
}));

interface ToastProps {
    toast: ToastData;
    onHide: () => void;
}

function Toast({ toast, onHide }: ToastProps) {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 10,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateY, opacity]);

    const handleHide = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onHide());
    }, [translateY, opacity, onHide]);

    const Icon = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle,
    }[toast.type];

    const colors = {
        success: theme.colors.success,
        error: theme.colors.error,
        info: theme.colors.info,
        warning: theme.colors.warning,
    }[toast.type];

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: colors[50],
                    borderLeftColor: colors[500],
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View style={styles.iconContainer}>
                <Icon size={20} color={colors[600]} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors[800] }]}>{toast.title}</Text>
                {toast.message && (
                    <Text style={[styles.message, { color: colors[700] }]}>{toast.message}</Text>
                )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleHide}>
                <X size={18} color={colors[600]} />
            </TouchableOpacity>
        </Animated.View>
    );
}

/**
 * Toast Container - Render at app root
 */
export function ToastContainer() {
    const { toasts, hide } = useToast();

    if (toasts.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onHide={() => hide(toast.id)} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 60,
        paddingHorizontal: theme.spacing.md,
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderLeftWidth: 4,
        ...getShadowStyle('lg'),
    },
    iconContainer: {
        marginRight: theme.spacing.sm,
        paddingTop: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        ...theme.textStyles.label,
        marginBottom: 2,
    },
    message: {
        ...theme.textStyles.bodySmall,
    },
    closeButton: {
        padding: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
    },
});
