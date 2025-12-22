# Wayfinder Admin Panel

Web Admin Panel for Wayfinder building management system.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Data Fetching:** React Query
- **Charts:** Recharts
- **Canvas:** Konva.js

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── api/              # API services (SHARED with mobile!)
├── components/       # React components
├── app/             # Next.js App Router pages
├── hooks/           # Custom hooks (SHARED with mobile!)
├── store/           # Zustand stores (SHARED with mobile!)
├── types/           # TypeScript types (SHARED with mobile!)
├── utils/           # Utility functions
└── config/          # Configuration files
```

## Environment Variables

Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=https://localhost:7014
NEXT_PUBLIC_ENVIRONMENT=development
```

## Documentation

See the main documentation files in the parent directory:
- `FRONTEND-RULES.md` - Development rules
- `WEB-FRONTEND-GUIDE.md` - Web-specific guide
- `FRONTEND-API-REFERENCE.md` - API documentation

