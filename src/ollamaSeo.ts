export async function askLlama3(prompt:string, fallback:string){
  try{
    const r = await fetch('http://127.0.0.1:11434/api/generate',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model: 'llama3', prompt, stream:false, options:{temperature:0.6} })
    });
    const j = await r.json();
    return (j.response||fallback).trim().slice(0,160);
  }catch{ return fallback; }
}
export const iaTitle = (h1:string)=> askLlama3(`Sos SEO senior de Nimbus Store. Generá solo un TITLE de 55 chars máx para producto "${h1}" con envío 48h | Nimbus Store. Sin comillas.`, `${h1} — envío 48h | Nimbus Store`);
export const iaDesc = (h1:string)=> askLlama3(`Sos SEO senior. Generá solo una META DESCRIPTION de 155 chars para "${h1}" tienda Nimbus, stock real, envío 48h, checkout seguro. Sin comillas.`, `${h1} en Nimbus. Stock real, envío 48h, checkout seguro.`);
export const iaAlt = (h1:string)=> askLlama3(`Generá solo ALT de imagen SEO, 12 palabras máx, para producto "${h1}" Nimbus. Sin comillas.`, `${h1} Nimbus — envío 48h`);
