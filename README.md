# Pickup Coffee ☕

A mobile-first pickup-ordering web app for a fictional coffee shop — browse the menu, build a cart, schedule a pickup, and place an order. Built as a take-home assessment with React 19, Vite 8, TypeScript, and Tailwind CSS v4.

## Quick start

```bash
npm install
npm run dev      # dev server → http://localhost:8443 (strict port)
npm run build    # production build
npm run preview  # serve the production build
npm test         # run unit tests (Vitest)
npm run format   # format with oxfmt
```

- Plain **npm** — `npm install` is enough (`package-lock.json` included for reproducible installs).
- Node version is pinned in `.mise.toml`.
- Type-check: `npx tsc --noEmit` (passes clean).
- Unit tests: `npm test` (Vitest) — pure helpers under `src/**/*.test.ts`.

## Features

- **Menu** — coffee, non-coffee, and pastry catalog with Iced/Hot, size (Small/Medium/Large), and per-item notes.
- **Cart** — quantity controls, swipe-to-delete, cup progress, and a **5-cup limit** enforced on every add path (card, item sheet, cart `+`, pair-with) with a "Max 5 cups" shake when hit.
- **Pickup scheduling** — Today/Tomorrow wheel picker; slots every 15 minutes from 8:00 AM, last slot **5:45 PM** (15 min before the 6:00 PM close); Today automatically shows "Closed" after the last slot.
- **Checkout** — inline validation with shake-on-invalid, confirm modal, mocked order submission, success screen with itemized totals.
- **Extras** — dark mode, splash screen, glass/refraction styling, spring-physics animations, responsive layouts for phone / tablet / desktop.

## Where the API call lives

**`src/api/orders.ts`**

- `buildOrderPayload()` — builds the exact JSON payload a real API would receive (idempotency key, customer, pickup slot, line items with unit price + line totals, PHP currency totals).
- `submitOrder()` — contains the **real `fetch()`, commented out** for the assessment; the mock resolves immediately with `{ ok: true }` for every order and returns a formatted order reference (`formatOrderRef`). The 600 ms success delay is a UI transition in `src/App.tsx` (`submit`), not a network wait.

To go live: uncomment the fetch block inside `submitOrder()` and define `VITE_API_URL` (the endpoint constant is stubbed directly above it).

## Assumptions

1. **Menu** — the three required coffees exist at the required Medium prices: Americano ₱75, Latte ₱85, Black Coffee ₱65 (`src/data/coffee.ts`). The catalog is otherwise expanded because the spec references pair-with / other add paths.
2. **5-cup cap** — counts drinks only; pastries are exempt. Enforced centrally in `src/hooks/useCart.ts`, re-checked by the item sheet (`Math.min` clamp), cart `+` (disabled at limit), and pair-with.
3. **Store hours** — 8:00 AM–6:00 PM; pickup slots 8:00 AM–5:45 PM; after that Today is unavailable and Tomorrow must be chosen.
4. **Orders always succeed** — no backend was built for this assessment (see above).
5. **Typography** — SF-style stack (`-apple-system` → SF Pro → bundled Inter via `@fontsource/inter`) so text renders iOS-native on any platform.
6. **Demo content** — the footer credit and review strip are intentional placeholders.

## Project structure

```
src/
├── App.tsx                 # all app state (sheet, cart, nav, order) — passed down via props
├── main.tsx                # entry; splash-screen gate
├── api/orders.ts           # payload builder + mocked submit (real fetch commented out)
├── components/             # AppHeader, CoffeeCard, CartView, CheckoutView, BottomSheet,
│                           # SchedulePickup, WheelPicker, ConfirmOrderModal, OrderSuccess, …
├── data/                   # static catalogs: coffee, nonCoffee, recommendations, tone
├── hooks/                  # useCart, useNavigation, useScrollTracking
├── styles/                 # tokens.css, components/*.css, responsive/
│   └── responsive/         # mobile (≤720px) · tablet · desktop (≥1024px) · shared · overrides
├── types/                  # Coffee, CoffeeSize, CartItem, …
└── utils/                  # cart math, pickup slot generation, motion helpers
```

### Styling conventions

- **`src/index.css` import order IS the cascade** — global → tokens → components → `responsive/` → polish/fit layers (`*.mobile.css`, `*.desktop.css`). Do not reorder; see the header comment in that file.
- **Mobile and desktop are intentionally separate designs** — kept in `src/styles/responsive/{mobile,tablet,desktop,shared,overrides}/` plus the root `*.mobile.css` / `*.desktop.css` files.
- Colors, shadows, radii, and motion tokens live in `src/styles/tokens.css`; elevation uses one 7-tier whisper-shadow recipe derived from the coffee card.
- Dark mode is a `.dark` class on the root wrapper; shadow/color tokens remap automatically.

## Scripts (assessment tooling)

`scripts/apply-*.mjs` are one-off patch helpers used while building this assessment — they are **not** part of the app and are excluded from the submission zip.
