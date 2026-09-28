import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const root = resolve('site');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.csv':'text/csv; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url??'/', 'http://localhost').pathname);
    const path=resolve(root, '.'+pathname, pathname.endsWith('/')?'index.html':'');
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    const s=await stat(path);if(!s.isFile())throw new Error('Not a file');
    const ext=path.slice(path.lastIndexOf('.'));
    res.writeHead(200,{'Content-Type':mime[ext]??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(await readFile(path));
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(5173,'127.0.0.1',()=>console.log('FieldCheck local preview: http://127.0.0.1:5173/'));
