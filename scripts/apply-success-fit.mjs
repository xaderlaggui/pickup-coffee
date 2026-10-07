#!/usr/bin/env node
/**
 * apply-success-fit.mjs
 *
 * Makes the "Order Confirmed" page fit one screen (no page scrolling) while keeping
 * the text readable. Mobile and desktop are SEPARATE files:
 *
 *   src/styles/success-fit.mobile.css   @media (max-width: 899px)   phones + portrait tablets
 *   src/styles/success-fit.desktop.css  @media (min-width: 900px)   web
 *
 * Both are imported LAST from src/index.css so they override the base success styles.
 * No TSX changes are needed.
 *
 *  Mobile : single column, smaller check mark + heading, tighter rows that shrink
 *           to fit the screen height (text stays 15px). If an order is huge
 *           (12+ lines) only the summary card scrolls, never the page.
 *  Desktop: two columns. Left = check mark, title, message, button.
 *           Right = the order summary card. Everything is centred in 100dvh.
 *
 * Usage (project root):
 *   node scripts/apply-success-fit.mjs --dry-run
 *   node scripts/apply-success-fit.mjs
 *   node scripts/apply-success-fit.mjs --undo
 *
 * Re-running refreshes the CSS files. Backup: .success-fit-backup/. Node 18+.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INDEX_CSS = path.join(ROOT, "src", "index.css");
const MOBILE_CSS = path.join(ROOT, "src", "styles", "success-fit.mobile.css");
const DESKTOP_CSS = path.join(ROOT, "src", "styles", "success-fit.desktop.css");
const BACKUP = path.join(ROOT, ".success-fit-backup");
const IMPORTS = [
  '@import "./styles/success-fit.mobile.css";',
  '@import "./styles/success-fit.desktop.css";',
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
const MOBILE = `/* Order Confirmed — MOBILE ONLY (max-width: 899px: phones + portrait tablets).
   Desktop/web lives in success-fit.desktop.css.
   Goal: the whole page fits the screen height, text stays readable. */

@media (max-width: 899px) {
  .success-screen {
    box-sizing: border-box;
    display: flex;
    align-items: stretch;
    justify-content: center;
    height: 100dvh;
    min-height: 0;
    padding:
      calc(12px + env(safe-area-inset-top, 0px))
      16px
      calc(12px + env(safe-area-inset-bottom, 0px));
  }

  .success-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 480px;
    min-height: 0;
  }

  /* header block: smaller, but nothing below ~14px */
  .success-mark {
    flex: 0 0 auto;
    width: 64px;
    height: 64px;
    margin: 0 auto 12px;
    border-width: 5px;
    box-shadow:
      0 0 0 6px rgba(170, 194, 127, 0.25),
      0 8px 24px rgba(170, 194, 127, 0.35);
  }

  .success-mark::after {
    inset: -6px;
  }

  .success-mark svg {
    width: 30px;
    height: 30px;
  }

  .success-content > .eyebrow {
    flex: 0 0 auto;
    margin: 0 0 4px;
  }

  .success-content h1 {
    flex: 0 0 auto;
    font-size: 28px;
    line-height: 34px;
  }

  .success-lead {
    flex: 0 0 auto;
    max-width: 340px;
    margin: 6px auto 14px;
    font-size: 14px;
    line-height: 1.45;
  }

  /* summary card: rows share the available height (30–44px), text stays 15px */
  .success-summary {
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    min-height: 0;
    margin: 0 0 14px;
    padding: 2px 16px;
    border-radius: 16px;
    overflow-y: auto;            /* only kicks in for very long orders */
    overscroll-behavior: contain;
  }

  .success-summary div {
    flex: 1 1 40px;
    min-height: 30px;
    max-height: 44px;
    gap: 12px;
  }

  .success-summary span {
    min-width: 0;
  }

  .success-summary strong {
    flex-shrink: 0;
    text-align: right;
  }

  .success-content > .primary-button {
    flex: 0 0 auto;
  }
}
`;

/* ───────────────────────────── DESKTOP ───────────────────────────── */
const DESKTOP = `/* Order Confirmed — DESKTOP / WEB ONLY (min-width: 900px).
   Mobile lives in success-fit.mobile.css.
   Two columns so the page fits the viewport: message + button on the left,
   order summary on the right. */

@media (min-width: 900px) {
  .success-screen {
    box-sizing: border-box;
    height: 100dvh;
    min-height: 0;
    padding: 24px 40px;
  }

  .success-content {
    display: grid;
    width: min(100%, 960px);
    max-height: 100%;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    /* spacer rows (1fr) keep the left group vertically centred beside the card */
    grid-template-rows: 1fr auto auto auto auto auto 1fr;
    column-gap: 64px;
    align-items: center;
  }

  /* left column */
  .success-mark        { grid-column: 1; grid-row: 2; width: 88px; height: 88px; margin: 0 auto 20px; border-width: 6px; }
  .success-content > .eyebrow { grid-column: 1; grid-row: 3; margin: 0 0 8px; }
  .success-content h1  { grid-column: 1; grid-row: 4; font-size: 40px; line-height: 46px; }
  .success-lead        { grid-column: 1; grid-row: 5; max-width: 380px; margin: 12px auto 24px; font-size: 16px; }
  .success-content > .primary-button {
    grid-column: 1;
    grid-row: 6;
    justify-self: center;
    width: min(100%, 320px);
  }

  .success-mark svg { width: 40px; height: 40px; }

  /* right column: the summary card spans the whole height */
  .success-summary {
    grid-column: 2;
    grid-row: 1 / -1;
    align-self: center;
    margin: 0;
    padding: 6px 24px;
    max-height: 100%;
    overflow-y: auto;            /* only for very long orders */
  }

  .success-summary div {
    min-height: 46px;
    gap: 16px;
  }

  .success-summary span,
  .success-summary strong {
    font-size: 16px;
  }

  .success-summary strong {
    text-align: right;
  }
}

/* short desktop windows */
@media (min-width: 900px) and (max-height: 640px) {
  .success-screen { padding: 16px 40px; }
  .success-mark { width: 68px; height: 68px; margin-bottom: 14px; border-width: 5px; }
  .success-mark svg { width: 32px; height: 32px; }
  .success-content h1 { font-size: 34px; line-height: 40px; }
  .success-lead { margin: 8px auto 16px; }
  .success-summary div { min-height: 38px; }
}
`;

function run() {
  if (!fs.existsSync(INDEX_CSS))
    die(`Can't find ${rel(INDEX_CSS)}. Run this from the project root (the folder with package.json).`);

  const idx = read(INDEX_CSS);
  const missing = IMPORTS.filter((l) => !idx.text.includes(l.match(/styles\/([^"]+)/)[1]));

  console.log("");
  for (const f of [MOBILE_CSS, DESKTOP_CSS])
    console.log(`${fs.existsSync(f) ? "•" : "✔"} ${rel(f)}: ${fs.existsSync(f) ? "exists (will be refreshed)" : "will be created"}`);
  console.log(`${missing.length ? "✔" : "•"} ${rel(INDEX_CSS)}: ${missing.length ? `${missing.length} import(s) appended at the end` : "imports already present (skipped)"}`);

  if (DRY) { console.log("\n--dry-run: nothing was written.\n"); return; }

  if (!fs.existsSync(BACKUP)) {
    fs.mkdirSync(BACKUP, { recursive: true });
    fs.copyFileSync(INDEX_CSS, path.join(BACKUP, "index.css"));
  }
  write(MOBILE_CSS, MOBILE, idx.eol);
  write(DESKTOP_CSS, DESKTOP, idx.eol);
  if (missing.length) {
    const sep = idx.text.endsWith("\n") ? "" : "\n";
    write(INDEX_CSS, idx.text + sep + missing.join("\n") + "\n", idx.eol);
  }
  console.log(`\n✔ Done. Backup in ${rel(BACKUP)}/ — run with --undo to restore.`);
  console.log("  Next: place a test order and check the confirmation page on a phone, a tablet and a desktop window.\n");
}

function undo() {
  const b = path.join(BACKUP, "index.css");
  if (!fs.existsSync(b)) die(`No backup found in ${rel(BACKUP)}.`);
  fs.copyFileSync(b, INDEX_CSS);
  fs.rmSync(MOBILE_CSS, { force: true });
  fs.rmSync(DESKTOP_CSS, { force: true });
  fs.rmSync(BACKUP, { recursive: true, force: true });
  console.log(`\n✔ Restored index.css and removed the two success-fit files.\n`);
}

if (UNDO) undo();
else run();
