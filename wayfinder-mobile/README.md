# Wayfinder Mobile App

A React Native (Expo) mobile application for indoor navigation using QR codes and the A* pathfinding algorithm.

## 🏗️ Architecture

This app follows a **feature-based architecture** with clean separation of concerns:

```
src/
├── api/              # API types and service classes
├── components/       # Reusable UI components
│   ├── common/       # Buttons, Cards, Loading, etc.
│   ├── building/     # Building-related components
│   ├── node/         # Node/location components
│   ├── home/         # Home screen components
│   └── navigation/   # Navigation flow components
├── features/         # Feature-specific hooks and stores
│   ├── buildings/    # useBuildings, useBuildingDetail
│   ├── navigation/   # useNavigation, navigationStore
│   ├── scanner/      # useScanner
│   ├── search/       # useSearch
│   └── settings/     # useSettings
├── theme/            # Design tokens and theme system
├── contexts/         # React context providers
├── i18n/             # Internationalization (en, tr)
├── utils/            # Utility functions
└── hooks/            # Shared hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
cd wayfinder-mobile
npm install
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## 🎨 Theme System

The app uses a comprehensive theme system defined in `src/theme/`:

```typescript
import { theme } from '@/theme';

// Colors
theme.colors.primary[500]  // Primary blue
theme.colors.success[500]  // Success green
theme.colors.error[500]    // Error red

// Spacing
theme.spacing.sm   // 8px
theme.spacing.md   // 16px
theme.spacing.lg   // 24px

// Typography
theme.textStyles.h1
theme.textStyles.body
theme.textStyles.button
```

## 📦 Component Library

### Common Components

```typescript
import { Button, Card, LoadingSpinner, EmptyState, ErrorState } from '@/components/common';

<Button title="Navigate" variant="primary" onPress={handlePress} />
<Card onPress={handleCardPress}><Text>Content</Text></Card>
<LoadingSpinner message="Loading..." />
<EmptyState icon={<Icon />} title="No Results" />
```

### Feature Components

```typescript
import { BuildingCard, BuildingList } from '@/components/building';
import { NodeCard, NodeList, NodeTypeIcon } from '@/components/node';
import { LocationSelector, InstructionCard } from '@/components/navigation';
```

## 🪝 Hooks

### Data Fetching

```typescript
import { useBuildings, useBuildingDetail } from '@/features/buildings';
import { useSearch } from '@/features/search';
import { useScanner } from '@/features/scanner';

// Get all buildings
const { buildings, isLoading, error, refresh } = useBuildings();

// Search nodes
const { query, results, setQuery } = useSearch();

// QR Scanner
const { permission, scannedNode, handleScan, resetScan } = useScanner();
```

### Navigation Store (Zustand)

```typescript
import { useNavigationStore } from '@/features/navigation';

const {
  startNode,
  endNode,
  route,
  setStartNode,
  setEndNode,
  calculateRoute,
  reset,
} = useNavigationStore();
```

## 🌐 Internationalization

The app supports English and Turkish:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
t('home.greeting', 'Welcome to');
```

## ♿ Accessibility

- All interactive elements have accessibility labels
- Font scaling support via `AccessibilityContext`
- Screen reader announcements
- High contrast mode support

```typescript
import { useAccessibility } from '@/contexts/AccessibilityContext';

const { fontSizeMultiplier, settings } = useAccessibility();
```

## 📱 Screens

| Tab | Screen | Description |
|-----|--------|-------------|
| Home | `/(tabs)/index` | Hero card, quick actions, recent routes |
| Explore | `/(tabs)/explore` | Building list, search |
| Scanner | `/(tabs)/scanner` | QR code scanner |
| Profile | `/(tabs)/profile` | Settings, language, accessibility |

### Navigation Flow

1. `/navigation/select-start` - Select starting location
2. `/navigation/select-end` - Select destination
3. `/navigation/result` - View route with instructions

### Building Details

- `/buildings/[id]` - Building floors list
- `/buildings/[id]/floor/[floorId]` - Floor nodes list

## 🔧 API Integration

The app connects to the Wayfinder backend API:

```typescript
import { buildingsApi, nodesApi, routesApi } from '@/api';

// Fetch buildings
const buildings = await buildingsApi.getAll();

// Calculate route
const route = await routesApi.calculate(startId, endId, requireAccessible);
```

## 📄 License

Private - Wayfinder Project
