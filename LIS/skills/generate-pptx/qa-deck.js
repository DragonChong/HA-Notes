#!/usr/bin/env node
'use strict';

// The deck kit has one home: design-review-pptx. This skill renders through it.
const cli = require('../design-review-pptx/qa-deck.js');

if (require.main === module) cli.run();

module.exports = cli;
