#!/usr/bin/env node
/**
 * gen-icons.mjs — rasterise the Pitchora brand SVG into every
 * launcher / PWA / Play-Store icon size we ship.
 *
 * Reads:   src/app/icon.svg  (the single source of truth for the brand mark)
 * Writes:  public/icons/*.png
 *          public/apple-icon.png (180×180 for iOS home-screen)
 *          public/og-image.png   (1200×630 OpenGraph / Twitter card)
 *
 * Run:     npm run generate:icons
 *
 * Add new sizes here, not by hand-crafting PNGs. Every icon on disk
 * traces back to icon.svg so a brand refresh is one file edit + one
 * script run.
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC_SVG = path.join(ROOT, "src", "app", "icon.svg");
const OUT_DIR = path.join(ROOT, "public", "icons");

// Sizes we emit. Every entry lands as public/icons/icon-<size>.png
// (maskable variants get a `-maskable` suffix). Kept sorted small→large
// so the log output is easy to scan.
const SIZES = [48, 72, 96, 144, 192, 256, 384, 512];

// Padding percentage for the maskable variants. Android reserves the
// outer ~10 % as a safe cropping zone for adaptive-icon shapes.
const MASKABLE_PADDING = 0.10;

async function main() {
  const svg = await fs.readFile(SRC_SVG);
  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log(`Reading:  ${path.relative(ROOT, SRC_SVG)} (${svg.length} bytes)`);
  console.log(`Writing:  ${path.relative(ROOT, OUT_DIR)}/`);

  // Standard `any` icons
  for (const size of SIZES) {
    const out = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`  icon-${size}.png`);
  }

  // Maskable icons — same mark, padded so cropping shapes cannot
  // clip the aurora arc's terminal dot.
  for (const size of [192, 512]) {
    const pad = Math.round(size * MASKABLE_PADDING);
    const inner = size - pad * 2;
    const out = path.join(OUT_DIR, `icon-${size}-maskable.png`);
    const rendered = await sharp(svg, { density: 384 })
      .resize(inner, inner, { fit: "contain", background: { r: 10, g: 14, b: 42, alpha: 1 } })
      .png()
      .toBuffer();
    await sharp({
      create: {
        width: size, height: size, channels: 4,
        background: { r: 10, g: 14, b: 42, alpha: 1 },
      },
    })
      .composite([{ input: rendered, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`  icon-${size}-maskable.png`);
  }

  // iOS Safari home-screen. Apple wants 180×180 solid-background PNG,
  // no transparency, no maskable padding (they clip to their own shape).
  await sharp(svg, { density: 384 })
    .resize(180, 180, { fit: "cover" })
    .flatten({ background: { r: 10, g: 14, b: 42 } })
    .png()
    .toFile(path.join(ROOT, "public", "apple-icon.png"));
  console.log(`  apple-icon.png (iOS 180×180)`);

  // Favicon PNG fallback for browsers that don't render SVG favicons.
  await sharp(svg, { density: 192 })
    .resize(32, 32, { fit: "cover" })
    .png()
    .toFile(path.join(ROOT, "public", "favicon.png"));
  console.log(`  favicon.png (32×32)`);

  // OpenGraph / Twitter share card. Composite the mark onto the brand
  // gradient so social embeds match the deployed landing.
  const ogBg = await sharp({
    create: {
      width: 1200, height: 630, channels: 4,
      background: { r: 10, g: 14, b: 42, alpha: 1 },
    },
  })
    .composite([
      // Simulate an aurora glow left of centre
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
            <defs>
              <radialGradient id="g" cx="30%" cy="50%" r="60%">
                <stop offset="0%" stop-color="#8A6CF7" stop-opacity="0.55"/>
                <stop offset="60%" stop-color="#6366F1" stop-opacity="0.10"/>
                <stop offset="100%" stop-color="#0A0E2A" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="1200" height="630" fill="url(#g)"/>
            <text x="80" y="330" font-family="Inter, system-ui, sans-serif" font-size="88" font-weight="800" fill="#F2F4FF" letter-spacing="-2">Pitchora</text>
            <text x="80" y="390" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="500" fill="#C7CBF6">Boardroom-ready decks, in minutes.</text>
            <text x="80" y="430" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="500" fill="#95A0CB">AI · brand governance · evidence-controlled · Arabic RTL</text>
          </svg>`,
        ),
        top: 0, left: 0,
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
  const markInOg = await sharp(svg, { density: 384 })
    .resize(200, 200, { fit: "contain" })
    .png()
    .toBuffer();
  await sharp(ogBg)
    .composite([{ input: markInOg, top: 190, left: 940 }])
    .toFile(path.join(ROOT, "public", "og-image.png"));
  console.log(`  og-image.png (1200×630)`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
