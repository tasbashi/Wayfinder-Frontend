# Assets Directory

This directory contains app icons and splash screens.

## Required Assets

You need to create the following PNG images:

1. **icon.png** - 1024x1024px
   - App icon for iOS and Android

2. **splash.png** - 1242x2436px (iOS) or 1920x1080px (Android)
   - Splash screen shown when app launches

3. **adaptive-icon.png** - 1024x1024px
   - Android adaptive icon (foreground)

4. **favicon.png** - 48x48px
   - Web favicon

## Quick Setup

### Option 1: Use Expo Asset Generator

```bash
# Install expo-asset-generator (if available)
# Or use online tools to convert SVG to PNG
```

### Option 2: Create Simple Placeholders

You can create simple colored squares as placeholders:

- **icon.png**: 1024x1024 blue square (#3b82f6) with white "W"
- **splash.png**: Same as icon but larger
- **adaptive-icon.png**: Same as icon
- **favicon.png**: 48x48 version

### Option 3: Use Design Tools

- Use Figma, Sketch, or Canva to create icons
- Export as PNG at required sizes
- Place files in this directory

## Temporary Solution

If you just want to test the app, you can temporarily comment out asset references in `app.json`:

```json
{
  "expo": {
    // "icon": "./assets/icon.png",  // Comment out temporarily
    // "splash": { ... }              // Comment out temporarily
  }
}
```

Then add proper assets later.

