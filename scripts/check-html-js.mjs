#!/usr/bin/env node
import { readFileSync } from "node:fs";
import vm from "node:vm";

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("Usage: node scripts/check-html-js.mjs <file.html> [...]");
  process.exit(2);
}

const scriptPattern = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

const domIdLookupPattern = /\$\(["']([^"']+)["']\)/g;
const checkoutSignalPattern = /\b(createOrder|renderProduct|renderPaymentMethods|renderSummary|orderBumpData|checkoutItems)\b/;

function hasIdTarget(html, id) {
  return new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(html);
}

function checkoutDomIdsUsed(script) {
  if (!checkoutSignalPattern.test(script)) return [];
  const ids = new Set();
  for (const match of script.matchAll(domIdLookupPattern)) {
    ids.add(match[1]);
  }
  return [...ids].filter((id) => /^(product-content|payment-content|summary-content|order-bump|order-bump-content|order-bump-card)$/.test(id));
}

let failed = false;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const scripts = [...html.matchAll(scriptPattern)];

  if (scripts.length === 0) {
    console.log(`${file}: no inline scripts found`);
    continue;
  }

  scripts.forEach((match, index) => {
    const script = match[1];
    try {
      new vm.Script(script, { filename: `${file}#script${index + 1}` });
      console.log(`${file}: script ${index + 1} OK`);
    } catch (error) {
      failed = true;
      console.error(`${file}: script ${index + 1} failed`);
      console.error(error.message);
    }

    for (const id of checkoutDomIdsUsed(script)) {
      if (!hasIdTarget(html, id)) {
        failed = true;
        console.error(`${file}: missing DOM target id="${id}" used by script ${index + 1}`);
      }
    }
  });
}

process.exit(failed ? 1 : 0);
