#!/usr/bin/env node
/**
 * apply-checkout-mobile.mjs
 *
 * MOBILE-ONLY checkout styling. Creates src/styles/checkout-polish.mobile.css
 * and imports it LAST from src/index.css (after checkout-polish.css).
 *
 * Everything in it is wrapped in @media (max-width: 720px), so desktop / web
 * is not affected. Desktop checkout styles stay in checkout-polish.css and
 * checkout-fit.css.
 *
 * What it does on phones:
 *   - cards (cart item, pair-it-with, details, pick up, payment): smaller radius (14px)
 *     and even 14px padding, instead of the 24px "pill" corners with 10px padding
 *   - inputs / pick-up bar / payment cards: 10px radius, 44px height
 *   - even 12px spacing between cards
 *
 * Usage (project root):
 *   node scripts/apply-checkout-mobile.mjs --dry-run
 *   node scripts/apply-checkout-mobile.mjs
 *   node scripts/apply-checkout-mobile.mjs --undo
 *
 * Re-running refreshes the CSS file. Backup: .checkout-mobile-backup/. Node 18+.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_CSS = path.join(ROOT, "src", "index.css");
const NEW_CSS = path.join(ROOT, "src", "styles", "checkout-polish.mobile.css");
const BACKUP = path.join(ROOT, ".checkout-mobile-backup");
const IMPORT_LINE = '@import "./styles/checkout-polish.mobile.css";';

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

const CSS = `/* Checkout — MOBILE ONLY (max-width: 720px).
   Desktop/web styles live in checkout-polish.css and checkout-fit.css.
   Loaded last from src/index.css so it overrides the older mobile rules. */

@media (max-width: 720px) {
  /* ── One place to tune the mobile look ── */
  .checkout-page {
    --m-card-radius: 14px;     /* cards: was 24px (too round) */
    --m-card-pad: 14px;        /* inner padding of every card */
    --m-control-radius: 10px;  /* inputs, pick-up bar, payment cards */
    --m-gap: 12px;             /* space between cards */
    gap: var(--m-gap);
  }

  #checkout-form {
    --field-h: 44px;
    --field-radius: var(--m-control-radius, 10px);
    --label-gap: 6px;
    gap: var(--m-gap, 12px);
  }

  /* ── Form cards: Your details · Pick up · Payment ── */
  #checkout-form > .checkout-section,
  #checkout-form > .schedule-section {
    padding: var(--m-card-pad, 14px);
    border-radius: var(--m-card-radius, 14px);
    gap: 10px;
  }

  /* the Name + Contact row */
  .details-row {
    gap: 10px;
  }

  /* ── Controls ── */
  #checkout-form .name-input,
  #checkout-form .schedule-summary,
  #checkout-form .payment-card {
    min-height: var(--field-h);
    border-radius: var(--field-radius);
  }

  #checkout-form .name-input {
    padding: 0 12px;
  }

  #checkout-form .schedule-summary {
    padding: 0 12px;
  }

  #checkout-form .payment-card {
    padding: 0 12px;
  }

  #checkout-form .payment-options {
    gap: 10px;
  }

  #checkout-form .payment-note {
    margin: 0 0 6px;
  }

  #checkout-form .schedule-edit-button {
    min-height: 32px;
    min-width: 0;
    padding: 0 14px;
    border-radius: 10px;
  }

  /* ── Cart item + Pair it with: same radius as the other cards ── */
  .checkout-page .cart-list-item-wrap,
  .checkout-page .cart-list-item {
    border-radius: var(--m-card-radius, 14px);
  }

  .checkout-page .pair-with-section {
    margin-top: 0;
    padding: var(--m-card-pad, 14px);
    border-radius: var(--m-card-radius, 14px);
  }

  .checkout-page .pair-with-item {
    border-radius: var(--m-control-radius, 10px);
  }
}
`;

function run() {
  if (!fs.existsSync(INDEX_CSS))
    die(`Can't find ${rel(INDEX_CSS)}. Run this from the project root (the folder with package.json).`);

  const idx = read(INDEX_CSS);
  const hasImport = idx.text.includes("checkout-polish.mobile.css");
  const hasCss = fs.existsSync(NEW_CSS);

  console.log("");
  console.log(`${hasCss ? "•" : "✔"} ${rel(NEW_CSS)}: ${hasCss ? "exists (will be refreshed)" : "will be created"}`);
  console.log(`${hasImport ? "•" : "✔"} ${rel(INDEX_CSS)}: ${hasImport ? "import already present (skipped)" : "import appended at the end"}`);

  if (DRY) { console.log("\n--dry-run: nothing was written.\n"); return; }

  if (!fs.existsSync(BACKUP)) {
    fs.mkdirSync(BACKUP, { recursive: true });
    fs.copyFileSync(INDEX_CSS, path.join(BACKUP, "index.css"));
  }
  write(NEW_CSS, CSS, idx.eol);
  if (!hasImport) {
    const sep = idx.text.endsWith("\n") ? "" : "\n";
    write(INDEX_CSS, idx.text + sep + IMPORT_LINE + "\n", idx.eol);
  }
  console.log(`\n✔ Done. Backup in ${rel(BACKUP)}/ — run with --undo to restore.`);
  console.log("  Next: reload and check the checkout page at phone width (and confirm desktop is unchanged).\n");
}

function undo() {
  const b = path.join(BACKUP, "index.css");
  if (!fs.existsSync(b)) die(`No backup found in ${rel(BACKUP)}.`);
  fs.copyFileSync(b, INDEX_CSS);
  fs.rmSync(NEW_CSS, { force: true });
  fs.rmSync(BACKUP, { recursive: true, force: true });
  console.log(`\n✔ Restored index.css and removed ${rel(NEW_CSS)}.\n`);
}

if (UNDO) undo();
else run();
