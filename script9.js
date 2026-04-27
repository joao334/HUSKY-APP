
const config = window.HUSKY_CONFIG || {};
const url = config.supabaseUrl || "";
const anon = config.supabaseAnonKey || "";
const supabaseClient = url && anon && window.supabase ? window.supabase.createClient(url, anon, {
  auth: {
    storageKey: "husky_cliente_auth_v1",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
}) : null;

function getOrderNsu(){
  const params = new URLSearchParams(location.search);
  return params.get("order_nsu") || params.get("orderNsu") || sessionStorage.getItem("husky_last_order_nsu") || "";
}

async function checkPayment(){
  const box = document.getElementById("status");
  const orderNsu = getOrderNsu();
  if(!supabaseClient){
    box.className = "msg err";
    box.textContent = "Supabase não configurado no config.js.";
    return;
  }
  if(!orderNsu){
    box.className = "msg err";
    box.textContent = "Não encontrei o número do pedido para consultar.";
    return;
  }
  box.className = "msg warn";
  box.textContent = "Consultando pedido " + orderNsu + "...";
  try{
    const { data, error } = await supabaseClient.functions.invoke(config.checkFunction || "check-infinitepay-payment", {
      body: { orderNsu }
    });
    if(error) throw error;
    if(data && data.paid){
      box.className = "msg ok";
      box.textContent = "Pagamento confirmado! Seu pedido já foi enviado para a gestão da Husky.";
      try{ localStorage.removeItem("husky_cart"); }catch(e){}
      setTimeout(()=>{ location.href = "./?tab=orders"; }, 1800);
    }else{
      box.className = "msg warn";
      box.textContent = "Pagamento ainda não confirmado pela InfinitePay. Aguarde alguns segundos e clique em verificar novamente.";
    }
  }catch(e){
    box.className = "msg err";
    box.textContent = "Não foi possível consultar agora: " + (e.message || e);
  }
}
checkPayment();
