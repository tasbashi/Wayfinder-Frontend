/**
 * Accessibility Utilities
 * 
 * Helper functions for accessibility features.
 */

import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Get accessibility label for a node type
 */
export function getNodeTypeAccessibilityLabel(nodeType: string): string {
    const labels: Record<string, string> = {
        Room: 'Room location',
        Corridor: 'Corridor',
        Elevator: 'Elevator for floor access',
        Stairs: 'Stairway',
        Entrance: 'Building entrance',
        Restroom: 'Restroom facility',
        InformationDesk: 'Information desk',
        Unknown: 'Location',
    };
    return labels[nodeType] || 'Location';
}

/**
 * Get accessibility hint for navigation actions
 */
export function getNavigationHint(action: 'select' | 'navigate' | 'scan'): string {
    const hints: Record<string, string> = {
        select: 'Double tap to select this location',
        navigate: 'Double tap to start navigation to this location',
        scan: 'Double tap to scan QR code',
    };
    return hints[action] || '';
}

/**
 * Format distance for screen readers
 */
export function formatDistanceForAccessibility(meters: number): string {
    if (meters < 1) return 'less than 1 meter';
    if (meters < 10) return `approximately ${Math.round(meters)} meters`;
    if (meters < 100) return `about ${Math.round(meters / 5) * 5} meters`;
    if (meters < 1000) return `approximately ${Math.round(meters / 10) * 10} meters`;
    const km = meters / 1000;
    return `approximately ${km.toFixed(1)} kilometers`;
}

/**
 * Format time for screen readers
 */
export function formatTimeForAccessibility(seconds: number): string {
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 1) return 'less than a minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 1) {
        return remainingMinutes > 0
            ? `1 hour and ${remainingMinutes} minutes`
            : '1 hour';
    }
    return remainingMinutes > 0
        ? `${hours} hours and ${remainingMinutes} minutes`
        : `${hours} hours`;
}

/**
 * Announce to screen reader
 */
export function announceForAccessibility(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (Platform.OS === 'ios') {
        // iOS uses announceForAccessibility
        AccessibilityInfo.announceForAccessibility(message);
    } else {
        // Android uses announceForAccessibility with polite/assertive
        AccessibilityInfo.announceForAccessibility(message);
    }
}

/**
 * Create accessible props for a touchable element
 */
export function createAccessibleProps(params: {
    label: string;
    hint?: string;
    role?: 'button' | 'link' | 'header' | 'image' | 'text' | 'search' | 'none';
    state?: {
        selected?: boolean;
        disabled?: boolean;
        checked?: boolean;
        busy?: boolean;
        expanded?: boolean;
    };
}) {
    return {
        accessible: true,
        accessibilityLabel: params.label,
        accessibilityHint: params.hint,
        accessibilityRole: params.role || 'button',
        accessibilityState: params.state,
    };
}

/**
 * Create accessible props for a list item
 */
export function createListItemAccessibleProps(params: {
    label: string;
    position: number;
    total: number;
    hint?: string;
    selected?: boolean;
}) {
    return {
        accessible: true,
        accessibilityLabel: `${params.label}, ${params.position} of ${params.total}`,
        accessibilityHint: params.hint,
        accessibilityRole: 'button' as const,
        accessibilityState: {
            selected: params.selected,
        },
    };
}

/**
 * Create accessible props for navigation instructions
 */
export function createInstructionAccessibleProps(params: {
    instruction: string;
    stepNumber: number;
    totalSteps: number;
    distance?: number;
    isCurrent?: boolean;
}) {
    let label = `Step ${params.stepNumber} of ${params.totalSteps}: ${params.instruction}`;
    if (params.distance) {
        label += `, ${formatDistanceForAccessibility(params.distance)}`;
    }
    if (params.isCurrent) {
        label = `Current step: ${label}`;
    }

    return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityRole: 'text' as const,
        accessibilityState: {
            selected: params.isCurrent,
        },
    };
}
