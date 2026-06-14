#!/usr/bin/env node
import { readFileSync } from "node:fs";
import vm from "node:vm";

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("Usage: node scripts/check-html-js.mjs <file.html> [...]");
  process.exit(2);
}

const scriptPattern = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let failed = false;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const scripts = [...html.matchAll(scriptPattern)];

  if (scripts.length === 0) {
    console.log(`${file}: no inline scripts found`);
    continue;
  }

  scripts.forEach((match, index) => {
    try {
      new vm.Script(match[1], { filename: `${file}#script${index + 1}` });
      console.log(`${file}: script ${index + 1} OK`);
    } catch (error) {
      failed = true;
      console.error(`${file}: script ${index + 1} failed`);
      console.error(error.message);
    }
  });
}

process.exit(failed ? 1 : 0);
