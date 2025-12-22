# Wayfinder Mobile App

Mobile navigation app for Wayfinder building navigation system.

## Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** Expo Router
- **State Management:** Zustand (shared with web!)
- **HTTP Client:** Axios (shared with web!)
- **QR Scanner:** expo-barcode-scanner
- **Storage:** expo-secure-store
- **SVG:** react-native-svg
- **UI:** React Native Paper

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## Project Structure

```
src/
├── api/              # API services (SHARED with web!)
├── components/        # React Native components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── hooks/           # Custom hooks (SHARED with web!)
├── store/           # Zustand stores (SHARED with web!)
├── types/           # TypeScript types (SHARED with web!)
├── utils/           # Utility functions
└── config/          # Configuration files
```

## Environment Variables

Create `.env` file:
```
API_URL=https://localhost:7014
```

## Documentation

See the main documentation files in the parent directory:
- `FRONTEND-RULES.md` - Development rules
- `MOBILE-FRONTEND-GUIDE.md` - Mobile-specific guide
- `FRONTEND-API-REFERENCE.md` - API documentation

