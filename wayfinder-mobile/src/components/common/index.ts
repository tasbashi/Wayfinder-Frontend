/**
 * Common Components - Barrel Export
 * 
 * Export all common components for easy importing.
 * Usage: import { Button, Card, ... } from '@/components/common';
 */

// Buttons
export { Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

// Cards
export { Card, CardHeader, CardContent, CardFooter } from './Card';

// States
export { EmptyState } from './EmptyState';
export { ErrorState, InlineError } from './ErrorState';
export { LoadingSpinner, LoadingOverlay, InlineLoading } from './LoadingSpinner';

// Skeletons
export {
    LoadingSkeleton,
    CardSkeleton,
    ListSkeleton,
    BuildingCardSkeleton,
    NodeCardSkeleton,
} from './LoadingSkeleton';

// Inputs
export { SearchInput } from './SearchInput';

// Labels
export { Badge, CountBadge } from './Badge';
export type { BadgeVariant, BadgeSize } from './Badge';

// Layout
export { Header, LargeHeader } from './Header';
export { SafeContainer, ScreenContainer } from './SafeContainer';

// Error Handling
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Animations
export { FadeIn, SlideIn, ScaleIn, StaggeredList } from './Animated';

// Toast
export { ToastContainer, useToast } from './Toast';
