#!/usr/bin/env node
/**
 * generate-deck.js — deck spec (JSON) -> .pptx
 *
 * Usage:
 *   node generate-deck.js <deck.json> [out.pptx]
 *   node generate-deck.js <deck.json> --extract "Slide title" --into <other.json>
 *
 * Omitting the output path writes {deck-basename}.pptx next to the spec.
 * Image paths inside the spec resolve relative to the spec file's own directory.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const K = require('./deck-kit');
const ARCHETYPES = require('./archetypes');

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

/** Resolve every image path in a spec against the spec file's directory. */
function resolveImages(slide, baseDir) {
  if (slide.path) slide.path = path.resolve(baseDir, slide.path);
  (slide.ops || []).forEach((op) => {
    if (op.kind === 'image' && op.options && op.options.path) {
      op.options.path = path.resolve(baseDir, op.options.path);
    }
  });
}

function build(deck, baseDir) {
  const pptx = new PptxGenJS();
  K.applyDocProps(pptx, deck.meta || {});

  (deck.slides || []).forEach((spec, i) => {
    const draw = ARCHETYPES[spec.archetype];
    if (!draw) {
      die(`slide ${i + 1}: unknown archetype "${spec.archetype}". ` +
          `Known: ${Object.keys(ARCHETYPES).join(', ')}`);
    }
    resolveImages(spec, baseDir);

    const slide = pptx.addSlide();
    try {
      draw(pptx, slide, spec);
    } catch (err) {
      die(`slide ${i + 1} (${spec.archetype}): ${err.message}`);
    }

    if (spec.notes) slide.addNotes(spec.notes);
  });

  return pptx;
}

/**
 * Read the canvas size back out of the written file.
 *
 * Everything in this kit is positioned against a 13.333 x 7.5in slide. If the
 * emitted canvas is anything else the coordinates are all still "correct" and
 * the deck is still silently broken — content simply falls off the edge. The
 * spec-level QA cannot see this, so check the artifact itself.
 */
async function verifyCanvas(file) {
  let JSZip;
  try {
    JSZip = require('pptxgenjs/node_modules/jszip');
  } catch {
    try { JSZip = require('jszip'); } catch { return; } // no zip lib — skip
  }
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const xml = await zip.file('ppt/presentation.xml').async('string');
  const m = xml.match(/<p:sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
  if (!m) return;

  const [w, h] = [Number(m[1]) / 914400, Number(m[2]) / 914400];
  const want = [K.grid.W, K.grid.H];
  if (Math.abs(w - want[0]) > 0.01 || Math.abs(h - want[1]) > 0.01) {
    die(`${path.basename(file)} has a ${w} x ${h}in canvas, expected `
      + `${want[0]} x ${want[1]}in — every slide will be cropped`);
  }
}

/** --extract: lift a slide out of a prior deck spec by title, print it. */
function extract(deck, title) {
  const needle = title.toLowerCase();
  const hits = (deck.slides || []).filter((s) =>
    [s.title, s.headline].filter(Boolean).some((t) => t.toLowerCase().includes(needle))
  );
  if (!hits.length) {
    console.error(`No slide matching "${title}". Available:`);
    (deck.slides || []).forEach((s, i) =>
      console.error(`  ${i + 1}. [${s.archetype}] ${s.title || s.headline || '(untitled)'}`)
    );
    process.exit(1);
  }
  console.log(JSON.stringify(hits.length === 1 ? hits[0] : hits, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === '-h' || args[0] === '--help') {
    console.log('usage: generate-deck.js <deck.json> [out.pptx]');
    console.log('       generate-deck.js <deck.json> --list');
    console.log('       generate-deck.js <deck.json> --extract "Slide title"');
    process.exit(args.length ? 0 : 1);
  }

  const specPath = path.resolve(args[0]);
  if (!fs.existsSync(specPath)) die(`no such file: ${specPath}`);

  let deck;
  try {
    deck = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  } catch (err) {
    die(`${path.basename(specPath)} is not valid JSON — ${err.message}`);
  }

  if (args.includes('--list')) {
    (deck.slides || []).forEach((s, i) =>
      console.log(`${String(i + 1).padStart(2)}. [${s.archetype}] ${s.title || s.headline || '(untitled)'}`)
    );
    return;
  }

  const ei = args.indexOf('--extract');
  if (ei !== -1) {
    if (!args[ei + 1]) die('--extract needs a slide title');
    return extract(deck, args[ei + 1]);
  }

  const baseDir = path.dirname(specPath);
  const outPath = args[1] && !args[1].startsWith('--')
    ? path.resolve(args[1])
    : path.join(baseDir, `${path.basename(specPath).replace(/\.deck\.json$|\.json$/, '')}.pptx`);

  const pptx = build(deck, baseDir);
  await pptx.writeFile({ fileName: outPath });
  await verifyCanvas(outPath);

  console.log(`Wrote ${outPath} (${(deck.slides || []).length} slides)`);
}

if (require.main === module) {
  main().catch((err) => die(err.stack || err.message));
}

module.exports = { build };
