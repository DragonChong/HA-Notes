'use strict';

/** Original kit names (keep these filenames stable). */
const ORIGINAL = [
  'arrow-right-arrow-left', 'barcode', 'bolt', 'chart-line', 'circle-check',
  'circle-xmark', 'clipboard-check', 'clock', 'cloud-arrow-up', 'code',
  'cubes', 'database', 'diagram-project', 'flask', 'gear', 'key',
  'layer-group', 'list-check', 'lock', 'magnifying-glass-chart',
  'network-wired', 'rocket', 'rotate-left', 'server', 'shield-halved',
  'table', 'triangle-exclamation', 'user', 'user-shield', 'vial',
];

/** Extra Font Awesome Free 7.3.1 solid names for IT / LIS decks. */
const EXTRA = [
  'arrows-rotate', 'bell', 'biohazard', 'book', 'bookmark', 'box',
  'box-archive', 'boxes-stacked', 'building', 'building-user', 'bullhorn',
  'calendar', 'calendar-days', 'chart-column', 'chart-pie', 'chart-simple',
  'circle-info', 'circle-question', 'clipboard', 'clipboard-list',
  'clipboard-question', 'clipboard-user', 'cloud', 'cloud-arrow-down',
  'code-branch', 'code-commit', 'code-merge', 'code-pull-request',
  'comment-dots', 'comments', 'copy', 'cube', 'desktop', 'display', 'dna',
  'download', 'earth-americas', 'envelope', 'ethernet', 'eye', 'eye-slash',
  'file', 'file-code', 'file-csv', 'file-export', 'file-import',
  'file-lines', 'file-medical', 'filter', 'fingerprint', 'flask-vial',
  'folder', 'folder-open', 'gauge', 'gears', 'globe', 'handshake',
  'hard-drive', 'headset', 'heart-pulse', 'hospital', 'hospital-user',
  'hourglass-half', 'house-medical', 'id-badge', 'id-card', 'inbox',
  'industry', 'kit-medical', 'laptop', 'laptop-code', 'lightbulb', 'link',
  'list', 'lock-open', 'magnifying-glass', 'memory', 'microchip',
  'microscope', 'minus', 'mobile-screen', 'notes-medical', 'object-group',
  'paper-plane', 'pen', 'pills', 'plug', 'plus', 'print', 'puzzle-piece',
  'qrcode', 'rotate-right', 'scale-balanced', 'screwdriver-wrench',
  'share-nodes', 'sitemap', 'sliders', 'stethoscope', 'stopwatch',
  'syringe', 'table-list', 'tablet-screen-button', 'tag', 'tags',
  'terminal', 'timeline', 'trash-can', 'truck', 'unlock', 'upload',
  'user-check', 'user-doctor', 'user-gear', 'user-lock', 'users',
  'users-gear', 'vials', 'warehouse', 'wifi', 'wrench',
];

/** Synonyms that decks already use or that agents often type. */
const ALIASES = {
  cogs: 'gears',
  computer: 'desktop',
  edit: 'pen',
  hdd: 'hard-drive',
  info: 'circle-info',
  megaphone: 'bullhorn',
  question: 'circle-question',
  refresh: 'arrows-rotate',
  search: 'magnifying-glass',
  settings: 'gear',
  sync: 'arrows-rotate',
  trash: 'trash-can',
};

module.exports = { ORIGINAL, EXTRA, ALIASES };
