/**
 * ErrorBoundary Component
 * 
 * React error boundary for catching and displaying errors gracefully.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';
import { theme, getShadowStyle } from '@/theme';

interface ErrorBoundaryProps {
    children: ReactNode;
    /** Fallback component to render on error */
    fallback?: ReactNode;
    /** Called when error is caught */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Called when retry is pressed */
    onRetry?: () => void;
    /** Called when go home is pressed */
    onGoHome?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        this.props.onGoHome?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={48} color={theme.colors.error[500]} />
                        </View>

                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            An unexpected error occurred. Please try again.
                        </Text>

                        {__DEV__ && this.state.error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>
                                    {this.state.error.message}
                                </Text>
                            </View>
                        )}

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={this.handleRetry}
                            >
                                <RefreshCw size={18} color="#fff" />
                                <Text style={styles.retryText}>Try Again</Text>
                            </TouchableOpacity>

                            {this.props.onGoHome && (
                                <TouchableOpacity
                                    style={styles.homeButton}
                                    onPress={this.handleGoHome}
                                >
                                    <Home size={18} color={theme.colors.primary[500]} />
                                    <Text style={styles.homeText}>Go Home</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    content: {
        alignItems: 'center',
        maxWidth: 320,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.error[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    message: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    errorBox: {
        backgroundColor: theme.colors.error[50],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        width: '100%',
    },
    errorText: {
        ...theme.textStyles.bodySmall,
        color: theme.colors.error[700],
        fontFamily: 'monospace',
    },
    actions: {
        gap: theme.spacing.sm,
        width: '100%',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary[500],
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
        ...getShadowStyle('sm'),
    },
    retryText: {
        ...theme.textStyles.button,
        color: '#fff',
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    homeText: {
        ...theme.textStyles.button,
        color: theme.colors.primary[500],
    },
});
