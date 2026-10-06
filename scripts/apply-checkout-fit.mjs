#!/usr/bin/env node
/**
 * apply-checkout-fit.mjs
 *
 * 1. CheckoutView.tsx: wraps "Name for pickup" + "Contact" in <div className="details-row">
 *    (one row) and shortens the phone placeholder to "Phone (optional)".
 * 2. Creates src/styles/checkout-fit.css:
 *      - two-column details row
 *      - desktop: Place Order button pinned to the bottom of the right column
 *      - short windows (<= 760px tall): compact spacing so the right column fits
 * 3. Appends an @import for it to the END of src/index.css so it loads last
 *    (it wins ties against the older checkout/responsive rules).
 *
 * Usage (from the project root):
 *   node scripts/apply-checkout-fit.mjs --dry-run   # preview, writes nothing
 *   node scripts/apply-checkout-fit.mjs             # apply
 *   node scripts/apply-checkout-fit.mjs --undo      # restore originals
 *
 * Safe to re-run: it detects if the change is already applied.
 * Originals are backed up to .checkout-fit-backup/. No dependencies, Node 18+.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TSX = path.join(ROOT, "src", "components", "CheckoutView.tsx");
const INDEX_CSS = path.join(ROOT, "src", "index.css");
const NEW_CSS = path.join(ROOT, "src", "styles", "checkout-fit.css");
const BACKUP = path.join(ROOT, ".checkout-fit-backup");
const IMPORT_LINE = '@import "./styles/checkout-fit.css";';

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

const CSS = `/* Checkout: fit the right column to the viewport (desktop) and
   lay "Name" + "Contact" out in a single row.
   Loaded LAST from src/index.css so it overrides older checkout rules. */

/* ── Name + Contact in one row ─────────────────────────────── */
.details-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}

/* .name-field is height: 8px in forms.css (the input overflows it).
   In a row that would collapse the grid, so size it to its content here only. */
.details-row .name-field {
  height: auto;
  min-width: 0;
}

/* Only stack on very small phones */
@media (max-width: 340px) {
  .details-row {
    grid-template-columns: 1fr;
  }
}

/* ── Desktop: Place Order stays visible ────────────────────── */
@media (min-width: 900px) {
  .checkout-submit-area {
    position: sticky;
    bottom: 0;
    z-index: 2;
    margin-bottom: -20px;   /* cancel the column's 20px bottom padding */
    padding-bottom: 20px;
    background: var(--surface);
  }
}

/* ── Short laptop windows: compact spacing ─────────────────── */
@media (min-width: 900px) and (max-height: 760px) {
  .checkout-details-column {
    padding-top: 14px;
  }

  #checkout-form > .details-section {
    padding-bottom: 12px;
  }

  #checkout-form > .schedule-section,
  #checkout-form > .payment-section {
    padding: 12px 0;
  }

  #checkout-form .name-input {
    min-height: 40px;
  }

  #checkout-form .name-field::after {
    height: 40px;           /* focus ring matches the input */
  }

  #checkout-form .desktop-place-order {
    min-height: 44px;
  }

  .checkout-submit-area {
    gap: 8px;
    padding-top: 10px;
  }
}
`;

/** Wrap the two name-field labels in <div className="details-row">. Returns new text or null. */
function patchTsx(text) {
  if (text.includes("details-row")) return { text, already: true };

  const first = text.indexOf('<label className="name-field" htmlFor="pickup-name"');
  if (first === -1) return null;
  const contactAt = text.indexOf('<label className="name-field" htmlFor="pickup-contact"', first);
  if (contactAt === -1) return null;
  const closeTag = "</label>";
  const contactEnd = text.indexOf(closeTag, contactAt);
  if (contactEnd === -1) return null;
  const end = contactEnd + closeTag.length;

  // indentation of the first label's line
  const lineStart = text.lastIndexOf("\n", first) + 1;
  const indent = text.slice(lineStart, first);
  if (/\S/.test(indent)) return null; // label isn't at the start of its line; bail out safely

  let block = text.slice(lineStart, end);
  block = block.replace('placeholder="Phone number (optional)"', 'placeholder="Phone (optional)"');
  const inner = block.split("\n").map((l) => "  " + l).join("\n");
  const wrapped = `${indent}<div className="details-row">\n${inner}\n${indent}</div>`;

  return { text: text.slice(0, lineStart) + wrapped + text.slice(end), already: false };
}

function run() {
  for (const f of [TSX, INDEX_CSS])
    if (!fs.existsSync(f)) die(`Can't find ${rel(f)}. Run this from the project root (the folder with package.json).`);

  const tsx = read(TSX);
  const patched = patchTsx(tsx.text);
  if (!patched)
    die(`Couldn't find the two name-field <label> lines in ${rel(TSX)}. The file may have changed — wrap them in <div className="details-row"> manually.`);

  const idx = read(INDEX_CSS);
  const hasImport = idx.text.includes("checkout-fit.css");
  const hasCss = fs.existsSync(NEW_CSS);

  console.log("");
  console.log(`${patched.already ? "•" : "✔"} ${rel(TSX)}: ${patched.already ? "already has details-row (skipped)" : "wrapped Name + Contact in .details-row, shortened phone placeholder"}`);
  console.log(`${hasCss ? "•" : "✔"} ${rel(NEW_CSS)}: ${hasCss ? "already exists (will be refreshed)" : "will be created"}`);
  console.log(`${hasImport ? "•" : "✔"} ${rel(INDEX_CSS)}: ${hasImport ? "import already present (skipped)" : "import appended at the end"}`);

  if (DRY) { console.log("\n--dry-run: nothing was written.\n"); return; }

  if (!fs.existsSync(BACKUP)) {
    fs.mkdirSync(BACKUP, { recursive: true });
    fs.copyFileSync(TSX, path.join(BACKUP, "CheckoutView.tsx"));
    fs.copyFileSync(INDEX_CSS, path.join(BACKUP, "index.css"));
  }

  if (!patched.already) write(TSX, patched.text, tsx.eol);
  write(NEW_CSS, CSS, idx.eol);
  if (!hasImport) {
    const sep = idx.text.endsWith("\n") ? "" : "\n";
    write(INDEX_CSS, idx.text + sep + IMPORT_LINE + "\n", idx.eol);
  }

  console.log(`\n✔ Done. Backups in ${rel(BACKUP)}/ — run with --undo to restore.`);
  console.log("  Next: npm run dev, open the checkout page, and resize the window between ~600px and 900px tall.\n");
}

function undo() {
  const bTsx = path.join(BACKUP, "CheckoutView.tsx");
  const bIdx = path.join(BACKUP, "index.css");
  if (!fs.existsSync(bTsx) || !fs.existsSync(bIdx)) die(`No backup found in ${rel(BACKUP)}.`);
  fs.copyFileSync(bTsx, TSX);
  fs.copyFileSync(bIdx, INDEX_CSS);
  fs.rmSync(NEW_CSS, { force: true });
  fs.rmSync(BACKUP, { recursive: true, force: true });
  console.log(`\n✔ Restored CheckoutView.tsx and index.css, removed ${rel(NEW_CSS)}.\n`);
}

if (UNDO) undo();
else run();
