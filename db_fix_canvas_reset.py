from pathlib import Path
html = """<!DOCTYPE html><html><body><script>
let c=0;
Object.keys(localStorage).forEach(k=>{
  if(k.startsWith('db-store-canvas')){
    let v=localStorage.getItem(k);
    if(v){
      let nv=v.replace(/Campera Aura/g,'Campera Nimbus Navy').replace(/Aura/g,'Nimbus');
      if(nv!==v){ localStorage.setItem(k,nv); c++; }
    }
  }
});
localStorage.setItem('db-active-store-v1','Nimbus');
document.body.innerHTML='<h2>Fixed '+c+' → <a href="/">Volver</a></h2>';
setTimeout(()=>location.href='/',1200);
</script></body></html>
"""
Path("public/reset-nimbus.html").write_text(html, encoding="utf-8")
print("✅ public/reset-nimbus.html creado")
