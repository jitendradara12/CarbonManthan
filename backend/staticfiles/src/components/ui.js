export const h = (html) => html.trim();
export const el = (id) => document.getElementById(id);
export function flash(msg, ok=false){
  const f = el('flash'); if(!f) return; f.className = `flash ${ok?'ok':'error'}`; f.textContent = msg; f.hidden=false; setTimeout(()=> f.hidden=true, 4000);
}

export const Skeleton = (count=1) => `<div class="skeleton">${'<div class="skeleton-text"></div>'.repeat(count)}</div>`;
export const Loader = () => `<div class="loader"></div>`;
