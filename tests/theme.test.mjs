import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTheme, toggleTheme, THEME_STORAGE_KEY } from '../site/assets/theme.js';

test('resolveTheme prefers an explicit stored choice over system preference', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});

test('resolveTheme falls back to system preference when unset', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme('nonsense', false), 'light');
});

test('toggleTheme switches between light and dark only', () => {
  assert.equal(toggleTheme('light'), 'dark');
  assert.equal(toggleTheme('dark'), 'light');
});

test('theme storage key does not resemble a CSV content namespace', () => {
  assert.equal(THEME_STORAGE_KEY, 'fieldcheck.theme.v1');
  assert.doesNotMatch(THEME_STORAGE_KEY, /csv|row|cell|dataset/i);
});
