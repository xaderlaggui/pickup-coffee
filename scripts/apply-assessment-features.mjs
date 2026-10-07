#!/usr/bin/env node
/**
 * apply-assessment-features.mjs
 *
 * 1) "Recommendations" menu filter (FIRST tab, and the default one):
 *      Americano  - P75
 *      Latte      - P85
 *      Black Coffee - P65
 *    The product prices in src/data/coffee.ts are updated to match
 *    (Americano 50 -> 75, Latte 75 -> 85, Black Coffee already 65), so the cart,
 *    checkout and the menu all show the same price.
 *
 * 2) Order submission prepared "as if sending to an API":
 *      - src/api/orders.ts builds the request payload and contains the real
 *        fetch() request handling, COMMENTED OUT
 *      - every order is treated as successful (returns { ok: true, ... })
 *      - App.tsx submit() builds the payload and calls submitOrder()
 *
 * Usage (project root):
 *   node scripts/apply-assessment-features.mjs --dry-run
 *   node scripts/apply-assessment-features.mjs
 *   node scripts/apply-assessment-features.mjs --undo
 *
 * Safe to re-run (already-applied edits are skipped). Originals are backed up to
 * .assessment-backup/. No dependencies, Node 18+.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const BACKUP = path.join(ROOT, ".assessment-backup");
const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const UNDO = args.has("--undo");

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const die = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };
const read = (f) => {
  const raw = fs.readFileSync(f, "utf8");
  return { text: raw.replace(/\r\n/g, "\n"), eol: raw.includes("\r\n") ? "\r\n" : "\n" };
};
const write = (f, text, eol) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text.replace(/\n/g, eol)); };

/* ───────────────────────────── new files ───────────────────────────── */

const RECOMMENDATIONS_TS = `/**
 * Products shown under the "Recommendations" filter, in display order.
 * (ids refer to src/data/coffee.ts)
 *   2 = Americano     P75
 *   1 = Latte         P85
 *   3 = Black Coffee  P65
 */
export const recommendedProductIds: number[] = [2, 1, 3]
`;

const ORDERS_TS = `import type { Coffee, CoffeeSize } from "../types"
import { itemPrice } from "../utils/cart"

/* ============================================================
   ORDER SUBMISSION (prepared as if sending to an API)
   ============================================================
   The backend is not built for this assessment. This module:
     1. builds the exact JSON payload an API would receive
     2. contains the real request handling (fetch) - COMMENTED OUT
     3. treats every order as successful
   To go live: uncomment the block inside submitOrder() and remove the mock return.
   ============================================================ */

// const ORDERS_ENDPOINT = \`\${import.meta.env.VITE_API_URL}/api/orders\`

export type OrderPayload = {
  clientOrderId: string // idempotency key: retrying the same order never duplicates it
  submittedAt: string // ISO 8601
  customer: { name: string; contact: string | null }
  pickup: { day: "Today" | "Tomorrow"; time: string }
  payment: { method: string }
  items: Array<{
    productId: number
    name: string
    category: Coffee["category"]
    quantity: number
    temperature: "Iced" | "Hot" | null // null for pastries
    size: CoffeeSize | null // null for pastries
    note: string | null
    unitPrice: number
    lineTotal: number
  }>
  totals: { itemCount: number; amount: number; currency: "PHP" }
}

export type OrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string }

type BuildOrderInput = {
  coffees: Coffee[]
  cart: Record<number, number>
  cartTemps: Record<number, "Iced" | "Hot">
  cartSizes: Record<number, CoffeeSize>
  cartNotes: Record<number, string>
  name: string
  contact: string
  day: "Today" | "Tomorrow"
  time: string
  payment: string
}

export function buildOrderPayload(input: BuildOrderInput): OrderPayload {
  const { coffees, cart, cartTemps, cartSizes, cartNotes } = input

  const items = coffees
    .filter((coffee) => (cart[coffee.id] || 0) > 0)
    .map((coffee) => {
      const isPastry = coffee.category === "pastry"
      const size = cartSizes[coffee.id] || "Medium"
      const quantity = cart[coffee.id]
      const unitPrice = itemPrice(coffee, size)
      return {
        productId: coffee.id,
        name: coffee.name,
        category: coffee.category,
        quantity,
        temperature: isPastry ? null : cartTemps[coffee.id] || "Iced",
        size: isPastry ? null : size,
        note: cartNotes[coffee.id]?.trim() || null,
        unitPrice,
        lineTotal: unitPrice * quantity,
      }
    })

  return {
    clientOrderId: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    customer: { name: input.name.trim(), contact: input.contact.trim() || null },
    pickup: { day: input.day, time: input.time },
    payment: { method: input.payment },
    items,
    totals: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      amount: items.reduce((sum, item) => sum + item.lineTotal, 0),
      currency: "PHP",
    },
  }
}

export async function submitOrder(payload: OrderPayload): Promise<OrderResult> {
  /* ---- Real API request (commented out for the assessment) ----
  try {
    const response = await fetch(ORDERS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": payload.clientOrderId,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return { ok: false, error: \`Order failed (HTTP \${response.status})\` }
    }

    const data: { orderId: string } = await response.json()
    return { ok: true, orderId: data.orderId }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" }
  }
  ------------------------------------------------------------- */

  // Assessment: assume every order is successful.
  return { ok: true, orderId: payload.clientOrderId }
}
`;

/* ───────────────────────────── edits to existing files ───────────────────────────── */

// Each edit: [from, to]. "from" must match exactly once (LF-normalised) unless "to" is already present.
const EDITS = [
  {
    file: "src/types/index.ts",
    edits: [
      [
        'export type MenuFilter = "best-sellers" | ProductCategory',
        'export type MenuFilter = "recommendations" | "best-sellers" | ProductCategory',
      ],
    ],
  },
  {
    file: "src/data/coffee.ts",
    edits: [
      ['product(1, "Latte", 75,', 'product(1, "Latte", 85,'],
      ['product(2, "Americano", 50,', 'product(2, "Americano", 75,'],
    ],
  },
  {
    file: "src/components/MenuFilters.tsx",
    edits: [
      [
        '  { id: "best-sellers", label: "Best Sellers" },',
        '  { id: "recommendations", label: "Recommendations" },\n  { id: "best-sellers", label: "Best Sellers" },',
      ],
    ],
  },
  {
    file: "src/components/MenuSection.tsx",
    edits: [
      [
        'import { ProductGrid } from "./ProductGrid"\n',
        'import { ProductGrid } from "./ProductGrid"\nimport { recommendedProductIds } from "../data/recommendations"\n',
      ],
      [
        '  "best-sellers": { title: "Our best sellers",',
        '  recommendations: { title: "Recommendations", subtitle: "Our top picks to start your order" },\n  "best-sellers": { title: "Our best sellers",',
      ],
      [
        'useState<MenuFilter>("best-sellers")',
        'useState<MenuFilter>("recommendations")',
      ],
      [
        'const visibleProducts = useMemo(() => active === "best-sellers" ? products.filter((product) => product.isBestSeller) : products.filter((product) => product.category === active), [active, products])',
        `const visibleProducts = useMemo(() => {
    if (active === "recommendations") return recommendedProductIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Coffee => Boolean(product))
    if (active === "best-sellers") return products.filter((product) => product.isBestSeller)
    return products.filter((product) => product.category === active)
  }, [active, products])`,
      ],
    ],
  },
  {
    file: "src/App.tsx",
    edits: [
      [
        'import { itemPrice } from "./utils/cart"\n',
        'import { itemPrice } from "./utils/cart"\nimport { buildOrderPayload, submitOrder } from "./api/orders"\n',
      ],
      [
        `  const submit = () => {
    if (time === "Closed" || !name.trim() || loading || cart.items === 0) return
    setLoading(true)
    nav.later(() => {
      nav.setConfirmed(true)
      setLoading(false)
    }, 600)
  }`,
        `  const submit = async () => {
    if (time === "Closed" || !name.trim() || loading || cart.items === 0) return
    setLoading(true)

    // Prepare the submission as if sending it to an API (see src/api/orders.ts;
    // the real fetch() is commented out there and every order is treated as successful).
    const payload = buildOrderPayload({
      coffees,
      cart: cart.cart,
      cartTemps: cart.cartTemps,
      cartSizes: cart.cartSizes,
      cartNotes: cart.cartNotes,
      name,
      contact,
      day,
      time,
      payment,
    })
    await submitOrder(payload)

    nav.later(() => {
      nav.setConfirmed(true)
      setLoading(false)
    }, 600)
  }`,
      ],
    ],
  },
];

const NEW_FILES = [
  ["src/data/recommendations.ts", RECOMMENDATIONS_TS],
  ["src/api/orders.ts", ORDERS_TS],
];

/* ───────────────────────────── run ───────────────────────────── */

function plan() {
  const steps = [];
  for (const { file, edits } of EDITS) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) die(`Can't find ${file}. Run this from the project root (the folder with package.json).`);
    const { text, eol } = read(abs);
    let next = text;
    const status = [];
    for (const [from, to] of edits) {
      if (next.includes(to)) {
        status.push("already applied");
        continue;
      }
      const count = next.split(from).length - 1;
      if (count !== 1) die(`${file}: expected to find this exactly once but found ${count}:\n    ${from.split("\n")[0].slice(0, 100)}\n  The file may have changed since this script was written.`);
      next = next.replace(from, () => to);
      status.push("patched");
    }
    steps.push({ abs, file, eol, next, changed: next !== text, status });
  }
  return steps;
}

function run() {
  const steps = plan();
  console.log("");
  for (const s of steps) console.log(`${s.changed ? "✔" : "•"} ${s.file}: ${s.changed ? `${s.status.filter((x) => x === "patched").length} edit(s)` : "already applied"}`);
  const eol = steps.find((s) => s.file.endsWith("App.tsx"))?.eol ?? "\n";
  for (const [file] of NEW_FILES) {
    const abs = path.join(ROOT, file);
    console.log(`${fs.existsSync(abs) ? "•" : "✔"} ${file}: ${fs.existsSync(abs) ? "exists (will be refreshed)" : "will be created"}`);
  }

  if (DRY) { console.log("\n--dry-run: nothing was written.\n"); return; }

  if (!fs.existsSync(BACKUP)) {
    fs.mkdirSync(BACKUP, { recursive: true });
    for (const { file } of EDITS) {
      const dest = path.join(BACKUP, file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, file), dest);
    }
  }
  for (const s of steps) if (s.changed) write(s.abs, s.next, s.eol);
  for (const [file, content] of NEW_FILES) write(path.join(ROOT, file), content, eol);

  console.log(`\n✔ Done. Backup in ${rel(BACKUP)}/ — run with --undo to restore.`);
  console.log("  Next: npm run dev → the first filter is now \"Recommendations\"; place a test order and check the confirmation page.\n");
}

function undo() {
  if (!fs.existsSync(BACKUP)) die(`No backup found in ${rel(BACKUP)}.`);
  for (const { file } of EDITS) fs.copyFileSync(path.join(BACKUP, file), path.join(ROOT, file));
  for (const [file] of NEW_FILES) fs.rmSync(path.join(ROOT, file), { force: true });
  for (const dir of ["src/api"]) {
    const abs = path.join(ROOT, dir);
    if (fs.existsSync(abs) && fs.readdirSync(abs).length === 0) fs.rmdirSync(abs);
  }
  fs.rmSync(BACKUP, { recursive: true, force: true });
  console.log("\n✔ Restored the original files and removed the new ones.\n");
}

if (UNDO) undo();
else run();
