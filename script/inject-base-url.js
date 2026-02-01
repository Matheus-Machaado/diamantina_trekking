/**
 * Injects the correct deploy URL (Netlify) into sitemap.xml and robots.txt.
 *
 * Usage (Netlify build):
 *   node script/inject-base-url.js
 *
 * It replaces occurrences of "__BASE_URL__" with the deploy base URL.
 */
const fs = require("fs");

function getBaseUrl() {
  const raw = (process.env.URL || process.env.DEPLOY_PRIME_URL || "").trim();
  if (!raw) return "";
  return raw.replace(/\/+$/, ""); // remove trailing slash(es)
}

const baseUrl = getBaseUrl();
if (!baseUrl) {
  console.error("ERROR: Base URL not found. Expected Netlify env var URL or DEPLOY_PRIME_URL.");
  process.exit(1);
}

const files = ["sitemap.xml", "robots.txt"];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn(`WARN: ${file} not found, skipping.`);
    continue;
  }
  const content = fs.readFileSync(file, "utf8");
  const updated = content.split("__BASE_URL__").join(baseUrl);
  fs.writeFileSync(file, updated, "utf8");
  console.log(`OK: injected base URL into ${file} -> ${baseUrl}`);
}
