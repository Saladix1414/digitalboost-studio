const KEY='db-seo-center-v1';
const BASE='https://nimbus.digitalboost.shop';
export const DEFAULT_ROBOTS='User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /account\nSitemap: https://nimbus.digitalboost.shop/sitemap.xml\n';
const SEED=[{id:1,name:'Campera Nimbus Navy',sku:'DB-JK-01',price:190},{id:2,name:'Tote Cyan Pulse',sku:'DB-TG-04',price:60},{id:3,name:'Hoodie Violet Grid',sku:'DB-HD-12',price:129},{id:4,name:'Cap Digital Blue',sku:'DB-CP-08',price:95}];
export function loadSeo(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p)return p;}catch{}return {overrides:{},robots:DEFAULT_ROBOTS,redirects:[],ignored:[],resolved:[],lastScan:0,log:[],titleTpl:'{name} | Nimbus',descTpl:'{name} en Nimbus. Envio 48h.',canonicalBase:BASE,breadcrumbs:true};}
export function saveSeo(s:any){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
function hero(){try{const b=JSON.parse(localStorage.getItem('db-store-canvas-v1')||'[]');const h=(b||[]).find((x:any)=>x&&x.type==='hero')||(b||[])[0]||{};return {title:h.title||'Nimbus',body:h.body||''};}catch{return {title:'Nimbus',body:''};}}
export function buildPages(s:any){
  const h=hero();
  const home={id:'home',url:'/',type:'Homepage',title:h.title,description:h.body,canonical:BASE+'/',indexable:true,h1:h.title,sku:'',price:0};
  const prods=SEED.map(function(p){const slug=p.sku.toLowerCase();return {id:'p-'+p.id,url:'/products/'+slug,type:'Product',title:String(s.titleTpl||'{name} | Nimbus').replace('{name}',p.name),description:String(s.descTpl||'{name}').replace('{name}',p.name),canonical:(s.canonicalBase||BASE)+'/products/'+slug,indexable:true,h1:p.name,sku:p.sku,price:p.price};});
  const col={id:'col',url:'/collections/destacados',type:'Collection',title:'Destacados | Nimbus',description:'',canonical:BASE+'/collections/destacados',indexable:true,h1:'Destacados',sku:'',price:0};
  const util=['cart','checkout','account'].map(function(u){return {id:u,url:'/'+u,type:'Utility',title:u,description:'',canonical:BASE+'/'+u,indexable:false,h1:u,sku:'',price:0};});
  return [home].concat(prods,[col],util).map(function(p){return Object.assign({},p,(s.overrides||{})[p.id]||{});});
}
export function scanIssues(pages:any[],s:any){
  const out:any[]=[];
  const skip=function(id:string){return (s.ignored||[]).indexOf(id)!==-1||(s.resolved||[]).indexOf(id)!==-1;};
  const add=function(i:any){if(!skip(i.id))out.push(i);};
  const titles:any={};
  pages.forEach(function(p){
    titles[p.title]=(titles[p.title]||[]).concat([p.url]);
    if(p.type!=='Utility'&&p.indexable&&String(p.title||'').length<12)add({id:'title:'+p.id,title:'Title corto',description:p.title||'—',severity:'critical',url:p.url,why:'El title es la senal on-page mas fuerte.',fix:'Aplicar plantilla.',fixKind:'title',pageId:p.id,cat:'onpage'});
    if(p.type!=='Utility'&&p.indexable&&String(p.description||'').length<50)add({id:'desc:'+p.id,title:'Meta description delgada',description:String((p.description||'').length)+' chars',severity:'high',url:p.url,why:'Sin description el snippet queda a criterio del motor.',fix:'Generar description.',fixKind:'desc',pageId:p.id,cat:'onpage'});
    if(p.type==='Collection'&&String(p.description||'').length<50)add({id:'thin:'+p.id,title:'Coleccion delgada',description:'Sin description de coleccion',severity:'medium',url:p.url,why:'La coleccion compite como landing.',fix:'Redactar description.',fixKind:'desc',pageId:p.id,cat:'content'});
    if(p.type==='Utility'&&p.indexable)add({id:'noindex:'+p.id,title:'Utilidad indexable',description:p.url,severity:'critical',url:p.url,why:'Cart/checkout/account no van al indice.',fix:'Marcar noindex.',fixKind:'noindex',pageId:p.id,cat:'index'});
    if(p.type==='Product'&&!(s.overrides&&s.overrides[p.id]&&s.overrides[p.id].alt))add({id:'alt:'+p.id,title:'Imagen sin alt',description:p.h1,severity:'medium',url:p.url,why:'Alt indexa imagen y accesibilidad.',fix:'Escribir alt.',fixKind:'alt',pageId:p.id,cat:'images'});
    if(p.type==='Product')add({id:'schema:'+p.id,title:'JSON-LD Product no emitido',description:p.sku,severity:'low',url:p.url,why:'Hay SKU y precio reales; falta markup publicado.',fix:'Ver JSON-LD.',fixKind:'schema',pageId:p.id,cat:'schema'});
  });
  Object.keys(titles).forEach(function(t){if(t&&titles[t].length>1)titles[t].forEach(function(u:string){const p=pages.find(function(x){return x.url===u;});if(!p||p.type==='Utility')return;add({id:'dup:'+p.id,title:'Possible duplicate title',description:t,severity:'high',url:u,why:'No afirmamos penalty. Canibaliza el recorte.',fix:'Diferenciar title.',fixKind:'title',pageId:p.id,cat:'onpage'});});});
  if(/Disallow:\s*\/\s*$/m.test(String(s.robots||'')))add({id:'robots',title:'robots bloquea todo',description:'Disallow: /',severity:'critical',url:'/robots.txt',why:'Saca el sitio del indice.',fix:'Reset robots.',fixKind:'none',pageId:'robots',cat:'technical'});
  (s.redirects||[]).forEach(function(r:any){if(r.from===r.to)add({id:'loop:'+r.id,title:'Redirect loop',description:r.from,severity:'critical',url:r.from,why:'Rompe el crawl.',fix:'Quitar.',fixKind:'none',pageId:r.id,cat:'technical'});});
  pages.forEach(function(p){ if(p.type!=='Utility'&&p.indexable){  if(p.h1&&p.title&&p.title.toLowerCase().indexOf(String(p.h1).split(' ')[0].toLowerCase())===-1)add({id:'h1:'+p.id,title:'H1 vs title',description:'El title no retoma el H1',severity:'medium',url:p.url,why:'Title y H1 desalineados diluyen el recorte.',fix:'Reescribir title con el H1.',fixKind:'title',pageId:p.id,cat:'onpage'});  const sl=slugOk(p.url); if(sl)add({id:'slug:'+p.id,title:'Slug: '+sl,description:p.url,severity:'low',url:p.url,why:'Slug sucio no es penalty; complica canonicos.',fix:'none',fixKind:'none',pageId:p.id,cat:'technical'});  if(titlePx(p.title)>600)add({id:'px:'+p.id,title:'Title recortable en SERP',description:titlePx(p.title)+'px est.',severity:'low',url:p.url,why:'Guia \~600px, no regla de Google.',fix:'Acortar title.',fixKind:'title',pageId:p.id,cat:'onpage'}); }});cannibal(s).forEach(function(c,i){add({id:'can:'+i,title:'Keyword cannibalization',description:c,severity:'high',url:'/',why:'Dos URLs para el mismo keyword local. No es dato de GSC.',fix:'Dejar una URL.',fixKind:'none',pageId:'home',cat:'onpage'});});return out;
}

const W: Record<string, number> = { technical: 18, onpage: 18, index: 14, content: 14, links: 10, images: 8, schema: 10, performance: 8 };
const PEN: Record<string, number> = { critical: 22, high: 12, medium: 6, low: 3 };
export function scoreCats(issues: any[]) {
  const ids = Object.keys(W);
  return ids.map(function (id) {
    const mine = issues.filter(function (i) { return (i.cat || 'onpage') === id; });
    let s = 100;
    mine.forEach(function (i) { s -= PEN[i.severity] || 4; });
    if (s < 0) s = 0;
    return { id: id, score: s, n: mine.length, passed: mine.length === 0 };
  });
}
export function healthOf(issues: any[]) {
  const cats = scoreCats(issues);
  let h = 0;
  cats.forEach(function (c) { h += c.score * ((W[c.id] || 0) / 100); });
  return Math.round(Math.max(0, Math.min(100, h)));
}
export function explainScore(issues: any[]) {
  const h = healthOf(issues);
  const band = h >= 80 ? 'sano' : h >= 60 ? 'justo' : 'rojo';
  const cats = scoreCats(issues).filter(function (c) { return !c.passed; }).sort(function (a, b) { return a.score - b.score; });
  const worst = cats[0];
  return 'Health ' + h + '/100 (' + band + '). ' + (worst ? 'El recorte esta en ' + worst.id + ' (' + worst.score + ').' : 'Categorias en verde.') + ' Pesos: technical 18 onpage 18 index 14 content 14 links 10 images 8 schema 10 performance 8. Performance queda 100 sin Lighthouse.';
}
export function pulseTitle(p:any){return p.type==='Product'?p.h1+' — envio 48h | Nimbus':(p.h1||'Nimbus')+' | Nimbus Store';}
export function pulseDesc(p:any){return p.type==='Product'?p.h1+' en Nimbus. Stock real, envio 48h, checkout seguro.':p.type==='Collection'?'Coleccion '+p.h1+': piezas Nimbus, envio 48h, historia de marca.':'Nimbus Store. Coleccion viva, envio 48h, checkout seguro.';}
export function pulseAlt(p:any){return (p.h1||'Producto')+' Nimbus';}
export function jsonLd(p:any){if(p.type==='Product')return {'@context':'https://schema.org','@type':'Product',name:p.h1,sku:p.sku,offers:{'@type':'Offer',priceCurrency:'USD',price:p.price}};return {'@context':'https://schema.org','@type':'WebSite',name:'Nimbus',url:BASE};}
export function sitemapXml(pages:any[]){const body=pages.filter(function(p){return p.indexable;}).map(function(p){return '  <url><loc>'+BASE+(p.url==='/'?'':p.url)+'</loc></url>';}).join('\n');return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+body+'\n</urlset>\n';}
export function wouldLoop(list:any[],from:string,to:string){if(from===to)return true;const map:any={};list.forEach(function(r){map[r.from]=r.to;});map[from]=to;const seen:any={};let cur=from;for(let i=0;i<10;i++){if(!map[cur])return false;if(seen[cur])return true;seen[cur]=1;cur=map[cur];}return true;}
export const TABS=['overview','audit','pages','products','collections','keywords','technical','structured','sitemaps','redirects','links','images','settings','reports','marketing'];

export function titlePx(s: string) { return Math.round(String(s || '').length * 10.2); }
export function descPx(s: string) { return Math.round(String(s || '').length * 6.5); }
export function slugOk(slug: string) {
  const s = String(slug || '').replace(/^\//, '');
  if (!s) return 'slug vacio';
  if (/[A-Z]/.test(s)) return 'mayusculas';
  if (/\s/.test(s)) return 'espacios';
  if (/[áéíóúñ]/.test(s)) return 'acentos';
  if (s.length > 60) return 'largo';
  return '';
}
export function utmOf(url: string, source: string, medium: string, campaign: string) {
  const base = url.indexOf('http') === 0 ? url : 'https://nimbus.digitalboost.shop' + (url[0] === '/' ? url : '/' + url);
  const q = 'utm_source=' + encodeURIComponent(source || 'pulse') + '&utm_medium=' + encodeURIComponent(medium || 'seo') + '&utm_campaign=' + encodeURIComponent(campaign || 'nimbus');
  return base + (base.indexOf('?') === -1 ? '?' : '&') + q;
}
export function reportMd(pages: any[], issues: any[], health: number) {
  const lines = ['# SEO report Nimbus', '', 'Health ' + health + '/100', 'Pages ' + pages.length, 'Issues ' + issues.length, ''];
  issues.forEach(function (i) { lines.push('- [' + i.severity + '] ' + i.url + ' — ' + i.title); });
  return lines.join('\n');
}
export function addKeyword(s: any, kw: string, url: string, intent: string) {
  const map = (s.keywords || []).slice();
  map.push({ kw: kw, url: url, intent: intent || 'informational' });
  s.keywords = map;
  return s;
}
export function cannibal(s: any) {
  const m: any = {};
  (s.keywords || []).forEach(function (k: any) { m[k.kw] = (m[k.kw] || []).concat([k.url]); });
  const out: string[] = [];
  Object.keys(m).forEach(function (k) { const u = Array.from(new Set(m[k])); if (u.length > 1) out.push(k + ' → ' + u.join(', ')); });
  return out;
}
