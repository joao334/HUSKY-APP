
    const DELIVERY_FEE = 6.99;
    const FREE_DELIVERY_FROM = 45;
    const MIN_ORDER = 18;
    const HUSKY_PIX_KEY = "4aff227c-332e-4c32-8034-f8605805ba76";

    // CONFIGURAÇÃO INTERNA DO APP DO CLIENTE
    // O cliente NÃO vê nem altera isso pelo aplicativo.
    // Para conectar ao Supabase, preencha aqui antes de publicar/enviar o app.
    const APP_CONFIG = window.HUSKY_CONFIG || { supabaseUrl: "https://wnhmcbozesilmokyemgh.supabase.co", supabaseAnonKey: "", paymentProvider: "infinitepay", infinitePayHandle: "huskybolos", checkoutFunction: "create-infinitepay-checkout", checkFunction: "check-infinitepay-payment", paymentReturnUrl: "https://husky-app.vercel.app/retorno-pagamento.html", whatsapp: "5511945198349" };

    const ASSETS = {
      logoTransparent: "assets/husky/HUSKY (2)(1).png",
      logoSquare: "assets/husky/HUSKY(1).png",
      logoScript: "assets/husky/ChatGPT Image 24 de abr. de 2026, 12_30_38(1).png",
      heroBanner: "assets/husky/Design sem nome(1).png",
      menuMascot: "assets/husky/IMG_7028.PNG",
      pedidosMascot: "assets/husky/IMG_7025.PNG",
      feedbackMascot: "assets/husky/IMG_7024.PNG",
      ifoodMascot: "assets/husky/IMG_7023.PNG",
      bastidoresMascot: "assets/husky/IMG_7026.PNG",
      curiosoMascot: "assets/husky/IMG_7027.PNG",
      abana: "assets/husky/IMG_6999.PNG",
      lambe: "assets/husky/IMG_7008.PNG",
      prestigio: "assets/husky/IMG_7009.PNG",
      mascotBag: "assets/husky/WhatsApp Sticker 2026-04-27 at 09.26 (2).png",
      mascotWave: "assets/husky/WhatsApp Sticker 2026-04-27 at 09.26 (3).png",
      mascotChef: "assets/husky/WhatsApp Sticker 2026-04-27 at 09.26 (4).png",
      mascotHeart: "assets/husky/WhatsApp Sticker 2026-04-27 at 09.26 (5).png",
      mascotThinking: "assets/husky/WhatsApp Sticker 2026-04-27 at 09.26.png",
      mascotThumbs: "assets/husky/WhatsApp Sticker 2026-04-27 at 09.26 (7).png",
      mascotDefault: "assets/husky/WhatsApp Sticker.png"
    };

    const fallbackProducts = [
      { id:"local-1", name:"Lambe Lambe Brigadeiro", slug:"lambe-lambe-brigadeiro", description:"Bolo de chocolate com brigadeiro cremoso.", details:"Bolo de chocolate molhadinho, recheio de brigadeiro cremoso e finalização artesanal.", image_url:ASSETS.lambe, price:18, size:"250 ml", weight:"250g a 260g", active:true, stock:20, tag:"Mais vendido", allergens:"Contém leite, glúten e derivados de soja.", filters:["chocolate","brigadeiro","doce"] },
      { id:"local-2", name:"Abana Rabo", slug:"abana-rabo", description:"Bolo de chocolate com maracujá.", details:"Chocolate com creme de maracujá equilibrado: doce, ácido e perfeito.", image_url:ASSETS.abana, price:18, size:"250 ml", weight:"250g a 260g", active:true, stock:20, tag:"Azedinho", allergens:"Contém leite, glúten e derivados de soja.", filters:["chocolate","maracujá","azedo"] },
      { id:"local-3", name:"Uivo de Prestígio", slug:"uivo-de-prestigio", description:"Chocolate com coco.", details:"Camadas de chocolate com creme de coco em uma combinação clássica.", image_url:ASSETS.prestigio, price:18, size:"250 ml", weight:"250g a 260g", active:true, stock:20, tag:"Clássico", allergens:"Contém leite, glúten, coco e derivados de soja.", filters:["chocolate","coco","prestígio"] },
      { id:"local-4", name:"Pata Crocante", slug:"pata-crocante", description:"Oreo com creme de ninho.", details:"Creme de ninho com Oreo crocante.", image_url:ASSETS.menuMascot, price:18, size:"250 ml", weight:"250g a 260g", active:false, stock:0, tag:"Esgotado", allergens:"Contém leite, glúten e derivados de soja.", filters:["oreo","ninho","crocante"] }
    ];

    const fallbackCoupons = [
      { code:"PRIMEIRACOLHER", title:"Primeira colher", description:"R$ 5 de desconto acima de R$ 30.", discount_type:"value", discount_value:5, min_subtotal:30, min_items:0, active:true },
      { code:"HUSKY10", title:"10% OFF", description:"10% de desconto acima de R$ 50.", discount_type:"percent", discount_value:10, min_subtotal:50, min_items:0, active:true },
      { code:"FRETEGRATIS", title:"Entrega grátis", description:"Entrega grátis acima de R$ 35.", discount_type:"free_delivery", discount_value:0, min_subtotal:35, min_items:0, active:true },
      { code:"COMBO4", title:"Combo 4 sabores", description:"R$ 8 de desconto levando 4 bolos ou mais.", discount_type:"value", discount_value:8, min_subtotal:72, min_items:4, active:true }
    ];

    const addOns = [
      { id:"spoon", name:"Colher descartável", price:0 },
      { id:"kraft", name:"Sacola kraft presenteável", price:2.5 },
      { id:"card", name:"Cartãozinho com mensagem", price:2 }
    ];

    const statusSteps = ["Pagamento aprovado","Pedido recebido pela Husky","Pedido aceito","Confeitando com carinho","Finalizando embalagem","Saiu para entrega ou está pronto para retirada","Entregue","Avalie seu pedido"];
    const nav = [
      ["home","Início","home"],["menu","Cardápio","search"],["chat","Chat","chat"],["orders","Pedidos","receipt"],["coupons","Cupons","ticket"],["profile","Perfil","user"]
    ];
    const quickChat = ["Quero saber o prazo do meu pedido","Quero falar sobre pagamento","Tenho dúvida sobre sabores","Preciso alterar meu endereço","Quero enviar um feedback"];

    const state = {
      supabase:null, session:null, user:null, configured:false, chatChannel:null, orderChannel:null,
      tab:"home", page:"app", products:[...fallbackProducts], coupons:[...fallbackCoupons],
      cart:normalizeCart(loadJson("husky_cart",{})), orders:[], chatMessages:[], productModal:null,
      couponCode:"", fulfillment:"delivery", paymentMethod:"InfinitePay", payment:null,
      address:"Praça das Artes - Embu das Artes", search:"", filter:"todos", loading:false,
      auth:{ mode:"register", step:"form", method:"password", name:"", email:"", phone:"", address:"Praça das Artes - Embu das Artes", password:"", code:"", message:"" },
      config:{ url:APP_CONFIG.supabaseUrl, anon:APP_CONFIG.supabaseAnonKey, checkoutFunction:APP_CONFIG.checkoutFunction || APP_CONFIG.pixFunction || "create-infinitepay-checkout", checkFunction:APP_CONFIG.checkFunction || "check-infinitepay-payment", infinitePayHandle:APP_CONFIG.infinitePayHandle || "huskybolos", paymentReturnUrl:APP_CONFIG.paymentReturnUrl || (location.origin + "/retorno-pagamento.html"), whatsapp:APP_CONFIG.whatsapp }
    };

    function $(id){return document.getElementById(id)}
    function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[m]))}
    function showFatalError(title,error){
      console.error(title,error);
      const root=document.getElementById('root');
      if(!root) return;
      root.innerHTML=`<div class="auth-wrap"><div class="auth-card"><div class="logo"><div class="logo-mark"><span>🐺</span></div><div class="logo-text"><strong>Husky</strong><small>Confeiteiro</small></div></div><h2 style="font-size:28px;margin:24px 0 8px;font-weight:1000">${escapeHtml(title||'Erro no app')}</h2><p class="muted">A tela foi protegida para não ficar branca. Veja o detalhe abaixo, limpe a sessão e tente novamente.</p><div class="message error">${escapeHtml(error?.message||error||'Erro desconhecido')}</div><button class="primary full mt" onclick="location.reload()">Recarregar</button><button class="outline full mt" onclick="localStorage.removeItem('husky_cliente_auth_v1');localStorage.removeItem('sb-${(state.config.url||'').split('//')[1]?.split('.')[0]||'project'}-auth-token');location.reload()">Limpar sessão do cliente</button></div></div>`;
    }
    window.addEventListener('error',e=>showFatalError('Erro no app do cliente',e.error||e.message));
    window.addEventListener('unhandledrejection',e=>showFatalError('Erro de conexão no cliente',e.reason||e));
    function money(v){return (Number.isFinite(Number(v))?Number(v):0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
    function loadJson(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){console.warn("JSON inválido em",k,e);return d}}
    function normalizeCart(raw){
      try{
        if(!raw || typeof raw!=="object" || Array.isArray(raw)) return {};
        const out={};
        Object.entries(raw).forEach(([key,entry])=>{
          if(entry && typeof entry==="object" && entry.productId && Number(entry.qty)>0){
            out[key]={...entry, qty:Number(entry.qty)||1, addOns:Array.isArray(entry.addOns)?entry.addOns:[], observation:entry.observation||"", cartKey:entry.cartKey||key};
          } else if(Number(entry)>0){
            out[`p-${key}`]={productId:key, qty:Number(entry), addOns:[], observation:"", cartKey:`p-${key}`};
          }
        });
        return out;
      }catch(e){console.warn("Carrinho corrompido. Limpando.",e);return {}}
    }
    function saveCart(){try{localStorage.setItem("husky_cart",JSON.stringify(normalizeCart(state.cart)))}catch(e){console.warn("Não foi possível salvar carrinho",e)}}
    function icon(name){
      const d={home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/><path d="M9 21v-7h6v7"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',receipt:'<path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21z"/><path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.8-4.2 14.2-4.2 16 0"/>',chat:'<path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.2-5A8 8 0 1 1 21 12Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>',ticket:'<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M15 9l-6 6"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',map:'<path d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z"/><circle cx="12" cy="9" r="2"/>',plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',minus:'<path d="M5 12h14"/>',check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',logout:'<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18h-7"/>',card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>',pix:'<path d="m12 3 5 5-5 5-5-5z"/><path d="m12 11 5 5-5 5-5-5z"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>',star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9z"/>',shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/>',sliders:'<path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 18h2"/><path d="M10 18h10"/><circle cx="8" cy="18" r="2"/>'};
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">${d[name]||d.home}</svg>`;
    }
    function img(src,alt,cls,fb="🐺"){return `<img src="${escapeHtml(src||"")}" alt="${escapeHtml(alt||"")}" class="${cls}" onerror="this.style.display='none';this.parentNode.insertAdjacentHTML('beforeend','<span>${fb}</span>')">`}
    function logo(compact=false){return `<div class="logo"><div class="logo-mark">${img(ASSETS.logoTransparent,'Husky Confeiteiro','', '🐺')}</div>${compact?'':`<div class="logo-text"><strong>Husky</strong><small>Confeiteiro</small></div>`}</div>`}
    function productImage(p,cls="product-img"){return `<div class="${cls}">${img(p.image_url,p.name,'',''+(p.emoji||'🐺'))}</div>`}

    function initSupabase(){
      if(!state.config.url || !state.config.anon || !window.supabase){ state.configured=false; return; }
      state.supabase = window.supabase.createClient(state.config.url, state.config.anon, {
        auth: {
          storageKey: "husky_cliente_auth_v1",
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });
      state.configured=true;
      state.supabase.auth.getSession().then(async ({data})=>{
        state.session=data.session;state.user=data.session?.user||null;
        await loadProfile(); await loadOrders(); await loadChat(); subscribeRealtime(); render();
      });
      state.supabase.auth.onAuthStateChange(async (_event,session)=>{
        state.session=session;state.user=session?.user||null;
        await loadProfile(); await loadOrders(); await loadChat(); subscribeRealtime(); render();
      });
    }
    async function loadProducts(){
      if(!state.supabase) return;
      try{
        const {data,error}=await state.supabase.from('products').select('*').eq('active',true).order('created_at',{ascending:false});
        if(error) throw error;
        if(data?.length) state.products=data.map(p=>({...p, price:Number(p.price||0), filters:[p.name,p.description,p.tag].filter(Boolean).join(' ').toLowerCase().split(/\s+/)}));
      }catch(e){console.warn('Produtos fallback:',e.message)}
    }
    async function loadCoupons(){
      if(!state.supabase) return;
      try{
        const {data,error}=await state.supabase.from('coupons').select('*').eq('active',true).order('created_at',{ascending:false});
        if(error) throw error;
        if(data?.length) state.coupons=data.map(c=>({...c, discount_value:Number(c.discount_value||0), min_subtotal:Number(c.min_subtotal||0), min_items:Number(c.min_items||0)}));
      }catch(e){console.warn('Cupons fallback:',e.message)}
    }
    async function loadProfile(){
      if(!state.supabase||!state.user) return;
      try{
        const {data,error}=await state.supabase.from('profiles').select('*').eq('id',state.user.id).maybeSingle();
        if(error) throw error;
        if(data){
          state.address=data.address||state.address;
          state.user.profile=data;
          state.auth.name=data.name||state.auth.name;
          state.auth.phone=data.phone||state.auth.phone;
          state.auth.address=data.address||state.auth.address;
        } else {
          await upsertProfile();
        }
      }catch(e){console.warn('Perfil:',e.message)}
    }
    async function loadOrders(){
      if(!state.supabase||!state.user) return;
      try{ const {data,error}=await state.supabase.from('customer_orders').select('*, order_items(*)').eq('user_id',state.user.id).order('created_at',{ascending:false}); if(error)throw error; state.orders=data||[]; }catch(e){console.warn('Pedidos:',e.message)}
    }
    async function loadChat(){
      if(!state.supabase||!state.user){ state.chatMessages=[]; return; }
      try{
        const {data,error}=await state.supabase.from('chat_messages').select('*').eq('user_id',state.user.id).order('created_at',{ascending:true});
        if(error) throw error;
        state.chatMessages=(data||[]).map(row=>({
          id:row.id,
          from:row.sender==='customer'?'user':'husky',
          text:row.message,
          time:new Date(row.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
          mascot: row.sender==='customer'?null:ASSETS.mascotDefault,
          raw:row
        }));
      }catch(e){console.warn('Chat:',e.message)}
    }
    function subscribeRealtime(){
      if(!state.supabase||!state.user) return;
      if(state.chatChannel){ state.supabase.removeChannel(state.chatChannel); state.chatChannel=null; }
      if(state.orderChannel){ state.supabase.removeChannel(state.orderChannel); state.orderChannel=null; }
      if(state.catalogChannel){ state.supabase.removeChannel(state.catalogChannel); state.catalogChannel=null; }
      state.chatChannel=state.supabase.channel('cliente-chat-'+state.user.id)
        .on('postgres_changes',{event:'*',schema:'public',table:'chat_messages',filter:`user_id=eq.${state.user.id}`},async()=>{await loadChat();render();})
        .subscribe();
      state.orderChannel=state.supabase.channel('cliente-orders-'+state.user.id)
        .on('postgres_changes',{event:'*',schema:'public',table:'customer_orders',filter:`user_id=eq.${state.user.id}`},async()=>{await loadOrders();render();})
        .subscribe();
      state.catalogChannel=state.supabase.channel('cliente-catalogo')
        .on('postgres_changes',{event:'*',schema:'public',table:'products'},async()=>{await loadProducts();render();})
        .on('postgres_changes',{event:'*',schema:'public',table:'coupons'},async()=>{await loadCoupons();render();})
        .on('postgres_changes',{event:'*',schema:'public',table:'store_settings'},async()=>{await loadProducts();await loadCoupons();render();})
        .subscribe();
    }

    function cartItems(){
      return Object.values(state.cart).map(entry=>{const p=state.products.find(x=>String(x.id)===String(entry.productId)); if(!p)return null; const chosen=addOns.filter(a=>(entry.addOns||[]).includes(a.id)); const addTotal=chosen.reduce((s,a)=>s+a.price,0); return {...p, qty:entry.qty, observation:entry.observation||'', addOns:chosen, unitTotal:Number(p.price)+addTotal, cartKey:entry.cartKey};}).filter(Boolean);
    }
    function couponResult(subtotal,totalItems){
      const code=state.couponCode.trim().toUpperCase(); if(!code)return {coupon:null,discount:0,freeDelivery:false,error:''};
      const c=state.coupons.find(x=>String(x.code).toUpperCase()===code); if(!c)return {coupon:null,discount:0,freeDelivery:false,error:'Cupom inválido.'};
      if(subtotal < Number(c.min_subtotal||0)) return {coupon:null,discount:0,freeDelivery:false,error:`Faltam ${money(Number(c.min_subtotal)-subtotal)} para usar esse cupom.`};
      if(Number(c.min_items||0) && totalItems < Number(c.min_items)) return {coupon:null,discount:0,freeDelivery:false,error:`Esse cupom precisa de ${c.min_items} itens.`};
      if(c.discount_type==='free_delivery') return {coupon:c,discount:0,freeDelivery:true,error:''};
      if(c.discount_type==='percent') return {coupon:c,discount:subtotal*(Number(c.discount_value)/100),freeDelivery:false,error:''};
      return {coupon:c,discount:Number(c.discount_value||0),freeDelivery:false,error:''};
    }
    function summary(){
      const items=cartItems(); const totalItems=items.reduce((s,i)=>s+i.qty,0); const subtotal=items.reduce((s,i)=>s+i.qty*i.unitTotal,0); const baseDelivery=state.fulfillment==='pickup'||subtotal>=FREE_DELIVERY_FROM||subtotal===0?0:DELIVERY_FEE; const cr=couponResult(subtotal,totalItems); const delivery=cr.freeDelivery?0:baseDelivery; const discount=Math.min(cr.discount,subtotal); const total=Math.max(0,subtotal+delivery-discount); return {items,totalItems,subtotal,delivery,discount,total,coupon:cr.coupon,couponError:cr.error};
    }
    function addQuick(product,delta){
      const key='p-'+product.id; const current=state.cart[key]?.qty||0; const next=Math.max(0,current+delta); if(next===0) delete state.cart[key]; else state.cart[key]={cartKey:key,productId:product.id,qty:next,addOns:[],observation:''}; saveCart(); render();
    }
    function addCustom(product,qty,addOnIds,obs){ const key='c-'+product.id+'-'+Date.now(); state.cart[key]={cartKey:key,productId:product.id,qty,addOns:addOnIds,observation:obs}; saveCart(); state.productModal=null; render(); }

    function render(){
      try{
        const root=$('root');
        if(!root) return;
        const s=summary();
        root.innerHTML=`<div class="app"><div class="shell">${sidebar()}<main class="main">${header()}<div class="content">${content()}</div>${bottomNav()}</main></div></div>${s.totalItems&&state.page==='app'?cartBar(s):''}${state.productModal?productModal(state.productModal):''}`;
      }catch(e){showFatalError('Erro ao renderizar o app do cliente',e)}
    }
    function sidebar(){return `<aside class="sidebar">${logo()}<div class="nav-profile"><small>Cliente</small><strong>${escapeHtml(displayName())}</strong><span>${escapeHtml(state.user?.email||'Catálogo livre')}</span></div><nav class="side-nav">${nav.map(([k,l,i])=>`<button class="nav-btn ${state.tab===k?'active':''}" onclick="setTab('${k}')">${icon(i)}<span>${l}</span></button>`).join('')}</nav>${state.user?`<button class="logout" onclick="logout()">${icon('logout')} Sair</button>`:`<button class="logout" onclick="setTab('profile')">${icon('user')} Entrar</button>`}</aside>`}
    function header(){return `<header class="header"><div class="top-row"><div class="logo" style="display:flex;min-width:0">${logo()}</div><button class="location" onclick="useGps()"><small>Entregar em</small><strong>${escapeHtml(state.address)}</strong></button><div class="top-actions"><button class="icon-btn" onclick="setTab('menu')">${icon('search')}</button><button class="icon-btn" onclick="setTab('chat')">${icon('chat')}</button>${state.user?`<button class="dark" onclick="logout()" style="padding:12px 16px;display:none">Sair</button>`:`<button class="dark" onclick="setTab('profile')" style="padding:12px 16px">Entrar</button>`}</div></div><button class="search-box" style="width:100%;margin-top:12px;text-align:left" onclick="useGps()">${icon('map')}<span style="font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(state.address)}</span></button></header>`}
    function bottomNav(){return `<nav class="bottom"><div class="bottom-grid">${nav.map(([k,l,i])=>`<button class="mobile-nav ${state.tab===k?'active':''}" onclick="setTab('${k}')">${icon(i)}<span>${l}</span></button>`).join('')}</div></nav>`}
    function setTab(t){state.page='app';state.tab=t;render()} window.setTab=setTab;
    function displayName(){return state.user?.profile?.name || state.user?.user_metadata?.name || state.user?.email?.split('@')[0] || 'Visitante'}

    function content(){
      if(state.page==='cart') return cartPage();
      if(state.page==='checkout') return checkoutPage();
      if(state.page==='payment') return paymentPage();
      if(state.tab==='home') return homePage();
      if(state.tab==='menu') return menuPage();
      if(state.tab==='chat') return chatPage();
      if(state.tab==='orders') return ordersPage();
      if(state.tab==='coupons') return couponsPage();
      if(state.tab==='profile') return profilePage();
      return homePage();
    }
    function homePage(){const active=state.products.filter(p=>p.active!==false);return `<section class="home-grid"><div class="hero"><div class="hero-inner"><div class="hero-row"><div><p style="font-weight:900;margin:0">Aberto sábado 19h às 23h • domingo 11h às 21h</p><h1>Husky Confeiteiro</h1><p>Bolos de pote artesanais feitos em Embu das Artes. Escolha, pague e acompanhe tudo pelo app.</p></div><div class="hero-img">${img(ASSETS.menuMascot,'Mascote Menu','','🐺')}</div></div><div class="chips"><span class="chip">⭐ 5.0</span><span class="chip">20-35 min</span><span class="chip">Pedido mínimo ${money(MIN_ORDER)}</span><span class="chip">Produção artesanal</span></div><button class="secondary mt" onclick="setTab('menu')">Ver cardápio</button></div></div><div class="card"><small class="muted" style="font-weight:1000">Como funciona</small><h2 style="font-size:28px;margin-top:8px">Pague antes da produção</h2><p class="muted">O pedido só aparece para a Husky depois que o pagamento for confirmado pelo gateway.</p><div class="note success">Entrega grátis acima de ${money(FREE_DELIVERY_FROM)}</div><div class="note">Pix real via Supabase Edge Function + webhook</div></div></section>${categories()}${couponBanner()}${productSection('Mais pedidos',active)}`}
    function categories(){const items=[[ASSETS.menuMascot,'Menu','menu'],[ASSETS.pedidosMascot,'Pedidos','orders'],[ASSETS.feedbackMascot,'Feedbacks','chat'],[ASSETS.ifoodMascot,'iFood','chat'],[ASSETS.bastidoresMascot,'Bastidores','menu'],[ASSETS.curiosoMascot,'Husky Curioso','menu'],[ASSETS.logoSquare,'Husky','profile'],[ASSETS.logoScript,'Marca','menu']];return `<section class="category-grid">${items.map(([im,l,t])=>`<button class="category" onclick="setTab('${t}')"><div class="category-img">${img(im,l,'','🐺')}</div><span>${l}</span></button>`).join('')}</section>`}
    function couponBanner(){return `<section class="coupon-banner"><div class="coupon-banner-inner"><div class="coupon-banner-text"><small>CUPOM DE PRIMEIRA COMPRA</small><h2>PRIMEIRACOLHER</h2><p>Use na sacola e ganhe desconto no primeiro pedido.</p><button class="secondary" onclick="state.couponCode='PRIMEIRACOLHER';setTab('menu')">Usar cupom</button></div><div class="coupon-banner-img">${img(ASSETS.heroBanner,'Banner Husky','','🐺')}</div></div></section>`}
    function productSection(title,products){return `<section><div class="section-title"><h2>${title}</h2><button class="link-btn" onclick="setTab('menu')">Ver todos</button></div><div class="product-grid">${products.map(productCard).join('')}</div></section>`}
    function productCard(p){const entry=Object.values(state.cart).find(e=>String(e.productId)===String(p.id)&&!(e.addOns||[]).length&&!e.observation);const qty=entry?.qty||0;return `<article class="product"><button class="product-img" onclick="openProduct('${p.id}')">${img(p.image_url,p.name,'','🐺')}</button><div class="product-body"><div style="display:flex;justify-content:space-between;gap:8px"><div><button class="product-title" onclick="openProduct('${p.id}')">${escapeHtml(p.name)}</button><p class="product-sub">${escapeHtml(p.size||'250 ml')} • ${escapeHtml(p.description||'')}</p></div><span class="tag">${escapeHtml(p.tag||'Husky')}</span></div><p class="product-desc">${escapeHtml(p.details||p.description||'')}</p><div class="price-row"><span class="price">${money(p.price)}</span>${p.active===false?'<span class="muted" style="font-weight:1000">Esgotado</span>':qtyControl(qty,`addQuickById('${p.id}',-1)`,`addQuickById('${p.id}',1)`)}</div></div></article>`}
    function qtyControl(q,onMinus,onPlus){return `<div class="qty">${q>0?`<button class="minus" onclick="${onMinus}">${icon('minus')}</button><strong>${q}</strong>`:''}<button class="plus" onclick="${onPlus}">${icon('plus')}</button></div>`}
    function addQuickById(id,delta){const p=state.products.find(x=>String(x.id)===String(id)); if(p)addQuick(p,delta)} window.addQuickById=addQuickById;
    function openProduct(id){state.productModal=state.products.find(p=>String(p.id)===String(id)); render()} window.openProduct=openProduct;

    function menuPage(){const q=state.search.toLowerCase();const list=state.products.filter(p=>{const blob=[p.name,p.description,p.details,p.tag,(p.filters||[]).join(' ')].join(' ').toLowerCase();const mq=!q||blob.includes(q);const mf=state.filter==='todos'||(state.filter==='disponível'&&p.active!==false)||blob.includes(state.filter);return mq&&mf;});return `<div><div style="display:flex;justify-content:space-between;gap:12px"><div><h1 style="font-size:34px;margin:0;font-weight:1000">Cardápio</h1><p class="muted">Busque por sabor, ingrediente ou categoria.</p></div><button class="icon-btn">${icon('sliders')}</button></div><div class="search-box"><span>${icon('search')}</span><input value="${escapeHtml(state.search)}" oninput="state.search=this.value;render()" placeholder="Buscar chocolate, coco, maracujá..."></div><div class="filter-row">${['todos','disponível','chocolate','azedo','doce','coco','ninho'].map(f=>`<button class="${state.filter===f?'active':''}" onclick="state.filter='${f}';render()">${f}</button>`).join('')}</div><div class="card"><h2>Bolos de pote</h2><p class="muted">250 ml • aproximadamente 250g a 260g</p><div class="product-grid mt">${list.map(productCard).join('')||'<p class="muted">Nenhum produto encontrado.</p>'}</div></div></div>`}

    function cartPage(){const s=summary();if(!s.totalItems)return empty('🛍️','Sua sacola está vazia','Adicione bolos pelo cardápio para continuar.');const missing=Math.max(0,FREE_DELIVERY_FROM-s.subtotal);return checkoutLayout('Sacola','Confira itens, cupom, entrega ou retirada.',()=>{state.page='app';render()},`<div class="checkout-grid"><div class="item-list">${missing>0&&state.fulfillment==='delivery'?`<div class="note">Faltam ${money(missing)} para entrega grátis.</div>`:''}${s.items.map(cartItem).join('')}<div class="card"><h2>Entrega ou retirada</h2><div class="choice-grid mt"><button class="choice ${state.fulfillment==='delivery'?'active':''}" onclick="state.fulfillment='delivery';render()"><strong>Entrega</strong><small>20 a 35 minutos</small></button><button class="choice ${state.fulfillment==='pickup'?'active':''}" onclick="state.fulfillment='pickup';render()"><strong>Retirada</strong><small>Retirar em Embu das Artes</small></button></div></div>${couponInput(s)}<div class="card"><h2>Complete seu pedido</h2><p class="muted">Monte um combo com 4 sabores ou adicione sacola kraft presenteável.</p></div></div>${summaryCard(s,'Continuar',()=>{state.page='checkout';render()},'O pedido ainda não foi enviado para a loja.')}</div>`)}
    function cartItem(item){return `<div class="product"><div class="product-img">${img(item.image_url,item.name,'','🐺')}</div><div class="product-body"><strong>${escapeHtml(item.name)}</strong><p class="product-sub">${money(item.unitTotal)} cada</p>${item.addOns.length?`<p class="product-sub">+ ${item.addOns.map(a=>escapeHtml(a.name)).join(', ')}</p>`:''}${item.observation?`<p class="product-sub">Obs: ${escapeHtml(item.observation)}</p>`:''}<div class="price-row"><span class="muted">Qtd. ${item.qty}</span><span class="price">${money(item.unitTotal*item.qty)}</span></div></div></div>`}
    function couponInput(s){return `<div class="card"><h2>Cupom</h2><div class="coupon-input mt"><input value="${escapeHtml(state.couponCode)}" oninput="state.couponCode=this.value.toUpperCase();render()" placeholder="HUSKY10"><button class="dark">Aplicar</button></div>${s.coupon?`<div class="note success">Cupom ${escapeHtml(s.coupon.code)} aplicado.</div>`:''}${s.couponError&&state.couponCode?`<div class="note warn">${escapeHtml(s.couponError)}</div>`:''}</div>`}
    function summaryCard(s,label,fn,note,disabled=false){window._summaryAction=fn;return `<aside class="card summary"><h2>Resumo de valores</h2><div class="line"><span>Subtotal</span><strong>${money(s.subtotal)}</strong></div><div class="line"><span>Entrega</span><strong>${s.delivery===0?'Grátis':money(s.delivery)}</strong></div><div class="line"><span>Desconto</span><strong>${money(s.discount)}</strong></div><div class="divider"></div><div class="total"><span>Total</span><strong>${money(s.total)}</strong></div>${note?`<div class="note">${note}</div>`:''}<button class="dark full" ${disabled?'disabled':''} onclick="_summaryAction()">${label}</button></aside>`}
    function checkoutLayout(title,sub,backFn,body){window._back=backFn;return `<button class="outline" onclick="_back()">← Voltar</button><h1 style="font-size:34px;margin:18px 0 0;font-weight:1000">${title}</h1><p class="muted">${sub}</p><div class="mt">${body}</div>`}
    function checkoutPage(){const s=summary();if(!s.totalItems)return empty('🛍️','Sua sacola está vazia','Adicione itens para continuar.');if(!state.user)return authRequired('Entre para finalizar','Você pode montar a sacola sem login, mas precisa validar o e-mail antes de pagar.');return checkoutLayout('Finalizar pedido','Revise entrega e forma de pagamento.',()=>{state.page='cart';render()},`<div class="checkout-grid"><div class="item-list"><div class="card"><h2>${state.fulfillment==='pickup'?'Retirada':'Endereço de entrega'}</h2><p class="muted">${state.fulfillment==='pickup'?'Retirar em Embu das Artes':escapeHtml(state.address)}</p><div class="note">${state.fulfillment==='pickup'?'Você será avisado quando estiver pronto':'Entrega estimada em 20 a 35 minutos'}</div></div><div class="card"><h2>Forma de pagamento</h2><p class="muted">Pagamento seguro pela InfinitePay. O cliente paga fora do app e volta automaticamente para a Husky.</p><div class="choice-grid mt"><button class="choice active" onclick="state.paymentMethod='InfinitePay';render()"><strong>InfinitePay</strong><small>Pix ou cartão no checkout seguro</small></button></div></div><div class="card"><h2>Cupom</h2><p class="muted">${s.coupon?escapeHtml(s.coupon.code):'Nenhum cupom aplicado'}</p></div></div>${summaryCard(s,'Ir para pagamento',()=>{state.page='payment';render()},'Na próxima etapa o pagamento será criado pelo gateway.')}</div>`)}
    function paymentPage(){const s=summary();if(!s.totalItems)return empty('🛍️','Sua sacola está vazia','Adicione itens para continuar.');if(!state.user)return authRequired('Entre para pagar','O pagamento só é liberado com login do cliente.');return checkoutLayout('Pagamento','Você será direcionado para o checkout seguro da InfinitePay e depois volta para o app.',()=>{state.page='checkout';render()},`<div class="checkout-grid"><div class="card"><div style="display:flex;justify-content:space-between;gap:12px"><div><small class="muted" style="font-weight:1000">InfinitePay</small><h2 style="font-size:28px;margin-top:4px">Pagar com Pix ou cartão</h2><p class="muted">Sem confirmação do webhook da InfinitePay, o pedido não nasce e não chega na gestão.</p></div><div class="icon-btn" style="width:64px;height:64px;color:var(--blue)">${icon('card')}</div></div>${infinitePayBox(s)}<button class="primary full mt" onclick="createPayment()">Ir para pagamento InfinitePay</button><button class="outline full mt" onclick="checkPayment()" ${state.payment?'':'disabled'}>Verificar pagamento</button><div id="payMsg" class="message">Ao clicar, você será redirecionado para pagar. O pedido só aparece na gestão depois da confirmação real.</div></div>${summaryCard(s,'Aguardando pagamento',()=>{},'Pedido bloqueado até o webhook da InfinitePay confirmar pagamento aprovado.',true)}</div>`)}
    function infinitePayBox(s){return `<div class="card soft mt" style="text-align:center"><div style="width:82px;height:82px;border-radius:24px;background:white;display:grid;place-items:center;margin:0 auto;color:var(--blue)">${icon('card')}</div><p class="muted" style="font-weight:1000">Checkout seguro InfinitePay</p><p style="background:white;border-radius:18px;padding:14px;font-weight:1000">InfiniteTag: $huskybolos</p><strong style="font-size:24px;color:var(--blue)">${money(s.total)}</strong><p class="muted">Pix ou cartão. Após o pagamento, você voltará para o app da Husky.</p></div>`}
    function pixBox(s){const pix=state.payment?.pixCopyPaste||state.payment?.copyPaste||HUSKY_PIX_KEY;return `<div class="card soft mt" style="text-align:center"><div style="width:82px;height:82px;border-radius:24px;background:white;display:grid;place-items:center;margin:0 auto;color:var(--blue)">${state.payment?.qrCode?`<img src="${state.payment.qrCode}" alt="QR Code Pix">`:icon('pix')}</div><p class="muted" style="font-weight:1000">Pix Husky Confeiteiro</p><p style="word-break:break-all;background:white;border-radius:18px;padding:14px;font-weight:1000">${escapeHtml(pix)}</p><strong style="font-size:24px;color:var(--blue)">${money(s.total)}</strong><button class="outline full mt" onclick="copyText('${escapeHtml(pix)}')">${icon('copy')} Copiar Pix</button></div>`}
    function cardBox(){return `<div class="card soft mt"><p class="muted">O cartão deve ser capturado em ambiente seguro do gateway. Não armazene dados de cartão no app.</p></div>`}

    async function createPayment(){const msg=$('payMsg');msg.textContent='Criando checkout InfinitePay...';if(!state.supabase){msg.textContent='Supabase ainda não está configurado. Edite o arquivo config.js com Project URL e anon public key.';return}try{const s=summary();const {data,error}=await state.supabase.functions.invoke(state.config.checkoutFunction,{body:{cart:state.cart,items:s.items,couponCode:state.couponCode,fulfillment:state.fulfillment,paymentMethod:'InfinitePay',total:s.total,subtotal:s.subtotal,deliveryFee:s.delivery,discount:s.discount,address:state.address,returnUrl:state.config.paymentReturnUrl,handle:state.config.infinitePayHandle}});if(error)throw error;if(!data?.url)throw new Error('A InfinitePay não retornou a URL do checkout.');state.payment=data;try{sessionStorage.setItem('husky_last_order_nsu',data.orderNsu||'');}catch(e){}msg.textContent='Checkout criado. Redirecionando...';window.location.href=data.url;}catch(e){msg.textContent='Erro ao criar checkout: '+(e.message||'função não configurada.')}} window.createPayment=createPayment;
    async function checkPayment(){const msg=$('payMsg');const orderNsu=state.payment?.orderNsu||sessionStorage.getItem('husky_last_order_nsu');if(!orderNsu){msg.textContent='Gere o pagamento primeiro.';return}msg.textContent='Consultando pagamento...';try{const {data,error}=await state.supabase.functions.invoke(state.config.checkFunction,{body:{orderNsu}});if(error)throw error;if(data.status==='paid'||data.paid===true){await loadOrders();state.cart={};saveCart();state.page='app';state.tab='orders';render()}else msg.textContent='Pagamento ainda não confirmado pela InfinitePay.'}catch(e){msg.textContent='Não foi possível consultar o pagamento. O pedido continua bloqueado.'}} window.checkPayment=checkPayment;

    function chatPage(){if(!state.user)return authRequired('Entre para usar o chat','O atendimento precisa do seu e-mail para localizar pedidos e histórico.');if(!state.chatMessages.length)state.chatMessages=[{from:'husky',text:'Oi! Eu sou o atendente virtual da Husky Confeiteiro. Como posso te ajudar hoje? 🐺💙',time:'agora',mascot:ASSETS.mascotWave}];return `<div class="chat-layout"><section class="chat-panel"><div class="chat-head"><div class="chat-avatar">${img(ASSETS.mascotDefault,'Atendente Husky','','🐺')}</div><div><h1 style="margin:0;font-size:26px;font-weight:1000">Chat Husky</h1><p style="margin:4px 0 0;color:var(--success);font-weight:900">Online para atendimento</p></div></div><div class="chat-box">${state.chatMessages.map(chatBubble).join('')}</div><div class="chat-input"><div class="quick-row">${quickChat.map(q=>`<button onclick="sendChat('${escapeHtml(q)}')">${q}</button>`).join('')}</div><div class="send-row"><input id="chatText" placeholder="Digite sua mensagem..." onkeydown="if(event.key==='Enter')sendChat()"><button class="primary" onclick="sendChat()">Enviar</button></div></div></section><aside><div class="whatsapp-card"><div class="mascot">${img(ASSETS.feedbackMascot,'Feedbacks Husky','','🐺')}</div><h2>Precisa de ajuda rápida?</h2><p>Fale pelo WhatsApp da loja quando precisar resolver algo urgente.</p><button class="secondary full" onclick="openWhatsApp()">Abrir WhatsApp</button></div><div class="card mt"><h3>Assuntos comuns</h3><p class="muted">• Status do pedido<br>• Pagamento Pix<br>• Troca de endereço<br>• Feedbacks e avaliações</p></div></aside></div>`}
    function chatBubble(m){const user=m.from==='user';return `<div class="bubble-row ${user?'user':''}">${!user?`<div class="chat-avatar" style="width:46px;height:46px">${img(m.mascot||ASSETS.mascotDefault,'Husky','','🐺')}</div>`:''}<div class="bubble ${user?'user':''}">${escapeHtml(m.text)}<small>${escapeHtml(m.time||'')}</small></div></div>`}
    async function sendChat(custom){
      const input=$('chatText');const text=(custom||input?.value||'').trim();if(!text)return;
      if(!state.user||!state.supabase){alert('Entre no app para enviar mensagem para a Husky.');return;}
      const now=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      state.chatMessages.push({from:'user',text,time:now}); if(input)input.value=''; render();
      try{
        const orderId=state.orders?.[0]?.id||null;
        const {error}=await state.supabase.from('chat_messages').insert({user_id:state.user.id,order_id:orderId,sender:'customer',message:text});
        if(error) throw error;
        await loadChat(); render();
      }catch(e){alert('Não foi possível enviar para a gestão: '+e.message); await loadChat(); render();}
    } window.sendChat=sendChat;
    function pickMascot(text){text=text.toLowerCase();if(text.includes('pix')||text.includes('pagamento'))return ASSETS.mascotThinking;if(text.includes('feedback')||text.includes('avalia'))return ASSETS.mascotHeart;if(text.includes('pedido')||text.includes('prazo'))return ASSETS.pedidosMascot;if(text.includes('sabor'))return ASSETS.mascotChef;if(text.includes('endereço')||text.includes('entrega'))return ASSETS.mascotBag;return ASSETS.mascotThumbs}
    function autoReply(text){const t=text.toLowerCase();if(t.includes('pedido')||t.includes('prazo'))return state.orders.length?`Encontrei seu último pedido ${state.orders[0].order_number||state.orders[0].id}. Acompanhe pela aba Pedidos.`:'Ainda não encontrei nenhum pedido pago no seu perfil. Depois que o pagamento for aprovado, ele aparece na aba Pedidos.';if(t.includes('pagamento')||t.includes('pix'))return 'O pedido só é enviado para a Husky após confirmação real do gateway. Se o Pix já foi pago, aguarde a confirmação automática.';if(t.includes('sabor'))return 'Hoje temos Lambe Lambe Brigadeiro, Abana Rabo e Uivo de Prestígio disponíveis.';if(t.includes('endereço')||t.includes('entrega'))return 'Você pode escolher entrega ou retirada na sacola antes de finalizar.';if(t.includes('feedback')||t.includes('avalia'))return 'Amei receber seu feedback! Conte como foi sua experiência.';return 'Entendi! Para atendimento urgente, toque em Abrir WhatsApp.'}
    function openWhatsApp(){window.open(`https://wa.me/${state.config.whatsapp}?text=${encodeURIComponent('Olá, Husky Confeiteiro! Vim pelo app e preciso de ajuda.')}`,'_blank','noopener,noreferrer')} window.openWhatsApp=openWhatsApp;

    function ordersPage(){if(!state.user)return authRequired('Entre para ver seus pedidos','Os pedidos pagos ficam vinculados ao seu e-mail.');if(!state.orders.length)return empty('🧾','Nenhum pedido pago ainda','Seu pedido só aparece aqui depois que o pagamento for aprovado.');return `<h1 style="font-size:34px;margin:0;font-weight:1000">Pedidos</h1><p class="muted">Somente pedidos com pagamento aprovado são enviados para a loja.</p><div class="product-grid mt">${state.orders.map(orderCard).join('')}</div>`}
    function orderCard(o){return `<div class="card"><div style="display:flex;justify-content:space-between;gap:12px"><div><small style="font-weight:1000;color:var(--blue)">Pedido ${escapeHtml(o.order_number||o.id)}</small><h2>Acompanhe seu pedido</h2><p class="muted">Total ${money(o.total)}</p></div><div class="icon-btn" style="width:60px;height:60px">🛍️</div></div><div class="note success">Pagamento aprovado • ${escapeHtml(o.payment_method||'Pix')}</div><div class="note">${(o.order_items||[]).map(i=>`${i.quantity}x ${escapeHtml(i.product_name)}`).join('<br>')||'Itens do pedido'}</div><div class="item-list mt">${statusSteps.map((st,i)=>`<div style="display:flex;gap:10px;align-items:center"><span class="icon-btn" style="width:34px;height:34px;background:${i<=0?'var(--blue)':'white'};color:${i<=0?'white':'#d1d5db'}">${icon('check')}</span><strong style="color:${i<=0?'var(--ink)':'#9ca3af'}">${st}</strong></div>`).join('')}</div></div>`}
    function couponsPage(){return `<h1 style="font-size:34px;margin:0;font-weight:1000">Cupons</h1><p class="muted">Escolha um cupom para usar na sacola.</p><div class="product-grid mt">${state.coupons.map(c=>`<button class="card" style="text-align:left;border:2px solid ${state.couponCode===c.code?'var(--blue)':'white'}" onclick="state.couponCode='${escapeHtml(c.code)}';setTab('menu')"><small style="font-weight:1000;color:var(--blue)">${escapeHtml(c.code)}</small><h2>${escapeHtml(c.title||c.code)}</h2><p class="muted">${escapeHtml(c.description||'Cupom Husky')}</p></button>`).join('')}</div>`}
    function profilePage(){
      if(!state.user)return authRequired('Entre no seu perfil','Cadastre e valide seu e-mail para salvar endereço, cupons e pedidos.');
      const p=state.user.profile||{};
      return `<div style="display:flex;gap:16px;align-items:center"><div class="icon-btn" style="width:80px;height:80px;font-size:38px;background:var(--cream)">😊</div><div><h1 style="font-size:34px;margin:0;font-weight:1000">${escapeHtml(displayName())}</h1><p class="muted" style="color:var(--blue)">Cliente Husky</p></div></div>
      <div class="card mt"><h2>Atualizar meus dados</h2><p class="muted">Esses dados são salvos no Supabase e aparecem para a gestão quando você manda mensagem ou faz pedido.</p>
        <div class="profile-grid mt">
          <label class="input-field"><span>Nome</span><div class="input-shell">${icon('user')}<input id="pfName" value="${escapeHtml(p.name||displayName())}"></div></label>
          <label class="input-field"><span>E-mail</span><div class="input-shell">${icon('mail')}<input value="${escapeHtml(state.user.email||'')}" disabled></div></label>
          <label class="input-field"><span>WhatsApp</span><div class="input-shell">${icon('chat')}<input id="pfPhone" value="${escapeHtml(p.phone||state.auth.phone||'')}"></div></label>
          <label class="input-field"><span>Aniversário</span><div class="input-shell">${icon('star')}<input id="pfBirthday" type="date" value="${escapeHtml(p.birthday||'')}"></div></label>
          <label class="input-field wide"><span>Endereço completo</span><div class="input-shell">${icon('map')}<input id="pfAddress" value="${escapeHtml(p.address||state.address||'')}"></div></label>
        </div>
        <button class="primary mt" onclick="saveProfile()">Salvar dados</button>
        <button class="outline mt" onclick="useGps()">Usar localização atual</button>
      </div>
      <div class="profile-grid mt">${['Cupons','Favoritos','Notificações','Segurança','Ajuda e suporte','Histórico de pedidos'].map(x=>`<button class="info" style="text-align:left"><strong>${x}</strong></button>`).join('')}</div><button class="outline mt" onclick="logout()">Sair da conta</button>`}
    async function saveProfile(){
      if(!state.supabase||!state.user){alert('Você precisa estar logado.');return;}
      const payload={id:state.user.id,email:state.user.email,name:$('pfName')?.value||displayName(),phone:$('pfPhone')?.value||'',address:$('pfAddress')?.value||'',birthday:$('pfBirthday')?.value||null};
      try{const {error}=await state.supabase.from('profiles').upsert(payload); if(error)throw error; state.address=payload.address||state.address; state.user.profile=payload; state.auth.address=payload.address; alert('Dados atualizados.'); render();}
      catch(e){alert('Erro ao salvar perfil: '+e.message)}
    } window.saveProfile=saveProfile;
    function authRequired(title,sub){return `<div class="auth-wrap"><div style="width:100%;max-width:520px"><div class="card" style="text-align:center;margin-bottom:14px"><div class="icon-btn" style="width:78px;height:78px;margin:0 auto;font-size:40px">🐺</div><h2 style="font-size:25px;margin-top:14px">${title}</h2><p class="muted">${sub}</p></div>${authPanel(true)}</div></div>`}
    function authPanel(compact=false){
      const a=state.auth;
      const usingCode=a.method==='otp';
      return `<section class="auth-card"><div>${logo()}<h2 style="font-size:30px;margin:28px 0 0;font-weight:1000">${a.step==='code'?'Verifique seu e-mail':(a.mode==='register'?'Criar conta':'Entrar na conta')}</h2><p class="muted">${a.step==='code'?`Digite o código enviado para ${escapeHtml(a.email)}.`:(usingCode?'Modo código por e-mail. Use depois que o SMTP/Resend estiver configurado.':'Modo teste sem domínio: entre com e-mail e senha.')}</p></div>${a.step==='form'?`<div>${a.mode==='register'?input('Nome','name','user'):''}${input('E-mail','email','mail')}${usingCode?'':input('Senha','password','lock','password')}${a.mode==='register'?input('WhatsApp','phone','chat')+input('Endereço','address','map'):''}</div>`:`<div>${input('Código de verificação','code','shield')}<div class="message">Login por código: depende do SMTP do Supabase/Resend. Para testes sem domínio, volte e use senha.</div></div>`}${a.message?`<div class="message ${a.message.includes('Erro')||a.message.includes('inválido')||a.message.includes('não')?'error':'ok'}">${escapeHtml(a.message)}</div>`:''}${a.step==='form'?`<button class="primary full mt" onclick="${usingCode?'sendCode()':'passwordAuth()'}">${usingCode?'Enviar código por e-mail':(a.mode==='register'?'Criar conta com senha':'Entrar com senha')}</button><button class="outline full mt" onclick="state.auth.mode=state.auth.mode==='register'?'login':'register';state.auth.message='';render()">${a.mode==='register'?'Já tenho conta':'Criar conta'}</button><button class="outline full mt" onclick="state.auth.method=state.auth.method==='password'?'otp':'password';state.auth.message='';render()">${usingCode?'Usar senha para teste':'Usar código por e-mail'}</button>`:`<button class="primary full mt" onclick="verifyCode()">Validar código</button><button class="outline full mt" onclick="state.auth.step='form';render()">Voltar</button>`}</section>`}
    function input(label,key,ic,type='text'){return `<label class="input-field"><span>${label}</span><div class="input-shell">${icon(ic)}<input type="${type}" value="${escapeHtml(state.auth[key]||'')}" oninput="state.auth.${key}=this.value" placeholder="${label}"></div></label>`}
    async function passwordAuth(){
      const a=state.auth;
      if(!a.email.includes('@')){a.message='Digite um e-mail válido.';render();return}
      if(!a.password || a.password.length<6){a.message='Digite uma senha com pelo menos 6 caracteres.';render();return}
      if(!state.supabase){a.message='Supabase ainda não está configurado. Edite o arquivo config.js com Project URL e anon public key.';render();return}
      a.message=a.mode==='register'?'Criando conta...':'Entrando...';render();
      try{
        let result;
        if(a.mode==='register'){
          result=await state.supabase.auth.signUp({email:a.email,password:a.password,options:{data:{name:a.name,phone:a.phone,address:a.address}}});
          if(result.error && /already|registered|exists/i.test(result.error.message||'')){
            result=await state.supabase.auth.signInWithPassword({email:a.email,password:a.password});
          }
        }else{
          result=await state.supabase.auth.signInWithPassword({email:a.email,password:a.password});
        }
        if(result.error) throw result.error;
        if(!result.data.session && a.mode==='register'){
          a.message='Conta criada, mas o Supabase ainda pediu confirmação por e-mail. Para teste sem domínio, desative Confirm email em Authentication > Providers > Email ou crie o usuário manualmente como confirmado.';
          render();return;
        }
        state.session=result.data.session;
        state.user=result.data.user;
        await upsertProfile(); await loadProfile(); await loadOrders(); await loadChat(); subscribeRealtime();
        state.address=state.user?.profile?.address||a.address||state.address;
        a.message='';state.tab='home';state.page='app';render();
      }catch(e){
        a.message='Erro no login por senha: '+e.message;
        render();
      }
    } window.passwordAuth=passwordAuth;
    async function sendCode(){
      const a=state.auth;if(!a.email.includes('@')){a.message='Digite um e-mail válido.';render();return}
      a.message='Enviando código...';render();
      if(!state.supabase){a.message='Supabase ainda não está configurado. Edite o arquivo config.js com Project URL e anon public key.';render();return}
      try{
        const {error}=await state.supabase.auth.signInWithOtp({email:a.email,options:{shouldCreateUser:true,emailRedirectTo:window.location.href.split('#')[0],data:{name:a.name,phone:a.phone,address:a.address}}});
        if(error)throw error;
        a.step='code';a.message='Código enviado para seu e-mail. Se chegar link em vez de código, ajuste o template Magic Link para usar {{ .Token }}.';render();
      }catch(e){a.message='Erro ao enviar código: '+e.message;render()}
    } window.sendCode=sendCode;
    async function verifyCode(){
      const a=state.auth;if(a.code.trim().length<4){a.message='Digite o código recebido.';render();return}
      a.message='Validando...';render();
      try{
        const {data,error}=await state.supabase.auth.verifyOtp({email:a.email,token:a.code,type:'email'});if(error)throw error;
        state.session=data.session;state.user=data.user;
        await upsertProfile(); await loadProfile(); await loadOrders(); await loadChat(); subscribeRealtime();
        state.address=state.user?.profile?.address||a.address||state.address;a.message='';state.tab='home';state.page='app';render();
      }catch(e){a.message='Código inválido ou expirado: '+e.message;render()}
    } window.verifyCode=verifyCode;
    async function upsertProfile(){
      if(!state.supabase||!state.user)return;
      const a=state.auth;
      const metadata=state.user.user_metadata||{};
      const payload={id:state.user.id,name:a.name||metadata.name||state.user.email?.split('@')[0],email:state.user.email,phone:a.phone||metadata.phone||'',address:a.address||metadata.address||state.address};
      try{await state.supabase.from('profiles').upsert(payload);state.user.profile=payload;}catch(e){console.warn(e.message)}
    }
    async function logout(){if(state.supabase) await state.supabase.auth.signOut();state.user=null;state.session=null;state.orders=[];render()} window.logout=logout;

    function productModal(p){let qty=1, selected=[], obs='';setTimeout(()=>{const q=$('modalQty'); if(q) q.textContent=qty},0);window.modalAddOn=(id)=>{selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];document.querySelectorAll('[data-addon]').forEach(b=>b.classList.toggle('active',selected.includes(b.dataset.addon)))};window.modalQty=(d)=>{qty=Math.max(1,qty+d);$('modalQty').textContent=qty;$('modalTotal').textContent=money(qty*(Number(p.price)+selected.map(id=>addOns.find(a=>a.id===id)?.price||0).reduce((s,v)=>s+v,0)))};window.modalAdd=()=>{obs=$('modalObs').value;addCustom(p,qty,selected,obs)};return `<div class="modal"><div class="modal-card"><div class="modal-img">${img(p.image_url,p.name,'','🐺')}</div><div class="modal-body"><div class="modal-title-row"><div><h2 style="font-size:30px;margin:0;font-weight:1000">${escapeHtml(p.name)}</h2><p class="muted">${escapeHtml(p.weight||'250g a 260g')} • ${escapeHtml(p.size||'250 ml')}</p></div><button class="close" onclick="state.productModal=null;render()">×</button></div><p class="muted">${escapeHtml(p.details||p.description||'')}</p><div class="note warn">${escapeHtml(p.allergens||'Consulte alergênicos com a loja.')}</div><h3>Adicionais</h3>${addOns.map(a=>`<button class="add-on" data-addon="${a.id}" onclick="modalAddOn('${a.id}');modalQty(0)"><span>${a.name}</span><strong>${a.price?money(a.price):'Grátis'}</strong></button>`).join('')}<label class="input-field"><span>Observação</span><textarea id="modalObs" placeholder="Ex: enviar colher, caprichar na embalagem..."></textarea></label><div class="price-row mt"><div class="qty"><button class="minus" onclick="modalQty(-1)">${icon('minus')}</button><strong id="modalQty">1</strong><button class="plus" onclick="modalQty(1)">${icon('plus')}</button></div><button class="primary" onclick="modalAdd()">Adicionar • <span id="modalTotal">${money(p.price)}</span></button></div></div></div></div>`}
    function empty(emoji,title,sub){return `<div style="display:grid;place-items:center;min-height:540px;text-align:center"><div><div class="icon-btn" style="width:136px;height:136px;margin:0 auto;font-size:62px;background:rgba(237,216,171,.45)">${emoji}</div><h1>${title}</h1><p class="muted">${sub}</p></div></div>`}
    function cartBar(s){return `<div class="cart-bar"><button onclick="state.page='cart';render()"><div class="cart-left">${logo(true)}<div><strong>Ver sacola • ${s.totalItems} item(ns)</strong><small>Confira antes de pagar</small></div></div><strong>${money(s.total)}</strong></button></div>`}
    async function copyText(text){try{await navigator.clipboard.writeText(text);alert('Copiado.')}catch{alert('Copie manualmente: '+text)}} window.copyText=copyText;
    function useGps(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(()=>{state.address='Localização atual detectada';render()},()=>{state.address='Permissão de localização negada';render()})} window.useGps=useGps;

    // Configuração removida da interface do cliente por segurança.
    // Edite APP_CONFIG no código antes de publicar.

    let __huskyRenderedOnce=false;
    const __oldRender=render;
    render=function(){__huskyRenderedOnce=true;return __oldRender.apply(this,arguments)};
    setTimeout(()=>{
      const root=document.getElementById('root');
      const txt=(root?.innerText||'').trim();
      if(root && !__huskyRenderedOnce && (!txt || txt==='Carregando Husky... Preparando o app do cliente.')){
        showFatalError('O app demorou para iniciar','Verifique sua conexão, limpe a sessão ou confira se config.js foi publicado junto com index.html.');
      }
    },3500);
    (async function boot(){
      try{
        state.cart=normalizeCart(state.cart);
        saveCart();
        initSupabase();
        await loadProducts();
        await loadCoupons();
        render();
      }catch(e){showFatalError('Erro ao iniciar o app do cliente',e)}
    })();
  