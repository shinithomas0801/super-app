# Next.js Users – Clean Architecture Template

A production-ready template with a **Users** feature, built so you can learn **Clean Architecture** and **Next.js App Router** by example. Use it as a starter for new apps or as a reference for how to structure features.

**This README is written for junior developers.** We explain not only *what* is in the repo but *why* and *how* to work with it.

---

## Table of contents

- [Getting started](#getting-started)
- [Key concepts](#key-concepts)
- [Folder structure](#folder-structure)
- [How a request flows](#how-a-request-flows)
- [Adding a new feature (step-by-step)](#adding-a-new-feature-step-by-step)
- [Where do I put…?](#where-do-i-put)
- [Commands](#commands)
- [Testing](#testing)
- [Animations](#animations)
- [Git hooks & CI](#git-hooks--ci)
- [Stack](#stack)
- [Learn more](#learn-more)

---

## Getting started

### 1. Prerequisites

- **Node.js 20 or later.**  
  Check: `node -v`  
  If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the project root (`.nvmrc` is set to 20).

### 2. Install and run

```bash
# Install dependencies
npm install

# Copy env example (optional; defaults work for local dev)
cp .env.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the home page; click **Go to Users** to see the Users list.

### 3. Run tests and lint

```bash
npm run test:run   # Unit/integration tests
npm run lint       # ESLint
npm run format:check  # Prettier (check only)
```

If these pass, you’re in a good state to start coding.

---

## Key concepts

### Clean Architecture (in one paragraph)

We split code into **layers** so that:

- **Business rules** (domain) don’t depend on the UI or the database.
- **Use cases** (application) orchestrate the work but don’t know about HTTP or React.
- **Infrastructure** (e.g. API client) and **presentation** (React components) can change without rewriting the core logic.

Dependencies point **inward**: presentation → application → domain. Domain has no dependency on React or Next.

### Container vs Presenter

- **Presenter** = “dumb” UI. It receives data and callbacks as props and only renders. No `fetch`, no use cases, no business logic. Easy to test and reuse (e.g. in Storybook).
- **Container** = “smart” wrapper. It runs use cases (or hooks like React Query), gets data, and passes it to the Presenter. In this template, containers are **server components** that fetch and then render the presenter.

So: **Container** = “what data and actions”; **Presenter** = “how it looks”.

### Where state lives

- **Server state** (data from the API, e.g. list of users): use **React Query** (`useUsers` in `lib/hooks`). The server (or API route) is the source of truth.
- **Client UI state** (sidebar open, theme): use **Zustand** (`stores/ui.store`).
- **Form or local UI state**: `useState` in the component or a custom hook.

---

## Folder structure

Use this as a map: “I need to add X → I put it in Y.”

| Path | Purpose | When to use |
|------|--------|-------------|
| `src/app/` | Next.js App Router: pages, layouts, API routes | New page → `app/my-page/page.tsx`. New API → `app/api/my-api/route.ts`. |
| `src/domain/` | Entities and business rules only (no React, no fetch) | New “thing” (e.g. Product) → `domain/products/product.entity.ts`. |
| `src/application/` | Use cases: they call infrastructure and return domain entities | New action (e.g. get products) → `application/products/get-products.usecase.ts`. |
| `src/infrastructure/` | External world: API client, DB client, etc. | New API client or adapter → e.g. `infrastructure/api/products.api.ts`. |
| `src/presentation/features/<feature>/` | One folder per feature: presenters + containers | New feature → e.g. `presentation/features/products/` with `presenters/` and `containers/`. |
| `src/components/` | Shared UI building blocks (Button, Input, Card, …) | Reusable component used in many places. Use `components/ui/` (shadcn) or our wrappers. |
| `src/components/animations/` | Motion-based wrappers (FadeIn, FadeInUp, StaggerChildren, …) | Wrap content when you need enter/exit or staggered list animations. |
| `src/lib/` | Shared code: constants, utils, hooks, React Query config | New constant → `lib/constants/`. New hook → `lib/hooks/`. New util → `lib/utils/`. |
| `src/lib/animations/` | Animation variants (fadeIn, fadeInUp, staggerContainer, …) | Reusable variant objects for Motion; use in custom motion components. |
| `src/stores/` | Zustand stores (client state) | New global client state (e.g. filters, sidebar) → new file in `stores/`. |
| `src/i18n/` | Translations and locale config | New copy → add keys in `i18n/messages/en.json` and use `useTranslations` in client components. |
| `e2e/` | Playwright end-to-end tests | New E2E scenario → new spec or add to existing in `e2e/`. |

```
src/
├── app/                    # Routes & API
├── domain/                 # Entities (pure logic)
├── application/            # Use cases
├── infrastructure/          # API clients, etc.
├── presentation/features/  # Feature UI (containers + presenters)
├── components/             # Shared UI (+ components/animations/)
├── lib/                    # Constants, utils, hooks (+ lib/animations/)
├── stores/                 # Zustand
└── i18n/                   # Translations
```

---

## How a request flows

Example: user opens **/users**.

1. **Next.js** runs `app/users/page.tsx`.
2. The **page** renders `<UsersContainer />`.
3. **UsersContainer** (server component) calls `getUsersUseCase()`.
4. **getUsersUseCase** calls `getUsersApi()` (infrastructure), then maps the response to **User** entities (domain).
5. The **container** passes the list of users to **UsersPresenter**.
6. **UsersPresenter** (client component) receives `users` as props and renders the list.

So: **Page → Container → Use case → API → Domain entities → back to Container → Presenter → UI.**

---

## Adding a new feature (step-by-step)

Example: add a **Products** feature (list of products).

1. **Domain**  
   Create `src/domain/products/product.entity.ts` (e.g. `id`, `name`). Add `product.entity.test.ts`.

2. **Infrastructure**  
   Create `src/infrastructure/api/products.api.ts` that fetches from `/api/products`. Add `src/app/api/products/route.ts` that returns mock data. Add `products.api.test.ts`.

3. **Application**  
   Create `src/application/products/get-products.usecase.ts`: call `getProductsApi()`, map to `Product` entities. Add `get-products.usecase.test.ts`.

4. **Constants**  
   In `lib/constants/api.ts` add `PRODUCTS: "/api/products"` and a `products` query key if you use React Query.

5. **Presentation**  
   - `src/presentation/features/products/presenters/Products.presenter.tsx`: receives `products` as props, renders list.  
   - `src/presentation/features/products/containers/Products.container.tsx`: calls `getProductsUseCase()`, passes data to the presenter.  
   Add `.test.tsx` for both.

6. **Page**  
   Create `src/app/products/page.tsx` that renders `<ProductsContainer />`.

7. **Optional**  
   Add a React Query hook in `lib/hooks/useProducts.ts`, add translations in `i18n/messages/en.json`, add an E2E in `e2e/products.spec.ts`, and a Storybook story for `Products.presenter.tsx`.

Always add tests next to the code (same folder or `*.test.ts` / `*.test.tsx`).

---

## Where do I put…?

- **A new page**  
  `src/app/<route>/page.tsx`. Use a container if the page needs data from a use case or API.

- **A new API endpoint**  
  `src/app/api/<name>/route.ts`. Export `GET`, `POST`, etc. as needed.

- **A new reusable button/card/input**  
  `src/components/`. Use or wrap `src/components/ui/` (shadcn) and export from `src/components/index.ts` if you want a single import path.

- **A new hook (e.g. useDebounce, useProducts)**  
  `src/lib/hooks/<name>.ts` and export from `src/lib/hooks/index.ts`.

- **A new constant (routes, API URLs, etc.)**  
  `src/lib/constants/` (e.g. `api.ts`, `app.ts`) and export from `src/lib/constants/index.ts`.

- **A new translation string**  
  Add the key in `src/i18n/messages/en.json` and use `useTranslations('namespace')` in a client component.

- **Global client state (e.g. theme, sidebar)**  
  Add or extend a store in `src/stores/` (Zustand).

- **A new E2E test**  
  `e2e/<feature>.spec.ts` (Playwright).

- **Enter/exit or list animations**  
  Use `src/components/animations/`: `FadeIn`, `FadeInUp`, `ScaleIn`, or `StaggerChildren` + `StaggerItem`. For custom variants, add to `src/lib/animations/variants.ts` and use with `motion` from `motion/react`.

---

## Commands

| Command | What it does |
|--------|----------------|
| `npm run dev` | Start dev server (http://localhost:3000). |
| `npm run build` | Production build. |
| `npm run start` | Run production build (run `build` first). |
| `npm run lint` | Run ESLint. |
| `npm run lint:fix` | ESLint and auto-fix. |
| `npm run format` | Prettier: format all files. |
| `npm run format:check` | Prettier: only check (CI). |
| `npm run test` | Vitest in watch mode. |
| `npm run test:run` | Vitest once (e.g. before commit or in CI). |
| `npm run test:e2e` | Playwright E2E (starts dev server). |
| `npm run test:e2e:ui` | Playwright with UI. |
| `npm run storybook` | Storybook on port 6006. |
| `npm run build-storybook` | Build static Storybook. |

Run tests and lint before pushing so CI stays green.

---

## Testing

- **Unit tests**: Vitest. Files live next to source: `*.test.ts` or `*.test.tsx`.  
  Run: `npm run test` or `npm run test:run`.

- **Component tests**: Same Vitest + `@testing-library/react`. Test presenters by passing props; mock use cases in container tests.

- **E2E tests**: Playwright in `e2e/*.spec.ts`. They run against the real app (dev server is started automatically).  
  Run: `npm run test:e2e`.

- **Stories**: Storybook for presenters and components. Not required for CI but great for UI development.

When you add a new feature, add at least one test per layer (entity, use case, API, presenter/container as appropriate).

---

## Animations

We use **[Motion](https://motion.dev/)** (React) for enter/exit and list animations.

- **Variants** live in `src/lib/animations/variants.ts`: `fadeIn`, `fadeInUp`, `scaleIn`, `staggerContainer`, `staggerItem`, `slideInLeft`, `slideInRight`. Use these with `motion` components when building custom animations.
- **Reusable wrappers** live in `src/components/animations/`:
  - **FadeIn** – opacity only.
  - **FadeInUp** – opacity + move up (e.g. cards, modals).
  - **ScaleIn** – opacity + scale (e.g. popovers).
  - **StaggerChildren** + **StaggerItem** – stagger list items with optional `delayChildren` and `staggerDelay`.

All support `className`, optional `delay`, and `as` (e.g. `div`, `span`). See **Components/Animations** in Storybook for examples. Tests are in `*.test.tsx` next to each component and in `lib/animations/variants.test.ts`.

---

## Git hooks & CI

- **Husky** installs Git hooks when you run `npm install` (via the `prepare` script).
- **Pre-commit** runs **lint-staged**: ESLint + Prettier on staged `.js/.jsx/.ts/.tsx`, and Prettier on staged `.json/.md/.yml/.yaml/.css`. Fixable issues are fixed before the commit.
- To skip the hook once: `git commit --no-verify` (use sparingly).
- **CI** (`.github/workflows/ci.yml`) runs on push/PR to `main` or `master`: install, lint, unit tests, build. Keep these green.

---

## Stack

- **Next.js 15** (App Router) – routing, server components, API routes.
- **React 19** – UI.
- **Tailwind CSS** – styling.
- **shadcn/ui** – accessible components; we wrap them in `src/components/`.
- **Zustand** – client state (e.g. `stores/ui.store`).
- **TanStack React Query** – server state (e.g. `useUsers`).
- **next-intl** – i18n; messages in `i18n/messages`, `useTranslations` in client components.
- **Motion** – animations; variants in `lib/animations/`, wrappers in `components/animations/`.
- **Vitest** – unit/integration tests.
- **Playwright** – E2E tests.
- **Storybook** – component/docs.
- **ESLint + Prettier + Husky + lint-staged** – code quality and pre-commit checks.

---

## Learn more

- [Next.js App Router](https://nextjs.org/docs/app)
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Motion (React)](https://motion.dev/docs/react)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

If something in this README is unclear, treat it as a doc bug: open an issue or suggest an edit so the next junior dev has an easier time.
