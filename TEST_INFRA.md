# Testing Infrastructure & E2E Test Suite Specification — Selapp

## 1. Overview & Test Philosophy

This document defines the testing architecture and E2E verification framework for the **Selapp Modernization** project.

The testing strategy follows an **opaque-box, requirement-driven methodology** anchored directly in `ORIGINAL_REQUEST.md` (R1: Modern design & visual system, R2: Modern UI & interaction libraries, R3: Performance, stability, and production quality) and the 11 features inventoried in `PROJECT.md`.

### Core Principles
1. **Opaque-Box Verification**: Tests inspect user-facing outcomes, visual tokens, layout contracts, component interfaces, route boundaries, and build artifacts rather than private internal implementation state.
2. **Deterministic & Self-Contained**: Each test is independent, executes deterministically, and does not rely on transient third-party network services or external browser driver installations.
3. **Progressive Testability & Milestone Alignment**: Tests are categorized across 4 systematic tiers and 11 features. As milestones M1, M2, and M3 are implemented, tests transition from baseline failures to passing status, culminating in 100% pass rate at the Final Milestone.
4. **Adversarial & Boundary Verification**: Includes checks for CSS token syntax integrity, contrast ratios, empty states, zero-data boundaries, unescaped browser dialogues, and CLS avoidance.

---

## 2. Test Directory & Suite Layout

All test files and utilities are organized strictly within `tests/e2e/` and `scripts/`, maintaining full separation from implementation files and leaving `.agents/teamwork/` dedicated exclusively to agent metadata:

```
selapp/
├── scripts/
│   └── run-e2e-tests.mjs               # Master E2E test runner CLI
├── tests/
│   └── e2e/
│       ├── helpers/
│       │   └── test-utils.mjs           # Shared AST, CSS, DOM & contract assertion helpers
│       ├── tier1-features/             # Tier 1: Feature Coverage (>=5 tests per feature, 11 features = 55 tests)
│       │   ├── 01-semantic-tokens-theme.test.mjs
│       │   ├── 02-atomic-ui-library.test.mjs
│       │   ├── 03-sonner-toast-system.test.mjs
│       │   ├── 04-modern-navigation-shell.test.mjs
│       │   ├── 05-home-dashboard.test.mjs
│       │   ├── 06-devotionals-enhancement.test.mjs
│       │   ├── 07-sermons-refinement.test.mjs
│       │   ├── 08-notes-editor-diary.test.mjs
│       │   ├── 09-route-boundaries-skeletons.test.mjs
│       │   ├── 10-lint-typecheck-quality.test.mjs
│       │   └── 11-production-build-contracts.test.mjs
│       ├── tier2-boundaries/           # Tier 2: Boundary & Corner Cases (>=5 tests per feature, 11 features = 55 tests)
│       │   ├── 01-tokens-theme-boundaries.test.mjs
│       │   ├── 02-atomic-ui-boundaries.test.mjs
│       │   ├── 03-toast-dialog-boundaries.test.mjs
│       │   ├── 04-navigation-shell-boundaries.test.mjs
│       │   ├── 05-home-dashboard-boundaries.test.mjs
│       │   ├── 06-devotionals-boundaries.test.mjs
│       │   ├── 07-sermons-boundaries.test.mjs
│       │   ├── 08-notes-editor-boundaries.test.mjs
│       │   ├── 09-route-boundaries-limits.test.mjs
│       │   ├── 10-code-quality-boundaries.test.mjs
│       │   └── 11-production-build-boundaries.test.mjs
│       ├── tier3-combinations/         # Tier 3: Cross-Feature Combinations (Pairwise coverage = 12 tests)
│       │   └── cross-feature-combinations.test.mjs
│       └── tier4-scenarios/            # Tier 4: Real-World Application Scenarios (>=5 user workflows)
│           └── real-world-scenarios.test.mjs
```

---

## 3. Systematic 4-Tier Test Architecture

| Tier | Name | Target Scope | Minimum Tests | Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Feature Coverage** | 11 Features in `PROJECT.md` | **55 tests** (>=5 per feature) | Verifies standard happy-path contracts, required exports, component compositions, token declarations, and layout mountings. |
| **Tier 2** | **Boundary & Corner Cases** | 11 Features in `PROJECT.md` | **55 tests** (>=5 per feature) | Verifies edge conditions, empty states, zero-data scenarios, contrast boundaries, absence of unescaped browser dialogues, and CLS mitigations. |
| **Tier 3** | **Cross-Feature Combinations** | Pairwise Inter-Module Interactions | **12 tests** | Verifies synergistic interactions (e.g. ThemeToggle + Devotionals reading, Notes editor + Sonner toast, Sermons chat + brand colors, Shell + Skeletons). |
| **Tier 4** | **Real-World Scenarios** | End-to-End User Journeys | **5 tests** | Simulates complete user sessions (Morning devotional & streak, Sunday sermon notes, Evening diary reflection, Theme switching, Error boundary recovery). |
| **Total** | | **Comprehensive Suite** | **127 tests** | Full opaque-box coverage across all project requirements. |

---

## 4. Test Runner CLI & Invocation

The runner is executed via Node.js (v20+ / v22+) without external runtime prerequisites:

### Commands

```bash
# Run the complete test suite (all 4 tiers, all 127 tests)
node scripts/run-e2e-tests.mjs

# Run a specific tier
node scripts/run-e2e-tests.mjs --tier=1
node scripts/run-e2e-tests.mjs --tier=2
node scripts/run-e2e-tests.mjs --tier=3
node scripts/run-e2e-tests.mjs --tier=4

# Run tests for a specific feature (Features 1 through 11)
node scripts/run-e2e-tests.mjs --feature=1
node scripts/run-e2e-tests.mjs --feature=7

# Run in baseline / non-failing reporting mode (prints diagnostic scorecard)
node scripts/run-e2e-tests.mjs --mode=baseline

# Output JSON summary report
node scripts/run-e2e-tests.mjs --json
```

### Exit Codes
- `0`: All executed tests passed successfully (or `--mode=baseline` completed).
- `1`: One or more test assertions failed in standard execution mode.

---

## 5. Verification Oracles & Assertion Methodology

1. **Design System & Semantic Token Oracle**:
   - Parses `src/app/globals.css` AST rules to verify presence of all 20 required HSL CSS variables in `:root` and `.dark` blocks.
   - Verifies `tailwind.config.ts` darkMode configuration (`darkMode: ["class"]`).
2. **Atomic UI Primitive Contract Oracle**:
   - Asserts existence and export signatures of Button, Card, Input, Dialog, DropdownMenu, Tabs, Badge, Skeleton, and Tooltip in `src/components/ui/`.
   - Asserts `src/lib/utils.ts` exports `cn` integrating `clsx` and `tailwind-merge`.
3. **Notification & Modal Oracle**:
   - Validates `<Toaster />` mount in `src/app/layout.tsx`.
   - Scans codebase to verify total elimination of native browser `alert()` and `confirm()` calls.
4. **Shell & Navigation Oracle**:
   - Validates responsive layout composition across DesktopHeader, Sidebar, and MobileTabBar.
   - Verifies ThemeToggle integration and mobile-safe padding (`pb-20`).
5. **Route Boundaries & Skeleton Oracle**:
   - Validates presence of `loading.tsx` and `'use client'` `error.tsx` across `/`, `/sermons`, `/devotionals`, `/notes`, and `/versiculos`.
   - Verifies elimination of primitive spinning emojis (`⏳`) in favor of atomic skeletons.
6. **Code Quality & Build Oracle**:
   - Validates TypeScript compiler cleanliness (`npx tsc --noEmit`).
   - Validates ESLint compliance with zero blocking warnings.
   - Validates Prisma schema client generation and Next.js production build output.

---

## 6. Milestone Gates & Verification Lifecycle

- **M1 Gate (UI Foundation & Design System)**:
  - Must pass: Tier 1 Features 1-4, Tier 2 Features 1-4.
- **M2 Gate (Core Flows Modernization)**:
  - Must pass: Tier 1 Features 5-7, Tier 2 Features 5-7, and Tier 3 combinations (T3-XF-01, T3-XF-03, T3-XF-06, T3-XF-07).
- **M3 Gate (Notes Editor, Route Boundaries & Polish)**:
  - Must pass: Tier 1 Features 8-10, Tier 2 Features 8-10, and Tier 3 combinations (T3-XF-02, T3-XF-04, T3-XF-08, T3-XF-10, T3-XF-11).
- **Final Gate (Production Hardening & Verification)**:
  - Must pass: 100% of all 127 tests across all 4 tiers with exit code 0.
