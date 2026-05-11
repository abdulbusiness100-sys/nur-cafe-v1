#!/usr/bin/env node
/**
 * Nur Cafe — FAL 3D Asset Generation Script
 *
 * Pipeline: fal-ai/flux/dev → fal-ai/birefnet (bg removal) → fal-ai/clarity-upscaler
 *
 * Usage:
 *   FAL_KEY=your_key node generate-assets.js
 *   FAL_KEY=your_key node generate-assets.js --batch drinks
 *   FAL_KEY=your_key node generate-assets.js --batch categoryIcons
 *   FAL_KEY=your_key node generate-assets.js --batch tabIcons
 *   FAL_KEY=your_key node generate-assets.js --batch giftCards
 *   FAL_KEY=your_key node generate-assets.js --slug espresso
 *
 * Get your FAL API key at: https://fal.ai/dashboard
 * Install deps: npm install @fal-ai/client
 */

const { fal } = require('@fal-ai/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Config ───────────────────────────────────────────────────────────────────
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('❌  Set FAL_KEY env var: FAL_KEY=your_key node generate-assets.js');
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const ROOT = path.resolve(__dirname, '..');
const DRINKS_OUT    = path.join(ROOT, 'assets/images/drinks/3d');
const ICONS_OUT     = path.join(ROOT, 'assets/icons/3d');
const GIFTCARDS_OUT = path.join(ROOT, 'assets/images/giftcards');
const PROMPTS       = require('./asset-prompts.json');

// Create output dirs
[DRINKS_OUT, ICONS_OUT, GIFTCARDS_OUT].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function generateImage(prompt) {
  const result = await fal.run('fal-ai/flux/dev', {
    input: {
      prompt,
      image_size: 'square_hd',
      num_images: 1,
      output_format: 'png',
      guidance_scale: 3.5,
      num_inference_steps: 28,
    },
  });
  return result.images[0].url;
}

async function removeBackground(imageUrl) {
  const result = await fal.run('fal-ai/birefnet', {
    input: {
      image_url: imageUrl,
      model: 'General Use (Light)',
      operating_resolution: '1024x1024',
      output_format: 'png',
    },
  });
  return result.image.url;
}

async function upscaleImage(imageUrl) {
  const result = await fal.run('fal-ai/clarity-upscaler', {
    input: {
      image_url: imageUrl,
      scale_factor: 2,
      output_format: 'png',
    },
  });
  return result.image.url;
}

async function processAsset(slug, prompt, outputDir) {
  const dest = path.join(outputDir, `${slug}.png`);

  // Skip if already exists
  if (fs.existsSync(dest)) {
    console.log(`  ⏭  ${slug} — already exists, skipping`);
    return dest;
  }

  console.log(`  🎨 Generating: ${slug}`);
  try {
    const generated  = await generateImage(prompt);
    console.log(`     ✓ Generated`);

    const bgRemoved  = await removeBackground(generated);
    console.log(`     ✓ Background removed`);

    const upscaled   = await upscaleImage(bgRemoved);
    console.log(`     ✓ Upscaled`);

    await downloadFile(upscaled, dest);
    console.log(`     ✓ Saved → ${path.relative(ROOT, dest)}`);
    return dest;
  } catch (err) {
    console.error(`     ❌ Failed: ${err.message}`);
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const batchArg = args.indexOf('--batch');
  const slugArg  = args.indexOf('--slug');

  let batches = {
    drinks:        { items: PROMPTS.drinks,        dir: DRINKS_OUT },
    categoryIcons: { items: PROMPTS.categoryIcons, dir: ICONS_OUT },
    tabIcons:      { items: PROMPTS.tabIcons,       dir: ICONS_OUT },
    giftCards:     { items: PROMPTS.giftCards,      dir: GIFTCARDS_OUT },
  };

  // Single slug mode
  if (slugArg !== -1) {
    const slug = args[slugArg + 1];
    const allItems = Object.values(batches).flatMap(b => b.items);
    const found    = allItems.find(i => i.slug === slug);
    if (!found) { console.error(`❌  Slug not found: ${slug}`); process.exit(1); }
    const dir = batches.drinks.items.includes(found) ? DRINKS_OUT : ICONS_OUT;
    await processAsset(found.slug, found.prompt, dir);
    return;
  }

  // Batch mode or all
  const batchesToRun = batchArg !== -1
    ? { [args[batchArg + 1]]: batches[args[batchArg + 1]] }
    : batches;

  for (const [name, { items, dir }] of Object.entries(batchesToRun)) {
    console.log(`\n📦 Batch: ${name} (${items.length} assets)`);
    for (const item of items) {
      await processAsset(item.slug, item.prompt, dir);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n✅  Asset generation complete!');
  console.log('👉  Run: node update-asset-imports.js to update drinkImages.ts');
}

main().catch(console.error);
