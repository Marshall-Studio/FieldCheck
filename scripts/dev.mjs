import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('site');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function parseHeadersFile(text) {
  const rules = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!raw.startsWith(' ') && !raw.startsWith('\t')) {
      current = { pattern: raw.trim(), headers: {} };
      rules.push(current);
      continue;
    }
    if (!current) continue;
    const line = raw.trim();
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    current.headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return rules;
}

function headersForPath(pathname, rules) {
  const out = {};
  for (const rule of rules) {
    if (rule.pattern === '/*' || pathname === rule.pattern) Object.assign(out, rule.headers);
  }
  return out;
}

const headerRules = parseHeadersFile(await readFile(resolve('site', '_headers'), 'utf8').catch(() => '/*\n'));

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    const path = resolve(root, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '');
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const s = await stat(path);
    if (!s.isFile()) throw new Error('Not a file');
    const ext = extname(path);
    const headers = {
      'Content-Type': mime[ext] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      ...headersForPath(pathname.endsWith('/') ? '/' : pathname, headerRules)
    };
    res.writeHead(200, headers);
    res.end(await readFile(path));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(5173, '127.0.0.1', () => console.log('FieldCheck local preview: http://127.0.0.1:5173/'));
