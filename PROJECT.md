# Project: Selapp Modernization

## Architecture
Selapp is a Next.js 15 App Router application with React 18.3.1, Tailwind CSS, Prisma ORM (PostgreSQL), and NextAuth v4.
The modernization establishes:
1. **Design System & Theme Layer**: HSL semantic CSS variables in `globals.css` with dark/light themes, Tailwind `darkMode: ["class"]`, `next-themes` provider, and atomic UI primitives in `src/components/ui/` (`cn` utility, Button, Card, Input, Dialog, DropdownMenu, Tabs, Badge, Skeleton, Tooltip, ThemeToggle).
2. **Notification & Feedback Layer**: Sonner toaster integrated at root layout, replacing all native browser `alert()` and `confirm()` dialogs with accessible, non-blocking toast notifications and Radix confirmation dialogs.
3. **Core Experience Layer**:
   - Home dashboard with streak tracker and hydration-safe rendering.
   - Daily devotionals with reading state, AI reflections, and skeleton loading states.
   - Sermons catalog and detailed view with document/chat modes, removing foreign color schemes (WhatsApp green) in favor of warm brand variables.
   - Notes / Spiritual Diary with mood selectors, rich editor, and elegant empty states.
4. **Resilience & Route Boundaries**: Dedicated `loading.tsx` and `error.tsx` for route streaming, zero React hydration errors, and clean Next.js 15 builds.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Semantic Tokens & Dark Mode | HSL color tokens for light and dark palettes, `darkMode: ["class"]`, `next-themes` ThemeProvider | M1 | Survey 1 & 2 |
| 2 | Atomic UI Library (`src/components/ui/`) | Standardized Button, Card, Input, Dialog, DropdownMenu, Tabs, Badge, Skeleton, Tooltip | M1 | Survey 2 |
| 3 | Sonner Toast System | Centralized `<Toaster />` mount and replacement of 17+ browser `alert()` and `confirm()` calls | M1 | Survey 1, 2, 3 |
| 4 | Modern Navigation & Shell | Responsive DesktopHeader (with ThemeToggle), Sidebar, and MobileTabBar with smooth transitions | M1 | Survey 2 |
| 5 | Home Dashboard Modernization | Elevated hero, daily progress/streak card, quick actions, hydration-safe date/greeting and WordCloud | M2 | Survey 3 |
| 6 | Devocionales Diarios Enhancement | Reading mode, reflection Q&A, skeleton loading (replacing spinning emojis), streak integration | M2 | Survey 2 & 3 |
| 7 | Sermones Experience Refinement | Modern sermon cards, filters, document/chat dual view, brand-aligned sermon notes chat (no green #DCF8C6) | M2 | Survey 2 & 3 |
| 8 | Editor de Notas / Diario Espiritual | 5-type spiritual diary, mood selectors with micro-animations, auto-save feedback toasts, empty states | M3 | Survey 2 & 3 |
| 9 | Route Boundaries & Skeleton Streaming | `loading.tsx` and `error.tsx` across all primary routes (`/`, `/sermons`, `/devotionals`, `/notes`, `/versiculos`) | M3 | Survey 3 |
| 10 | ESLint & Type Quality Hardening | Resolve exhaustive-deps warnings, replace raw `<img>` with Next.js `<Image>`, zero TypeScript errors | M3 | Survey 1 |
| 11 | Production Build & E2E Validation | Pass 100% opaque-box E2E tests, clean `npm run build`, clean `npx prisma generate`, 0 hydration errors | Final | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | UI Foundation & Design System | Package installation (`sonner`, `next-themes`, `@radix-ui/*`, `clsx`, `tailwind-merge`), Tailwind dark mode config, `globals.css` HSL tokens, `src/components/ui/` primitives, `ThemeProvider`, `ThemeToggle`, and responsive navigation headers/bars. | none | PLANNED |
| M2 | Core Flows Modernization | Home dashboard (streak card, hydration fixes), Devocionales diarios (skeletons, reflection questions, streak), and Sermones (sermon cards, chat bubble palette fix, modal confirmations). | M1 | PLANNED |
| M3 | Notes Editor, Route Boundaries & Polish | Notes / Diario Espiritual modernization (moods, auto-save, toasts, empty states), route-level `loading.tsx` and `error.tsx` boundaries, and ESLint cleanup. | M1, M2 | PLANNED |
| Final | E2E Verification & Production Hardening | Execute 100% of E2E test suite, verify clean production build (`npm run build` exit 0), clean typecheck (`tsc --noEmit`), clean lint, and zero hydration errors. | M1, M2, M3, E2E Test Suite | PLANNED |

## Interface Contracts
### Theme & Styling Contract
- CSS Variables in `src/app/globals.css`:
  - `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius`.
- Utility function: `cn(...inputs: ClassValue[]): string` in `src/lib/utils.ts`.
- Component: `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>` in `src/components/ThemeProvider.tsx`.

### Toast & Notification Contract
- Component: `<Toaster richColors position="top-right" closeButton />` from `sonner` in `src/app/layout.tsx`.
- Calls: Replace `alert(msg)` with `toast.success(msg)`, `toast.error(msg)`, or `toast.info(msg)`.

### Confirmation Dialog Contract
- Accessible modal dialog component using Radix primitives (`src/components/ui/dialog.tsx` or `src/components/ui/confirm-dialog.tsx`) replacing browser `confirm()`.

### Route Boundary Contract
- Every primary route directory (`/`, `/sermons`, `/devotionals`, `/notes`, `/versiculos`) must export a default `loading.tsx` with skeleton layout matching the page's visual structure.
- Every primary route directory must export an `'use client'` default `error.tsx` handling errors with recovery `reset()` action.

## Code Layout
```
src/
├── app/
│   ├── globals.css           # Semantic HSL tokens for :root and .dark
│   ├── layout.tsx            # Root layout with ThemeProvider, Toaster, suppressHydrationWarning
│   ├── page.tsx              # Modernized Home dashboard
│   ├── loading.tsx           # Global root loading skeleton
│   ├── error.tsx             # Global root error boundary
│   ├── devotionals/
│   │   ├── page.tsx          # Devotionals list & streak
│   │   ├── loading.tsx       # Devotionals skeleton
│   │   └── [date]/page.tsx   # Daily devotional reading & reflection Q&A
│   ├── sermons/
│   │   ├── page.tsx          # Sermons catalog
│   │   ├── loading.tsx       # Sermons skeleton
│   │   └── [id]/page.tsx     # Sermon detail & notes chat
│   └── notes/
│       ├── page.tsx          # Spiritual diary & notes editor
│       └── loading.tsx       # Notes skeleton
├── components/
│   ├── ui/                   # Atomic UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── tooltip.tsx
│   │   └── theme-toggle.tsx
│   ├── ThemeProvider.tsx     # next-themes wrapper
│   ├── DesktopHeader.tsx     # Modern header with theme toggle & search
│   ├── Sidebar.tsx           # Refined desktop sidebar
│   ├── MobileTabBar.tsx      # Refined mobile navigation
│   └── skeletons/            # Dedicated domain skeletons
└── lib/
    ├── utils.ts              # cn helper (clsx + tailwind-merge)
    └── prisma.ts             # Prisma client singleton
```
