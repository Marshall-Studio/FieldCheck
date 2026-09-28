import { spawnSync } from 'node:child_process';
import { mkdir, rm, copyFile, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// fileURLToPath is required on Windows: URL.pathname yields "/C:/..." with %20 encoding.
const cwd = fileURLToPath(new URL('../', import.meta.url));
await rm(join(cwd,'site'),{recursive:true,force:true});
await mkdir(join(cwd,'site'),{recursive:true});
const compiler = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
const result = spawnSync(compiler,['--project','tsconfig.json'],{cwd,stdio:'inherit',shell:process.platform==='win32'});
if (result.status !== 0) process.exit(result.status || 1);
await copyFile(join(cwd,'index.html'),join(cwd,'site','index.html'));
await copyFile(join(cwd,'styles.css'),join(cwd,'site','styles.css'));
await cp(join(cwd,'sample-data'),join(cwd,'site','sample-data'),{recursive:true});
console.log('Built static website: site/');
