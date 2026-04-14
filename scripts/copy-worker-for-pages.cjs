/**
 * Cloudflare Pages expects `_worker.js` at the root of `pages_build_output_dir`.
 * OpenNext emits `worker.js` next to `cloudflare/`, `middleware/`, etc. — all paths
 * are relative to `.open-next/`, so output dir must be `.open-next`, not `.open-next/assets`.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, ".open-next", "worker.js");
const dest = path.join(root, ".open-next", "_worker.js");

if (!fs.existsSync(src)) {
  console.error("Missing .open-next/worker.js — run opennextjs-cloudflare build first.");
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log("Copied .open-next/worker.js -> .open-next/_worker.js for Pages.");
