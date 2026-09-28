import test from 'node:test';
import assert from 'node:assert/strict';
import { FEEDBACK_FORM_URL, isFeedbackFormConfigured } from '../site/assets/feedback.js';

test('feedback form URL stays empty until a published Tally link is provided', () => {
  assert.equal(FEEDBACK_FORM_URL, '');
  assert.equal(isFeedbackFormConfigured(''), false);
  assert.equal(isFeedbackFormConfigured('   '), false);
});

test('accepts only https feedback URLs', () => {
  assert.equal(isFeedbackFormConfigured('https://tally.so/r/example'), true);
  assert.equal(isFeedbackFormConfigured('http://tally.so/r/example'), false);
  assert.equal(isFeedbackFormConfigured('javascript:alert(1)'), false);
  assert.equal(isFeedbackFormConfigured('not a url'), false);
});
