import test from 'node:test';
import assert from 'node:assert/strict';
import { viewportTopForElement, containerScrollForHighlight, headerOffsetPx } from '../site/assets/scroll.js';

test('results scroll target sits under sticky header offset', () => {
  assert.equal(headerOffsetPx(74, 12), 86);
  assert.equal(headerOffsetPx(89, 12), 101);
  assert.equal(viewportTopForElement(500, 74, 12), 414);
  assert.equal(viewportTopForElement(40, 74, 12), 0);
  // Tall page: heading at absolute Y 5400 should land just under header, not at footer.
  assert.equal(viewportTopForElement(5400, 89, 12), 5299);
});

test('modal highlight scroll stays inside the table container', () => {
  assert.equal(containerScrollForHighlight(120, 0, 300), 20);
  assert.equal(containerScrollForHighlight(10, 0, 300), 0);
  // Deep row inside a scrolled modal wrap: offset+scrollTop − clientHeight/3.
  assert.equal(containerScrollForHighlight(400, 80, 300), 380);
});
