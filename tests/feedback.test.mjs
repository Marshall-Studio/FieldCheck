import test from 'node:test';
import assert from 'node:assert/strict';
import { FEEDBACK_FORM_URL, isFeedbackFormConfigured } from '../site/assets/feedback.js';

test('ships the published HTTPS Tally feedback URL', () => {
  assert.equal(FEEDBACK_FORM_URL, 'https://tally.so/r/68aLbP');
  assert.equal(isFeedbackFormConfigured(FEEDBACK_FORM_URL), true);
});

test('accepts only https feedback URLs', () => {
  assert.equal(isFeedbackFormConfigured(''), false);
  assert.equal(isFeedbackFormConfigured('https://tally.so/r/example'), true);
  assert.equal(isFeedbackFormConfigured('http://tally.so/r/example'), false);
  assert.equal(isFeedbackFormConfigured('javascript:alert(1)'), false);
  assert.equal(isFeedbackFormConfigured('not a url'), false);
});
