#!/usr/bin/env node
/**
 * apply-card-cart-badge.mjs
 *
 * Shows "how many of this item are in the cart" at the UPPER RIGHT of every product card.
 *
 * Why it wasn't visible: the badge (.count-badge, z-index 2) already existed, but the card's
 * preview overlay (.card-preview, z-index 5) is drawn on top of it - always on phones, and on
 * hover/focus on desktop. This script lifts the badge above the overlay and restyles it so it is
 * readable on the green card background (white chip, dark text, soft shadow).
 *
 * Mobile and desktop are SEPARATE files, both imported LAST from src/index.css:
 *   src/styles/card-count-badge.mobile.css    @media (max-width: 720px)
 *   src/styles/card-count-badge.desktop.css   @media (min-width: 721px)
 *
 * It also adds an accessible label ("2 in cart") to the badge in CoffeeCard.tsx.
 *
 * Desktop hover animation (per product card, only on devices that can hover):
 *   - card lifts with a soft spring and a deeper shadow
 *   - the cup floats up and tilts slightly
 *   - the Add button rises and glows
 *   - the in-cart badge gives a small pop
 *   - all of it is switched off for people who prefer reduced motion
 * Phones/touch screens have no hover, so the mobile file is unchanged.
 *
 * Usage (project root):
 *   node scripts/apply-card-cart-badge.mjs --dry-run
 *   node scripts/apply-card-cart-badge.mjs
 *   node scripts/apply-card-cart-badge.mjs --undo
 *
 * Safe to re-run. Backup: .card-badge-backup/. No dependencies, Node 18+.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_CSS = path.join(ROOT, "src", "index.css");
const TSX = path.join(ROOT, "src", "components", "CoffeeCard.tsx");
const MOBILE_CSS = path.join(ROOT, "src", "styles", "card-count-badge.mobile.css");
const DESKTOP_CSS = path.join(ROOT, "src", "styles", "card-count-badge.desktop.css");
const BACKUP = path.join(ROOT, ".card-badge-backup");
const IMPORTS = [
  '@import "./styles/card-count-badge.mobile.css";',
  '@import "./styles/card-count-badge.desktop.css";',
];

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const UNDO = args.has("--undo");

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const die = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };
const read = (f) => {
  const raw = fs.readFileSync(f, "utf8");
  return { text: raw.replace(/\r\n/g, "\n"), eol: raw.includes("\r\n") ? "\r\n" : "\n" };
};
const write = (f, text, eol) => fs.writeFileSync(f, text.replace(/\n/g, eol));

/* ───────────────────────────── MOBILE ───────────────────────────── */
const MOBILE = `/* Product card "in cart" badge — MOBILE ONLY (max-width: 720px).
   Desktop/web lives in card-count-badge.desktop.css. */

@media (max-width: 720px) {
  .coffee-card .count-badge {
    z-index: 6;              /* above .card-preview (5), below the click layer (10) */
    top: 10px;
    right: 10px;
    width: auto;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    box-sizing: border-box;
    border: 2px solid var(--green);
    border-radius: 999px;
    color: var(--text);
    background: var(--surface-raised, #fff);
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
    box-shadow: 0 3px 10px rgba(33, 38, 34, 0.22);
    pointer-events: none;
  }
}
`;

/* ───────────────────────────── DESKTOP ───────────────────────────── */
const DESKTOP = `/* Product card "in cart" badge + hover animation — DESKTOP / WEB ONLY.
   Mobile lives in card-count-badge.mobile.css (touch screens have no hover). */

/* ── "In cart" badge ───────────────────────────────────────── */
@media (min-width: 721px) {
  .coffee-card .count-badge {
    z-index: 6;              /* above .card-preview (5), below the click layer (10) */
    top: 14px;
    right: 14px;
    width: auto;
    min-width: 34px;
    height: 34px;
    padding: 0 10px;
    box-sizing: border-box;
    border: 2px solid var(--green);
    border-radius: 999px;
    color: var(--text);
    background: var(--surface-raised, #fff);
    font-size: 15px;
    font-weight: 800;
    line-height: 1;
    box-shadow: 0 4px 14px rgba(33, 38, 34, 0.22);
    pointer-events: none;
    transition: scale 320ms var(--spring-snappy);
  }
}

/* ── Smooth hover animation per product card ───────────────── */
@media (hover: hover) and (min-width: 721px) {
  .coffee-card {
    transition:
      transform 480ms var(--spring-smooth),
      box-shadow 420ms var(--ease-out),
      border-color 300ms var(--ease-out),
      filter var(--dur-press) var(--ease-out),
      background-color var(--dur-fade) var(--ease-in-out);
  }

  /* card: gentle lift + deeper shadow */
  .coffee-card:hover {
    transform: translateY(-6px) scale(1.012);
    border-color: #A0BA78;
    box-shadow:
      0 6px 14px rgba(33, 38, 34, 0.07),
      0 22px 48px rgba(33, 38, 34, 0.14);
  }

  /* cup: floats up and tilts a touch */
  .coffee-card .product-visual img {
    transition: transform 620ms var(--spring-smooth);
    will-change: transform;
  }

  .coffee-card:hover .product-visual img {
    transform: translateY(-8px) scale(1.06) rotate(-3deg);
  }

  /* Add button: rises and glows */
  .coffee-card .add-button {
    transition:
      transform 360ms var(--spring-snappy),
      box-shadow 360ms var(--ease-out),
      background-color var(--dur-press) var(--ease-out);
  }

  .coffee-card:hover .add-button {
    transform: translateY(-1px) scale(1.04);
    box-shadow: 0 8px 18px rgba(134, 171, 93, 0.38);
  }

  /* in-cart badge: small pop (uses "scale" so it doesn't fight its entrance animation) */
  .coffee-card:hover .count-badge {
    scale: 1.12;
  }

  /* keep the press feedback snappy */
  .coffee-card:hover:active {
    transform: translateY(-3px) scale(0.97);
    transition-duration: var(--dur-press);
  }
}

/* ── Respect "reduce motion" ───────────────────────────────── */
@media (hover: hover) and (min-width: 721px) and (prefers-reduced-motion: reduce) {
  .coffee-card,
  .coffee-card .product-visual img,
  .coffee-card .add-button,
  .coffee-card .count-badge {
    transition-duration: 1ms;
  }

  .coffee-card:hover,
  .coffee-card:hover .product-visual img,
  .coffee-card:hover .add-button {
    transform: none;
  }

  .coffee-card:hover .count-badge {
    scale: 1;
  }
}
`;

const TSX_FROM = '<span key={quantity} className="count-badge tabular">{quantity}</span>';
const TSX_TO = '<span key={quantity} className="count-badge tabular" role="img" aria-label={`${quantity} in cart`}>{quantity}</span>';

function run() {
  for (const f of [INDEX_CSS, TSX])
    if (!fs.existsSync(f)) die(`Can't find ${rel(f)}. Run this from the project root (the folder with package.json).`);

  const idx = read(INDEX_CSS);
  const tsx = read(TSX);
  const missing = IMPORTS.filter((l) => !idx.text.includes(l.match(/styles\/([^"]+)/)[1]));

  let tsxNext = tsx.text, tsxState;
  if (tsx.text.includes(TSX_TO)) tsxState = "already applied";
  else if (tsx.text.split(TSX_FROM).length - 1 === 1) { tsxNext = tsx.text.replace(TSX_FROM, () => TSX_TO); tsxState = "patched"; }
  else die(`${rel(TSX)}: couldn't find the count-badge <span>. The file may have changed — add aria-label manually or skip this step.`);

  console.log("");
  for (const f of [MOBILE_CSS, DESKTOP_CSS])
    console.log(`${fs.existsSync(f) ? "•" : "✔"} ${rel(f)}: ${fs.existsSync(f) ? "exists (will be refreshed)" : "will be created"}`);
  console.log(`${missing.length ? "✔" : "•"} ${rel(INDEX_CSS)}: ${missing.length ? `${missing.length} import(s) appended at the end` : "imports already present (skipped)"}`);
  console.log(`${tsxState === "patched" ? "✔" : "•"} ${rel(TSX)}: ${tsxState === "patched" ? "added aria-label to the badge" : tsxState}`);

  if (DRY) { console.log("\n--dry-run: nothing was written.\n"); return; }

  if (!fs.existsSync(BACKUP)) {
    fs.mkdirSync(BACKUP, { recursive: true });
    fs.copyFileSync(INDEX_CSS, path.join(BACKUP, "index.css"));
    fs.copyFileSync(TSX, path.join(BACKUP, "CoffeeCard.tsx"));
  }
  write(MOBILE_CSS, MOBILE, idx.eol);
  write(DESKTOP_CSS, DESKTOP, idx.eol);
  if (missing.length) {
    const sep = idx.text.endsWith("\n") ? "" : "\n";
    write(INDEX_CSS, idx.text + sep + missing.join("\n") + "\n", idx.eol);
  }
  if (tsxState === "patched") write(TSX, tsxNext, tsx.eol);

  console.log(`\n✔ Done. Backup in ${rel(BACKUP)}/ — run with --undo to restore.`);
  console.log("  Next: add an item to the cart and look at its card (count at the top right), then hover over the cards on a desktop window.\n");
}

function undo() {
  const bIdx = path.join(BACKUP, "index.css");
  const bTsx = path.join(BACKUP, "CoffeeCard.tsx");
  if (!fs.existsSync(bIdx) || !fs.existsSync(bTsx)) die(`No backup found in ${rel(BACKUP)}.`);
  fs.copyFileSync(bIdx, INDEX_CSS);
  fs.copyFileSync(bTsx, TSX);
  fs.rmSync(MOBILE_CSS, { force: true });
  fs.rmSync(DESKTOP_CSS, { force: true });
  fs.rmSync(BACKUP, { recursive: true, force: true });
  console.log("\n✔ Restored index.css and CoffeeCard.tsx, removed the two badge CSS files.\n");
}

if (UNDO) undo();
else run();
