#!/usr/bin/env node
/**
 * apply-checkout-polish.mjs
 *
 * Creates src/styles/checkout-polish.css and imports it LAST from src/index.css
 * (after checkout-fit.css), so it overrides the older checkout rules.
 *
 *  - "Name for pickup", "Contact", "Pick up", "Payment method": one shared label style
 *  - Name input, Pick-up summary and Payment cards: same height / radius / surface
 *  - Desktop: the free space in the right column is shared evenly between the
 *    three sections (no big blank gap above the button)
 *  - Cart item on the left: raised card with a soft shadow
 *  - Place Order button: soft green glow when enabled
 *
 * Usage (project root):
 *   node scripts/apply-checkout-polish.mjs --dry-run
 *   node scripts/apply-checkout-polish.mjs
 *   node scripts/apply-checkout-polish.mjs --undo
 *
 * Re-running refreshes the CSS file. Backup: .checkout-polish-backup/. Node 18+.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_CSS = path.join(ROOT, "src", "index.css");
const NEW_CSS = path.join(ROOT, "src", "styles", "checkout-polish.css");
const BACKUP = path.join(ROOT, ".checkout-polish-backup");
const IMPORT_LINE = '@import "./styles/checkout-polish.css";';

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

const CSS = `/* Checkout polish: uniform labels, balanced spacing, soft shadows.
   Loaded LAST from src/index.css (after checkout-fit.css). */

/* ── One size for every field control ──────────────────────── */
#checkout-form {
  --field-h: 48px;
  --field-radius: var(--radius-control);
  --label-gap: 8px;
}

/* ── 1. Uniform section labels ─────────────────────────────── */
/* Name for pickup · Contact · Pick up · Payment method */
#checkout-form .name-field,
#checkout-form .payment-legend,
#checkout-form .schedule-section .section-heading .eyebrow {
  margin: 0;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--green-text, var(--text));
}

#checkout-form .name-field:focus-within {
  color: var(--green-text, var(--text));
}

/* the label's typography must not leak into the typed text */
#checkout-form .name-input {
  font-size: var(--font-size-body, 15px);
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
}

#checkout-form .payment-legend {
  margin-bottom: var(--label-gap);
}

#checkout-form .schedule-section .section-heading {
  margin-bottom: 0;
}

/* ── 2. Same height / radius / surface for the controls ───── */
#checkout-form .name-input,
#checkout-form .schedule-summary,
#checkout-form .payment-card {
  min-height: var(--field-h);
  border-radius: var(--field-radius);
}

#checkout-form .name-input {
  margin-top: var(--label-gap);
  background: var(--surface-raised);
  border: 1px solid var(--line);
  box-shadow: 0 1px 2px rgba(33, 38, 34, 0.05);
}

#checkout-form .name-input:focus {
  border-color: var(--green);
}

#checkout-form .name-field::after {
  height: var(--field-h);
  border-radius: var(--field-radius);
}

#checkout-form .schedule-summary {
  padding: 0 14px;
  background: var(--surface-raised);
  border: 1px solid var(--line);
  box-shadow: 0 1px 2px rgba(33, 38, 34, 0.05);
  font-size: var(--font-size-description, 13px);
}

#checkout-form .schedule-summary strong {
  font-size: var(--font-size-text, 15px);
}

#checkout-form .payment-card {
  box-shadow: 0 1px 2px rgba(33, 38, 34, 0.05);
}

#checkout-form .payment-card.selected {
  box-shadow: 0 4px 12px rgba(134, 171, 93, 0.28);
}

/* ── 3. Place Order: soft glow when enabled ────────────────── */
#checkout-form .desktop-place-order:not(:disabled) {
  box-shadow: 0 8px 20px rgba(134, 171, 93, 0.35);
}

/* ── 4. Desktop: balance the empty space ───────────────────── */
@media (min-width: 900px) {
  /* The three sections share the free height evenly and keep
     their content centred between the dividers. */
  #checkout-form > .details-section,
  #checkout-form > .schedule-section,
  #checkout-form > .payment-section {
    flex: 1 1 auto;
    max-height: 230px;            /* don't get airy on very tall screens */
    display: grid;
    align-content: center;
    row-gap: var(--label-gap);
  }

  #checkout-form > .details-section {
    padding: 4px 0 16px;
  }

  #checkout-form > .schedule-section,
  #checkout-form > .payment-section {
    padding: 14px 0;
  }

  #checkout-form .payment-note {
    margin: 0 0 4px;
  }

  #checkout-form .payment-options {
    margin: 0;
  }

  /* compact Edit button so the Pick-up heading row matches the other labels */
  #checkout-form .schedule-edit-button {
    min-height: 32px;
    min-width: 0;
    padding: 0 14px;
  }

  /* ── cart item: raised card with a soft shadow ── */
  .checkout-page .checkout-cart-column .cart-scroll-area {
    padding: 8px 20px 16px;       /* room so the shadow isn't clipped */
  }

  .checkout-page .checkout-cart-column .cart-list-item-wrap {
    border-bottom: 0;
    padding-bottom: 12px;
  }

  .checkout-page .checkout-cart-column .cart-list-item {
    padding: 12px 16px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--surface-raised);
    box-shadow:
      0 2px 6px rgba(33, 38, 34, 0.06),
      0 12px 28px rgba(33, 38, 34, 0.10);
  }
}

/* ── 5. Short windows: shrink the shared control height ────── */
@media (min-width: 900px) and (max-height: 760px) {
  #checkout-form {
    --field-h: 40px;
    --label-gap: 6px;
  }

  #checkout-form > .details-section {
    padding: 2px 0 10px;
  }

  #checkout-form > .schedule-section,
  #checkout-form > .payment-section {
    padding: 10px 0;
  }

  .checkout-page .checkout-cart-column .cart-list-item {
    padding: 10px 14px;
  }
}
`;

function run() {
  if (!fs.existsSync(INDEX_CSS))
    die(`Can't find ${rel(INDEX_CSS)}. Run this from the project root (the folder with package.json).`);

  const idx = read(INDEX_CSS);
  const hasImport = idx.text.includes("checkout-polish.css");
  const hasCss = fs.existsSync(NEW_CSS);
  const fitApplied = idx.text.includes("checkout-fit.css");

  console.log("");
  console.log(`${hasCss ? "•" : "✔"} ${rel(NEW_CSS)}: ${hasCss ? "exists (will be refreshed)" : "will be created"}`);
  console.log(`${hasImport ? "•" : "✔"} ${rel(INDEX_CSS)}: ${hasImport ? "import already present (skipped)" : "import appended at the end"}`);
  if (!fitApplied)
    console.log("⚠ checkout-fit.css isn't imported yet. This still works, but run apply-checkout-fit.mjs too for the one-row Name/Contact layout.");

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
  console.log("  Next: reload the checkout page at desktop width, then try a ~600px and a ~900px tall window.\n");
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
