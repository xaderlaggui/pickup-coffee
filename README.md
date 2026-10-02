# Pickup Coffee

Production-quality take-home assessment: a responsive order-ahead web app for Pickup Coffee, built with React 19, Vite 8, and TypeScript 5 (strict mode). No third-party component or utility libraries - React + React DOM only.

---

## Setup

```bash
npm install
npm run dev       # Development server on http://localhost:8443
npm run build     # Production build
npm run typecheck # TypeScript check only (no emit)
```

---

## Folder structure

```
src/
  components/        # UI components
    CoffeeCard.tsx   # Card + MenuGrid
    BottomSheet.tsx  # Item detail sheet / modal
    SchedulePickup.tsx
    OrderBar.tsx     # Fixed bottom order bar
    OrderSuccess.tsx # Confirmation screen
    WelcomeScreen.tsx
    Header.tsx
    icons.tsx        # Inline SVG icon set
  hooks/
    useCart.ts       # Cart state + MAX_CUPS enforcement
    useTheme.ts      # System/light/dark preference + localStorage
    usePickupSlots.ts # Slot generation, refresh timer, expiry
    useSheetDrag.ts  # Pointer-based drag-to-dismiss
  lib/
    slots.ts         # Pure slot generation (generateSlots, isSlotValid)
    format.ts        # formatPrice, formatPickupLabel, generateOrderId
    order.ts         # buildOrderPayload, submitOrder (mock + commented API)
  styles/
    tokens.css       # ALL CSS custom properties (colors, easing, spacing, type)
    base.css         # Global resets, @font-face, skip link, focus ring
    components.css   # All component classes
  config.ts          # OPEN_HOUR, CLOSE_HOUR, MAX_CUPS, MENU_ITEMS, TIMEZONE
  types.ts           # TypeScript interfaces (Cart, Slot, OrderPayload, etc.)
  App.tsx            # Root component + screen orchestration
  main.tsx           # React entry point
  index.css          # CSS import entry point
public/
  assets/            # Product images (iced-americano.png, iced-latte.png, brewed-coffee.png)
  fonts/             # Self-hosted Inter variable font (woff2)
index.html           # HTML shell with theme-before-paint script, meta, preload
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check then Vite production build |
| `npm run typecheck` | TypeScript strict check only |
| `npm run preview` | Preview production build locally |

---

## Design decisions and assumptions

### Prep buffer
A constant `PREP_BUFFER_MINUTES = 15` in `config.ts` is added to the current time before finding the next 15-minute slot boundary. This means if it is 9:07 AM, the first selectable slot is 9:30 AM (9:07 + 15 = 9:22, ceiled to 9:30).

### ASAP rules
- ASAP is only shown on Today, and only when the store is currently open (`hours >= 8 && hours < 18`, Manila time).
- If all timed slots have expired (it is past 5:45 PM plus the prep buffer), ASAP is also removed and Today is considered closed.
- The slot list recomputes on a timer aligned to the next minute boundary, so ASAP disappears in real time as the store closes.

### Tomorrow slots
Tomorrow always shows the full slot range (8:00 AM to 5:45 PM, 15-minute increments). No ASAP is offered for tomorrow.

### Time zone
All slot logic runs in `Asia/Manila` (UTC+8) regardless of the user's device locale, using `Intl.DateTimeFormat` with `timeZone: "Asia/Manila"`. ISO 8601 strings in the order payload carry the `+08:00` offset explicitly.

### Closed-store behavior
If Today has no available slots (all expired), the UI automatically switches to Tomorrow and shows a brief notice. The Today button is disabled and labelled "Closed".

### 5-cup cap
`MAX_CUPS = 5` in `config.ts`. All quantity mutations go through `setItemQuantity` in `useCart`, which clamps the sum of all item quantities to MAX_CUPS using a single pure helper. The `+` button is disabled when the cap is reached, and an inline `aria-live` message announces this. The state can never exceed 5 even via rapid taps (state updater form ensures atomicity).

### Cart and session persistence
Cart contents and pickup selection are stored in `sessionStorage` (guarded by `try/catch`). On reload, stale slots are revalidated and the selection moves to the next valid slot if needed.

### API integration
The real fetch call in `src/lib/order.ts` is commented out with clear labels. To enable:
1. Create a `.env` file with `VITE_API_URL=https://your-api-host.com` and `VITE_API_TOKEN=your-token`.
2. Uncomment the fetch block inside `submitOrder()`.
3. Remove the mock `await new Promise(...)` line.

The `OrderPayload` type documents the full request shape. The `OrderResponse` type documents the expected response.

### Theme
System preference is read on first load via `prefers-color-scheme`. The inline script in `index.html` applies `data-theme` before first paint to avoid a flash. The user's manual choice is stored in `localStorage`. Theme transitions are disabled during the initial load via the `data-theme-loading` attribute and a CSS rule that strips all transitions while that attribute is present.

---

## Deviations from the original mockup

| Area | Original | Changed | Reason |
|---|---|---|---|
| Stack | Tailwind + Figma Make plugins | Vanilla CSS custom properties | Assessment requirement |
| Menu data | Iced Latte 110, Iced Americano 85, Brewed Coffee 75 | Americano 75, Latte 85, Black Coffee 65 | Assessment-specified prices and names |
| Image mapping | iced-latte -> Latte, iced-americano -> Americano | Same but Americano is item 1 | Matches image filename to product name |
| Slots | Hardcoded list of 5 slots | Generated from OPEN_HOUR/CLOSE_HOUR config | Assessment requirement |
| Time picker | 3-row fake wheel | Chip grid with scroll (accessible, keyboard nav) | Assessment requirement; wheel was not a real `scroll-snap` implementation |
| Card interaction | Full-size invisible button overlapping a nested Add button | Single article with `role="button"` + separate Add button (no nesting) | Fixes nested interactive element accessibility violation |
| Order number | Hardcoded PC-2418 | Generated from mock API response | Assessment requirement |
| Gradients | Radial green gradient on background, gradient in wheel | No gradients anywhere | Assessment hard constraint |
| Confirmation screen | No orderId from API | orderId from `submitOrder()` response | Assessment requirement |
| Validation | `onSubmit` only, `alert()` fallback | Inline error text, `onBlur` + `onSubmit`, focus management | Assessment requirement |

---

## What I would do with more time

- Download the full Inter variable font subset (Latin + Extended Latin, italic) rather than the single weight file.
- Add an E2E test suite (Playwright) covering the full order flow: welcome -> add items -> checkout -> confirm.
- Add unit tests for `generateSlots` covering all edge cases (midnight, pre-open, post-close, DST transitions).
- Implement the View Transitions API (`document.startViewTransition`) with a CSS fallback for screen transitions.
- Replace the chip grid time picker with a proper CSS scroll-snap wheel for mobile, with `role="listbox"` and keyboard type-ahead.
- Add an error boundary at the app root so unexpected runtime errors show a friendly recovery UI instead of a blank screen.
- Convert product images to WebP/AVIF with `<picture>` fallback elements for better performance.
- Add a `manifest.json` and service worker for offline capability and PWA installability.
- Wire up the real API: replace the mock `submitOrder` with the fetch call, add a retry mechanism for transient network errors, and display a non-intrusive toast for connectivity issues.
- Implement `scroll-margin-top` on form fields so that the sticky order bar does not cover focused inputs on mobile.
