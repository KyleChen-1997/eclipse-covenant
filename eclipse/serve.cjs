const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT || 4180);
const types = { '.wav':'audio/wav', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json', '.bin':'application/octet-stream', '.json':'application/json', '.txt':'text/plain; charset=utf-8' };
const server=http.createServer((req,res)=>{
  let url;
  try {url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
  const file=path.resolve(root,'.'+(url==='/'?'/index.html':url));
  if(!file.startsWith(root+path.sep)||url.split('/').some(x=>x.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()||!types[path.extname(file)]){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  });
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`端口 ${port} 已被占用。可以使用 PORT=4181 npm start。`:e.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log(`星蚀契约已启动：http://127.0.0.1:${port}`));
