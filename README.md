# Wayfinder Frontend Projects

This repository contains both the **Web Admin Panel** and **Mobile App** for the Wayfinder building navigation system.

## 📁 Project Structure

```
Wayfinder.FrontEnd/
├── wayfinder-admin/          # Web Admin Panel (Next.js 14)
├── wayfinder-mobile/         # Mobile App (React Native + Expo)
└── [Documentation Files]     # All documentation and guides
```

## 🚀 Quick Start

### Web Admin Panel

```bash
cd wayfinder-admin
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Mobile App

```bash
cd wayfinder-mobile
npm install
npm start
```

Scan QR code with Expo Go app or press `a` for Android / `i` for iOS.

## 📚 Documentation

- **`FRONTEND-README.md`** - Main documentation index
- **`FRONTEND-RULES.md`** - Mandatory development rules
- **`WEB-FRONTEND-GUIDE.md`** - Web-specific guide
- **`MOBILE-FRONTEND-GUIDE.md`** - Mobile-specific guide
- **`FRONTEND-API-REFERENCE.md`** - Complete API documentation
- **`FRONTEND-DEVELOPMENT-GUIDE.md`** - General development patterns

## 🎯 Tech Stack

### Web Admin Panel
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (data fetching)
- Axios (HTTP client)
- React Hook Form + Zod (forms)

### Mobile App
- React Native with Expo
- TypeScript
- Zustand (state management - shared with web!)
- React Query (data fetching)
- Axios (HTTP client - shared with web!)
- Expo Barcode Scanner (QR codes)
- Expo Secure Store (token storage)

## 🔄 Code Sharing

Both projects share:
- ✅ API Services (`src/api/*.service.ts`)
- ✅ Type Definitions (`src/types/*.ts`)
- ✅ Zustand Stores (`src/store/*.ts`)
- ✅ Business Logic

**Goal:** 30-50% code reuse between web and mobile!

## 📋 Next Steps

1. **Install dependencies** in both projects
2. **Configure environment variables** (API URLs)
3. **Read the documentation** files
4. **Start developing** following the rules in `FRONTEND-RULES.md`

## 🔗 API Endpoints

**Development:** `https://localhost:7014`  
**Production:** `https://api.wayfinder.com`

See `FRONTEND-API-REFERENCE.md` for complete API documentation.

## 📝 Development Rules

**CRITICAL:** Always follow `FRONTEND-RULES.md`:
- ✅ Always use TypeScript types (no `any`)
- ✅ Always check `ServiceResponse.isSuccess` before accessing `data`
- ✅ Always handle errors properly
- ✅ Always show loading states
- ✅ Use dedicated service classes for API calls
- ✅ Keep components small (< 200 lines)

---

**Happy Coding! 🚀**

