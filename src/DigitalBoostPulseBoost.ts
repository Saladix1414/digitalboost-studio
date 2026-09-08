export function boostHero(q: string, current: string) {
  const s = (q || "").toLowerCase();
  if (/septiembre|sept|drop/.test(s)) {
    return { title: "Septiembre no pide permiso.", body: "El drop entra esta semana. Una prenda. Un boton. Sin discurso.", cta: "Ver el drop" };
  }
  if (/verano|calor/.test(s)) {
    return { title: "La tela que aguanta el dia.", body: "Poco peso. Mucha calle. El boton esta abajo.", cta: "Entrar" };
  }
  if (/permiso/.test(current || "")) {
    return { title: "La pieza que se explica sola.", body: "Una promesa. Un boton.", cta: "Entrar" };
  }
  return { title: "La coleccion que no pide permiso.", body: "Una promesa. Un boton.", cta: "Entrar" };
}
export function aiUsable(text: string) {
  const t = (text || "").trim();
  if (t.length < 40) return false;
  if (/como puedo ayudarte|cómo puedo ayudarte|what can i/i.test(t)) return false;
  if (/^\s*\d+\.\s*hola/im.test(t)) return false;
  if ((t.match(/hola/gi) || []).length >= 3) return false;
  return true;
}
