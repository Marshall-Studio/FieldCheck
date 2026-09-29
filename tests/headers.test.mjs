import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

test('built site includes Cloudflare Pages _headers with CSP and framing defenses', () => {
  const headersPath = join(site, '_headers');
  assert.equal(existsSync(headersPath), true);
  const text = readFileSync(headersPath, 'utf8');
  assert.match(text, /Content-Security-Policy:/);
  assert.match(text, /default-src 'self'/);
  assert.match(text, /frame-ancestors 'none'/);
  assert.match(text, /X-Frame-Options: DENY/);
  assert.match(text, /X-Content-Type-Options: nosniff/);
  assert.match(text, /Referrer-Policy:/);
  // Limit third-party scripts to Cloudflare's Web Analytics beacon and permit its observed reporting origin.
  assert.match(text, /script-src 'self' https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js;/);
  assert.match(text, /connect-src 'self' https:\/\/cloudflareinsights\.com;/);
  assert.doesNotMatch(text, /connect-src[^\n]*\*/);
  assert.doesNotMatch(text, /'unsafe-inline'|'unsafe-eval'/);
});

test('built site includes theme boot script before CSS for flash avoidance', () => {
  const html = readFileSync(join(site, 'index.html'), 'utf8');
  assert.match(html, /theme-boot\.js/);
  assert.equal(existsSync(join(site, 'theme-boot.js')), true);
  const bootIndex = html.indexOf('theme-boot.js');
  const cssIndex = html.indexOf('styles.css');
  assert.ok(bootIndex > -1 && cssIndex > bootIndex);
});
