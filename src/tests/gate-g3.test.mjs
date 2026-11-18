import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = path.resolve(".");

test("Gate G3: PWA Manifest — Valid structure and configuration", () => {
  const manifestPath = path.join(ROOT_DIR, "public", "manifest.json");
  assert.ok(fs.existsSync(manifestPath), "public/manifest.json must exist");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  assert.ok(manifest.name, "Manifest must have a name");
  assert.ok(manifest.short_name, "Manifest must have a short_name");
  assert.strictEqual(manifest.display, "standalone", "Manifest display mode must be standalone");
  assert.strictEqual(manifest.start_url, "/", "Manifest start_url must be '/'");
  assert.ok(manifest.background_color, "Manifest must define background_color");
  assert.ok(manifest.theme_color, "Manifest must define theme_color");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Manifest must have at least one icon");
  assert.ok(manifest.icons[0].src, "Icon must have a src path");
});

test("Gate G3: Service Worker — Caching and offline support", () => {
  const swPath = path.join(ROOT_DIR, "public", "sw.js");
  assert.ok(fs.existsSync(swPath), "public/sw.js must exist");

  const swContent = fs.readFileSync(swPath, "utf-8");
  assert.ok(swContent.includes("CACHE_NAME"), "Service worker must define cache name");
  assert.ok(swContent.includes("addEventListener(\"install\""), "Service worker must have install listener");
  assert.ok(swContent.includes("addEventListener(\"activate\""), "Service worker must have activate listener");
  assert.ok(swContent.includes("addEventListener(\"fetch\""), "Service worker must have fetch listener");
  assert.ok(swContent.includes("caches.open"), "Service worker must use Cache API");
});

test("Gate G3: Data Provenance Badge Component (Rule T4) — Component exports and coverage", () => {
  const badgePath = path.join(ROOT_DIR, "src", "components", "common", "DataProvenanceBadge.tsx");
  assert.ok(fs.existsSync(badgePath), "DataProvenanceBadge.tsx must exist");

  const content = fs.readFileSync(badgePath, "utf-8");
  assert.ok(content.includes("export function DataProvenanceBadge"), "Must export DataProvenanceBadge");
  assert.ok(content.includes("live_verified"), "Must support live_verified data class");
  assert.ok(content.includes("delayed"), "Must support delayed data class");
  assert.ok(content.includes("historical_import"), "Must support historical_import data class");
  assert.ok(content.includes("manual_entry"), "Must support manual_entry data class");
  assert.ok(content.includes("demonstration"), "Must support demonstration data class");
  assert.ok(content.includes("sampleSize"), "Must support sampleSize (N) display");
  assert.ok(content.includes("limitations"), "Must support limitations warning");
});

test("Gate G3: Overview Dashboard embeds Data Provenance Badges (Rule T4)", () => {
  const pagePath = path.join(ROOT_DIR, "src", "app", "page.tsx");
  assert.ok(fs.existsSync(pagePath), "src/app/page.tsx must exist");

  const pageContent = fs.readFileSync(pagePath, "utf-8");
  assert.ok(
    pageContent.includes("DataProvenanceBadge"),
    "src/app/page.tsx must import and render DataProvenanceBadge"
  );
  assert.ok(
    pageContent.includes("sampleSize="),
    "src/app/page.tsx must supply sampleSize to provenance badges"
  );
  assert.ok(
    pageContent.includes("methodology="),
    "src/app/page.tsx must supply methodology to provenance badges"
  );
});

test("Gate G3: Zero Claims of Unverified Live Feeds or 99% Predictive Accuracy (Truth Rules T1, T2)", () => {
  const forbiddenPhrases = [
    "99% accuracy",
    "99% accurate",
    "guaranteed win",
    "guaranteed profit",
    "unbeatable signal",
    "never lose",
    "sure win",
    "hack spribe",
    "spribe predictor hack",
  ];

  const appDir = path.join(ROOT_DIR, "src", "app");
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const text = fs.readFileSync(fullPath, "utf-8").toLowerCase();
        for (const phrase of forbiddenPhrases) {
          assert.ok(
            !text.includes(phrase),
            `Forbidden marketing claim found in ${fullPath}: "${phrase}"`
          );
        }
      }
    }
  }

  scanDir(appDir);
});

test("Gate G3: Design System Tokens — Section 12 Token File Specification (Rule T15)", () => {
  const tokenPath = path.join(ROOT_DIR, "src", "styles", "tokens.css");
  assert.ok(fs.existsSync(tokenPath), "src/styles/tokens.css must exist");

  const css = fs.readFileSync(tokenPath, "utf-8");
  // Check required dark surface and ink tokens
  assert.ok(css.includes("--bg-base: #0A0C10"), "Must define --bg-base as #0A0C10");
  assert.ok(css.includes("--bg-surface-1: #10131A"), "Must define --bg-surface-1 as #10131A");
  assert.ok(css.includes("--bg-surface-2: #151A23"), "Must define --bg-surface-2 as #151A23");
  assert.ok(css.includes("--border-subtle: #232B3A"), "Must define --border-subtle as #232B3A");
  assert.ok(css.includes("--border-strong: #2E3849"), "Must define --border-strong as #2E3849");
  assert.ok(css.includes("--text-primary: #F2F4F8"), "Must define --text-primary as #F2F4F8");
  assert.ok(css.includes("--text-secondary: #9AA3B2"), "Must define --text-secondary as #9AA3B2");
  assert.ok(css.includes("--text-muted: #5F6B7C"), "Must define --text-muted as #5F6B7C");

  // Check accent tokens
  assert.ok(css.includes("--accent-500: #F43F5E"), "Must define --accent-500 as #F43F5E");
  assert.ok(css.includes("--accent-600: #E11D48"), "Must define --accent-600 as #E11D48");

  // Check tabular numerals rule
  assert.ok(css.includes("tabular-nums"), "Must declare tabular-nums for numeric statistical alignment");
});

test("Gate G3: Real-Results Mandate — Anti-Demo & Anti-Placeholder Scan (Rule T13, Section 9.1)", () => {
  const forbiddenPlaceholders = [
    "lorem ipsum",
    "via.placeholder",
    "placekitten",
    "mock-data",
  ];

  const appDir = path.join(ROOT_DIR, "src", "app");
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const text = fs.readFileSync(fullPath, "utf-8").toLowerCase();
        for (const placeholder of forbiddenPlaceholders) {
          assert.ok(
            !text.includes(placeholder),
            `Forbidden placeholder found in ${fullPath}: "${placeholder}" (Violates Rule T13)`
          );
        }
      }
    }
  }

  scanDir(appDir);
});
