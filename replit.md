# المستشار AI - Legal Intelligence Platform

## Overview
A React/Vite frontend application for an Arabic legal AI platform. Users can sign in via Google or email, interact with an AI legal assistant, browse legal consultants, use document templates, and manage their account.

## Architecture
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Auth & Database**: Firebase (Firestore, Firebase Auth)
- **Routing**: React Router v6
- **State**: TanStack React Query
- **UI Libraries**: Radix UI, Framer Motion, Recharts, Lucide icons

## Key Files
- `src/App.tsx` - Root component with routing and providers
- `src/pages/` - Page components (Index, Dashboard, Bot, Login, Signup, etc.)
- `src/firebase/config.ts` - Firebase configuration
- `src/firebase/client-provider.tsx` - Firebase initialization wrapper
- `src/context/AuthContext.tsx` - Auth state management
- `src/components/` - Reusable UI components
- `vite.config.ts` - Vite config (port 5000, host 0.0.0.0 for Replit)

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`

## Replit Setup Notes
- Migrated from Lovable; removed `lovable-tagger` plugin dependency
- Vite configured for Replit: `host: "0.0.0.0"`, `port: 5000`, `allowedHosts: true`
- CSS `@import` moved before `@tailwind` directives to fix ordering warning
- Dependencies installed with `--legacy-peer-deps` due to `react-day-picker` / `date-fns` version conflict
