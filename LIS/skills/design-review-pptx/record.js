/**
 * record.js — run a deck spec through the real archetypes, but capture the
 * drawing calls instead of writing a .pptx.
 *
 * Both qa-deck.js and preview-deck.js work off this, so what they check and
 * what they show is exactly what generate-deck.js emits — no second
 * implementation of the layout to drift out of sync.
 */

'use strict';

const ARCHETYPES = require('./archetypes');

/** Stand-in for pptxgenjs's ShapeType: any name maps to itself. */
const ShapeType = new Proxy({}, { get: (_, k) => String(k) });

class RecordingSlide {
  constructor(index) {
    this.index = index;
    this.ops = [];
    this.notes = null;
    this._bg = null;
  }

  set background(v) {
    this._bg = v && v.color ? v.color : null;
  }
  get background() {
    return this._bg;
  }

  addText(content, options = {}) {
    // content is either a string or an array of {text, options} runs
    const runs = Array.isArray(content)
      ? content.map((r) => ({ text: String(r.text ?? ''), ...(r.options || {}) }))
      : [{ text: String(content ?? '') }];
    this.ops.push({
      kind: options.shape ? 'shapeText' : 'text',
      shape: options.shape || null,
      runs,
      options,
    });
  }

  addShape(shape, options = {}) {
    this.ops.push({ kind: 'shape', shape, options, runs: [] });
  }

  addTable(rows, options = {}) {
    this.ops.push({ kind: 'table', rows, options, runs: [] });
  }

  addImage(options = {}) {
    this.ops.push({ kind: 'image', options, runs: [] });
  }

  addNotes(t) {
    this.notes = t;
  }
}

class RecordingPptx {
  constructor() {
    this.ShapeType = ShapeType;
    this.slides = [];
  }
  addSlide() {
    const s = new RecordingSlide(this.slides.length + 1);
    this.slides.push(s);
    return s;
  }
  // deck-kit's applyDocProps assigns these; just absorb them.
  set layout(v) { this._layout = v; }
  get layout() { return this._layout; }
}

/**
 * Render a deck spec into recorded slides.
 * Returns { slides, errors } — errors are archetype failures, not QA findings.
 */
function record(deck) {
  const pptx = new RecordingPptx();
  const errors = [];

  (deck.slides || []).forEach((spec, i) => {
    const draw = ARCHETYPES[spec.archetype];
    const slide = pptx.addSlide();
    slide.spec = spec;

    if (!draw) {
      errors.push(`slide ${i + 1}: unknown archetype "${spec.archetype}"`);
      return;
    }
    try {
      draw(pptx, slide, spec);
      if (spec.notes) slide.addNotes(spec.notes);
    } catch (err) {
      errors.push(`slide ${i + 1} (${spec.archetype}): ${err.message}`);
    }
  });

  return { slides: pptx.slides, errors };
}

module.exports = { record, RecordingPptx, RecordingSlide, ShapeType };
