const KEY='db-seo-center-v1'; const BASE='https://nimbus.digitalboost.shop';
export const DEFAULT_ROBOTS='User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /account\nSitemap: https://nimbus.digitalboost.shop/sitemap.xml\n';
const SEED=[{id:1,name:'Campera Nimbus Navy',sku:'DB-JK-01',price:190},{id:2,name:'Tote Cyan Pulse',sku:'DB-TG-04',price:60},{id:3,name:'Hoodie Violet Grid',sku:'DB-HD-12',price:129},{id:4,name:'Cap Digital Blue',sku:'DB-CP-08',price:95}];
export function loadSeo(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p)return p;}catch{}return {overrides:{},robots:DEFAULT_ROBOTS,redirects:[],ignored:[],resolved:[],lastScan:0,log:[],titleTpl:'{name} — envío 48h | Nimbus',descTpl:'{name} en Nimbus. Stock real.',canonicalBase:BASE,breadcrumbs:true};}
export function saveSeo(s:any){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
function hero(){try{const b=JSON.parse(localStorage.getItem('db-store-canvas-v1')||'[]');const h=(b||[]).find((x:any)=>x&&x.type==='hero')||(b||[])[0]||{};let t=h.title||'';if(String(t).length<12) t='Nimbus Store';return {title:t,body:h.body||'Nimbus Store. Colección viva, envío 48h.'};}catch{return {title:'Nimbus Store',body:'Nimbus Store. Colección viva.'};}}
export function buildPages(s:any){
  const h=hero();
  const home={id:'home',url:'/',type:'Homepage',title:'Nimbus Store',description:h.body,canonical:BASE+'/',indexable:true,h1:h.title,sku:'',price:0};
  const prods=SEED.map(function(p){const slug=p.sku.toLowerCase();return {id:'p-'+p.id,url:'/products/'+slug,type:'Product',title:String(s.titleTpl||'{name} | Nimbus').replace('{name}',p.name),description:String(s.descTpl||'{name}').replace('{name}',p.name),canonical:(s.canonicalBase||BASE)+'/products/'+slug,indexable:true,h1:p.name,sku:p.sku,price:p.price};});
  const col={id:'col',url:'/collections/destacados',type:'Collection',title:'Destacados | Nimbus',description:'Colección Destacados Nimbus.',canonical:BASE+'/collections/destacados',indexable:true,h1:'Destacados',sku:'',price:0};
  const util=['cart','checkout','account'].map(function(u){return {id:u,url:'/'+u,type:'Utility',title:u,description:'',canonical:BASE+'/'+u,indexable:false,h1:u,sku:'',price:0};});
  return [home].concat(prods,[col],util).map(function(p){return Object.assign({},p,(s.overrides||{})[p.id]||{});});
}
export function scanIssues(pages:any[],s:any){
  const out:any[]=[]; const skip=(id:string)=>(s.ignored||[]).indexOf(id)!==-1||(s.resolved||[]).indexOf(id)!==-1; const add=(i:any)=>{if(!skip(i.id))out.push(i);};
  pages.forEach(function(p){
    if(p.type!=='Utility'&&p.indexable&&String(p.title||'').length<10)add({id:'title:'+p.id,title:'Title corto',description:p.title,severity:'critical',url:p.url,why:'Title corto.',fix:'title',fixKind:'title',pageId:p.id,cat:'onpage'});
    if(p.type!=='Utility'&&p.indexable&&String(p.description||'').length<30)add({id:'desc:'+p.id,title:'Meta delgada',description:String((p.description||'').length),severity:'high',url:p.url,why:'Desc corta',fix:'desc',fixKind:'desc',pageId:p.id,cat:'onpage'});
    if(p.type==='Product'&&!(s.overrides&&s.overrides[p.id]&&s.overrides[p.id].alt))add({id:'alt:'+p.id,title:'Imagen sin alt',description:p.h1,severity:'medium',url:p.url,why:'Sin alt',fix:'alt',fixKind:'alt',pageId:p.id,cat:'images'});
  });
  pages.forEach(function(p){ if(p.type!=='Utility'&&p.indexable){ if(titlePx(p.title)>580)add({id:'px:'+p.id,title:'Title recortable en SERP',description:p.url+' '+titlePx(p.title)+'px',severity:'low',url:p.url,why:'Pasa 580px',fix:'title',fixKind:'title',pageId:p.id,cat:'onpage'}); }});
  return out;
}
const W:any={technical:18,onpage:18,index:14,content:14,links:10,images:8,schema:10,performance:8}; const PEN:any={critical:22,high:12,medium:6,low:2};
export function scoreCats(issues:any[]){ return Object.keys(W).map(function(id){ const mine=issues.filter(function(i){return (i.cat||'onpage')===id;}); let s=100; mine.forEach(function(i){s-=PEN[i.severity]||4;}); if(s<0)s=0; return {id,score:s,n:mine.length,passed:mine.length===0}; }); }
export function healthOf(issues:any[]){ let h=0; scoreCats(issues).forEach(function(c){h+=c.score*(W[c.id]/100);}); return Math.round(h); }
export function explainScore(issues:any[]){ return 'Health '+healthOf(issues)+'/100. '+issues.length+' pendientes.'; }
export function pulseTitle(p:any){return (p.h1||'Nimbus').slice(0,48)+' | Nimbus';}
export function pulseDesc(p:any){return (p.h1||'Nimbus').slice(0,120)+' en Nimbus. Stock real, envío 48h.';}
export function pulseAlt(p:any){return (p.h1||'Prod')+' Nimbus';}
export function titlePx(s:string){return Math.round(String(s||'').length*9.2);}
export function slugOk(s:string){return '';}
export const TABS=['overview','audit','pages'];
