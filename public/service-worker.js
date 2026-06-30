const CACHE="tradepro-v3";
const PRECACHE=["/","/manifest.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(PRECACHE.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const {request}=e; const url=new URL(request.url);
  if(url.pathname.startsWith("/api/")){
    e.respondWith(fetch(request).catch(()=>new Response(JSON.stringify({status:"offline"}),{headers:{"Content-Type":"application/json"}})));
    return;
  }
  e.respondWith(fetch(request).then(res=>{if(res.ok&&request.method==="GET"){const c=res.clone();caches.open(CACHE).then(cc=>cc.put(request,c));}return res;}).catch(()=>caches.match(request).then(c=>c||new Response("Offline",{status:503}))));
});
