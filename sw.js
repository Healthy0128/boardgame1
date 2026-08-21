const CACHE='board-table-v19';
const CORE=['./','index.html','styles.css','extra-games.css','mancala-fix.css','howto.css','face-to-face.css','glass-visuals.css','direction-fix.css','sugoroku-effects.css','app.js','extra-games.js','rich-board.js','howto.js','face-to-face.js','glass-visuals.js','direction-fix.js','sugoroku-core-fix.js','sugoroku-effects.js','manifest.webmanifest','assets/board/wood.png','assets/board/go_black.png','assets/board/go_white.png','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/apple-touch-icon.png','assets/icons/favicon-32.png'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(file=>cache.add(file)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const cache=await caches.open(CACHE);
        cache.put(req,fresh.clone());
        return fresh;
      }catch{
        return (await caches.match(req)) || (await caches.match('./'));
      }
    })());
    return;
  }
  const url=new URL(req.url);
  const isCode=/\.(?:js|css|webmanifest)$/.test(url.pathname);
  if(isCode){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        cache.put(req,fresh.clone());
        return fresh;
      }catch{
        return (await cache.match(req)) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(req);
    if(cached)return cached;
    try{
      const fresh=await fetch(req);
      if(fresh.ok)cache.put(req,fresh.clone());
      return fresh;
    }catch{
      return Response.error();
    }
  })());
});