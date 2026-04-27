function safeText(v){
  return String(v ?? "").replace(/[&<>\"']/g, function(m){
    return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"})[m] || m;
  });
}
function readStorage(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(raw === null || raw === undefined || raw === "undefined" || raw === "") return fallback;
    return JSON.parse(raw);
  }catch(error){
    console.warn("Storage inválido removido:", key, error);
    try{ localStorage.removeItem(key); }catch(e){}
    return fallback;
  }
}
function showGestaoFatal(title,error){
  console.error(title,error);
  const root = document.getElementById("root");
  if(!root) return;
  root.innerHTML = `<main class="login"><section class="login-box"><div class="logo"><div class="logo-mark"><span>🐺</span></div><div><h1>Husky Gestão</h1><p>Recuperação do sistema</p></div></div><h2>${safeText(title || "Erro na gestão")}</h2><p>A tela foi protegida para não ficar branca. Limpe as sessões antigas e tente novamente.</p><div class="toast" style="position:static;background:#fee2e2;color:#991b1b;margin:14px 0;box-shadow:none">${safeText(error && (error.message || error) || "Erro desconhecido")}</div><button class="btn blue" onclick="location.reload()">Recarregar</button><button class="btn outline" style="margin-top:10px;width:100%" onclick="['husky_admin_user','husky_gestao_auth_v1','husky_store_open','husky_sound_on'].forEach(k=>localStorage.removeItem(k));Object.keys(localStorage).filter(k=>k.startsWith('sb-')||k.startsWith('husky_')).forEach(k=>{if(k.includes('auth')||k.includes('admin'))localStorage.removeItem(k)});location.href='gestao.html'">Limpar sessão da gestão</button><button class="btn light" style="margin-top:10px;width:100%" onclick="location.href='limpar-sessoes.html'">Abrir limpeza completa</button></section></main>`;
}
window.addEventListener("error", function(e){ showGestaoFatal("Erro na gestão", e.error || e.message); });
window.addEventListener("unhandledrejection", function(e){ showGestaoFatal("Erro de conexão na gestão", e.reason || e); });
