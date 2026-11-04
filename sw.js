/* AL-Maamoun Flights — Service Worker: تشغيل الموقع أوفلاين */
const V='fm-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const LIBS=[
 "https://cdn.jsdelivr.net/npm/ag-psd@30.1.1/dist/bundle.js",
 "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
];
const CDN=/^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.all(CORE.map(u=>c.add(u).catch(()=>{})));
    await Promise.all(LIBS.map(u=>fetch(u,{mode:'cors'}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==V)await caches.delete(k);
    await self.clients.claim();
  })());
});
async function netFirst(req){
  const c=await caches.open(V);
  const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r});
  net.catch(()=>{});
  try{return await Promise.race([net,new Promise((_,j)=>setTimeout(j,5000))])}
  catch(e){
    const m=await c.match(req,{ignoreSearch:true})||(req.mode==='navigate'&&(await c.match('./index.html')||await c.match('./')));
    if(m)return m;
    return net;
  }
}
async function cacheFirst(req){
  const c=await caches.open(V);
  const m=await c.match(req);
  if(m){fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r)}).catch(()=>{});return m}
  const r=await fetch(req);
  if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());
  return r;
}
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin===location.origin)e.respondWith(netFirst(req));
  else if(CDN.test(u.host))e.respondWith(cacheFirst(req));
  /* Supabase / Anthropic / غيرهم: مبنتدخلش — التطبيق بيتعامل مع الفشل بنفسه */
});
