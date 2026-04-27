


const BASE_CONFIG = window.HUSKY_CONFIG || {};
const APP_CONFIG = {
  supabaseUrl: BASE_CONFIG.supabaseUrl || "",
  supabaseAnonKey: BASE_CONFIG.supabaseAnonKey || "",
  storeName: BASE_CONFIG.storeName || "Husky Confeiteiro",
  workspaceId: BASE_CONFIG.workspaceId || "husky-principal",
  whatsappNumber: BASE_CONFIG.whatsapp || BASE_CONFIG.whatsappNumber || "5511999999999",
  pixKey: BASE_CONFIG.pixKey || "4aff227c-332e-4c32-8034-f8605805ba76",
  deliveryFee: 6.99,
  freeDeliveryFrom: 45,
  currency: "BRL",
};

const HAS_SUPABASE = !!(APP_CONFIG.supabaseUrl && APP_CONFIG.supabaseAnonKey && window.supabase);
const db = HAS_SUPABASE ? window.supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseAnonKey, {
  auth: {
    storageKey: "husky_gestao_auth_v1",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
}) : null;

const assets = {
  logo: "assets/husky/HUSKY (2)(1).png",
  banner: "assets/husky/Design sem nome(1).png",
  menu: "assets/husky/IMG_7028.PNG",
  pedidos: "assets/husky/IMG_7025.PNG",
  feedbacks: "assets/husky/IMG_7024.PNG",
  curious: "assets/husky/IMG_7027.PNG",
  lambe: "assets/husky/IMG_7008.PNG",
  abana: "assets/husky/IMG_6999.PNG",
  prestigio: "assets/husky/IMG_7009.PNG",
};

const state = {
  user: JSON.parse(localStorage.getItem("husky_admin_user") || "null"),
  route: "dashboard",
  subroute: "overview",
  selectedOrder: null, selectedChatUser:null, chatChannel:null, ordersChannel:null, productsChannel:null, refreshTimer:null,
  search: "",
  statusFilter: "all",
  periodFilter: "today",
  storeOpen: JSON.parse(localStorage.getItem("husky_store_open") || "true"),
  soundOn: JSON.parse(localStorage.getItem("husky_sound_on") || "true"),
  data: seedData(),
};

function seedData(){
  const today = new Date();
  const iso = today.toISOString();
  return {
    products: JSON.parse(localStorage.getItem("husky_products") || "null") || [
      {id:"p1",name:"Lambe Lambe Brigadeiro",slug:"lambe-lambe-brigadeiro",category:"Bolos de pote",price:18,promo_price:null,cost:6.2,stock:12,min_stock:4,active:true,available:true,visible_on_client:true,featured:true,image_url:assets.lambe,size:"250 ml",weight:"250g a 260g",prep_time:20,tag:"Mais vendido",description:"Bolo de chocolate com brigadeiro cremoso.",details:"Massa de chocolate, brigadeiro cremoso e montagem artesanal.",ingredients:"Chocolate, leite condensado, creme de leite, farinha, ovos.",allergens:"Contém leite, glúten e derivados de soja.",sku:"HUS-LAMBE"},
      {id:"p2",name:"Abana Rabo",slug:"abana-rabo",category:"Bolos de pote",price:18,promo_price:null,cost:6.1,stock:9,min_stock:4,active:true,available:true,visible_on_client:true,featured:true,image_url:assets.abana,size:"250 ml",weight:"250g a 260g",prep_time:20,tag:"Azedinho",description:"Chocolate com creme de maracujá.",details:"Doce e ácido na medida certa.",ingredients:"Chocolate, maracujá, leite condensado, creme de leite.",allergens:"Contém leite, glúten e derivados de soja.",sku:"HUS-ABANA"},
      {id:"p3",name:"Uivo de Prestígio",slug:"uivo-de-prestigio",category:"Bolos de pote",price:18,promo_price:null,cost:6.0,stock:7,min_stock:4,active:true,available:true,visible_on_client:true,featured:false,image_url:assets.prestigio,size:"250 ml",weight:"250g a 260g",prep_time:20,tag:"Clássico",description:"Chocolate com coco.",details:"Camadas de chocolate com creme de coco.",ingredients:"Chocolate, coco, leite condensado, creme de leite.",allergens:"Contém leite, glúten e coco.",sku:"HUS-PREST"},
      {id:"p4",name:"Pata Crocante",slug:"pata-crocante",category:"Bolos de pote",price:18,promo_price:null,cost:6.7,stock:0,min_stock:4,active:true,available:false,visible_on_client:true,featured:false,image_url:assets.menu,size:"250 ml",weight:"250g a 260g",prep_time:20,tag:"Esgotado",description:"Oreo com creme de ninho.",details:"Creme de ninho com Oreo crocante.",ingredients:"Leite ninho, Oreo, leite condensado, creme de leite.",allergens:"Contém leite, glúten e derivados de soja.",sku:"HUS-PATA"},
    ],
    orders: JSON.parse(localStorage.getItem("husky_orders") || "null") || [
      {id:"o1",order_number:"HUS-1024",created_at:iso,customer_name:"Yasmin",customer_email:"yasmin@email.com",customer_phone:"11999990000",status:"paid",payment_status:"approved",payment_method:"Pix",payment_gateway_id:"MP-99881",fulfillment:"delivery",subtotal:36,delivery_fee:6.99,discount:0,total:42.99,coupon_code:"",address:{street:"Rua das Flores",number:"120",neighborhood:"Centro",city:"Embu das Artes",reference:"Portão azul"},items:[{product_id:"p1",product_name:"Lambe Lambe Brigadeiro",quantity:1,unit_price:18,total:18,observation:"Com colher",addons:["Colher descartável"]},{product_id:"p2",product_name:"Abana Rabo",quantity:1,unit_price:18,total:18,observation:"",addons:[]}],history:[{time:"19:05",text:"Pagamento Pix aprovado"},{time:"19:06",text:"Pedido enviado para gestão"}],channel:"App próprio",attendant:"",producer:"",driver:"",internal_note:"",priority:"normal"},
      {id:"o2",order_number:"HUS-1025",created_at:iso,customer_name:"João",customer_email:"joao@email.com",customer_phone:"11988880000",status:"preparing",payment_status:"approved",payment_method:"Cartão",payment_gateway_id:"CARD-2122",fulfillment:"pickup",subtotal:54,delivery_fee:0,discount:5,total:49,coupon_code:"PRIMEIRACOLHER",address:null,items:[{product_id:"p3",product_name:"Uivo de Prestígio",quantity:3,unit_price:18,total:54,observation:"Retirar às 20h",addons:[]}],history:[{time:"18:41",text:"Pedido aceito"},{time:"18:50",text:"Produção iniciada"}],channel:"App próprio",attendant:"Jhonny",producer:"Cozinha",driver:"",internal_note:"Cliente pediu retirada",priority:"high"},
    ],
    categories: JSON.parse(localStorage.getItem("husky_categories") || "null") || [
      {id:"c1",name:"Bolos de pote",active:true,sort:1,image:assets.menu,schedule:"Todos os horários"},
      {id:"c2",name:"Combos",active:true,sort:2,image:assets.pedidos,schedule:"Sábados e domingos"},
      {id:"c3",name:"Promoções",active:true,sort:3,image:assets.feedbacks,schedule:"Todos os horários"},
    ],
    addons: JSON.parse(localStorage.getItem("husky_addons") || "null") || [
      {id:"a1",group:"Embalagem",name:"Sacola kraft",price:2,active:true,required:false,min:0,max:1,stock:80,products:["p1","p2","p3","p4"]},
      {id:"a2",group:"Embalagem",name:"Cartão presente",price:1.5,active:true,required:false,min:0,max:1,stock:40,products:["p1","p2","p3","p4"]},
      {id:"a3",group:"Extras",name:"Mais brigadeiro",price:3,active:true,required:false,min:0,max:2,stock:20,products:["p1"]},
    ],
    coupons: JSON.parse(localStorage.getItem("husky_coupons") || "null") || [
      {id:"cp1",code:"PRIMEIRACOLHER",title:"Primeira colher",type:"value",value:5,min_subtotal:30,min_items:0,active:true,starts_at:"",expires_at:"",max_uses:100,used:3,first_purchase:true,products:[],clients:[]},
      {id:"cp2",code:"HUSKY10",title:"10% OFF",type:"percent",value:10,min_subtotal:50,min_items:0,active:true,starts_at:"",expires_at:"",max_uses:200,used:8,first_purchase:false,products:[],clients:[]},
      {id:"cp3",code:"FRETEGRATIS",title:"Entrega grátis",type:"free_delivery",value:0,min_subtotal:35,min_items:0,active:true,starts_at:"",expires_at:"",max_uses:100,used:11,first_purchase:false,products:[],clients:[]},
    ],
    customers: JSON.parse(localStorage.getItem("husky_customers") || "null") || [
      {id:"u1",name:"Yasmin",email:"yasmin@email.com",phone:"11999990000",address:"Centro, Embu das Artes",orders:4,total_spent:162,last_order:"Hoje",favorite:"Abana Rabo",status:"active",notes:"Cliente gosta de Abana Rabo e sempre pede sem colher.",birthday:""},
      {id:"u2",name:"João",email:"joao@email.com",phone:"11988880000",address:"Jardim Vista Alegre",orders:2,total_spent:91,last_order:"Hoje",favorite:"Uivo de Prestígio",status:"active",notes:"Prefere retirada.",birthday:""},
    ],
    inventory: JSON.parse(localStorage.getItem("husky_inventory") || "null") || [],
    reviews: JSON.parse(localStorage.getItem("husky_reviews") || "null") || [
      {id:"r1",order_number:"HUS-1023",customer:"Yasmin",rating:5,comment:"Muito caprichado, amei!",product:"Abana Rabo",date:"Hoje",answered:false,tags:["sabor","embalagem"]},
    ],
    chats: JSON.parse(localStorage.getItem("husky_chats") || "null") || [
      {id:"m1",order_number:"HUS-1024",customer:"Yasmin",sender:"customer",message:"Oi, qual previsão do pedido?",created_at:iso,read:false},
    ],
    expenses: JSON.parse(localStorage.getItem("husky_expenses") || "null") || [
      {id:"e1",name:"Embalagens 250 ml",category:"Embalagens",value:82.50,date:iso.slice(0,10),payment_method:"Pix",recurring:false,quantity:100,supplier:"Fornecedor local",note:"Compra de potes"},
    ],
    suppliers: JSON.parse(localStorage.getItem("husky_suppliers") || "null") || [
      {id:"s1",name:"Fornecedor Embalagens",phone:"11977770000",email:"",product:"Potes 250 ml",last_purchase:"Hoje",avg_value:82.5,active:true,notes:"Entrega rápida"},
    ],
    deliveries: JSON.parse(localStorage.getItem("husky_deliveries") || "null") || [],
    notifications: JSON.parse(localStorage.getItem("husky_notifications") || "null") || [
      {id:"n1",type:"order",title:"Novo pedido pago",text:"Pedido HUS-1024 aguardando aceite",read:false,created_at:iso},
      {id:"n2",type:"stock",title:"Estoque baixo",text:"Pata Crocante está esgotado",read:false,created_at:iso},
    ],
    users: JSON.parse(localStorage.getItem("husky_users") || "null") || [
      {id:"adm1",name:"Administrador",email:"admin@husky.com",role:"admin",active:true,last_access:"Hoje",permissions:["all"]},
      {id:"op1",name:"Operador",email:"operador@husky.com",role:"operator",active:true,last_access:"",permissions:["orders","chat","products"]},
    ],
    settings: JSON.parse(localStorage.getItem("husky_settings") || "null") || {store_name:"Husky Confeiteiro",description:"Bolos de pote artesanais feitos em Embu das Artes.",phone:"",whatsapp:APP_CONFIG.whatsappNumber,email:"",cnpj:"",address:"Embu das Artes - SP",delivery_policy:"Entrega manual conforme disponibilidade.",cancel_policy:"Cancelamentos avaliados conforme etapa do pedido.",prep_time:25,min_order:18,delivery_fee:APP_CONFIG.deliveryFee,free_delivery_from:APP_CONFIG.freeDeliveryFrom,colors:{primary:APP_CONFIG.storeName},hours:{saturday:"19h às 23h",sunday:"11h às 21h"},capacity:20,accept_scheduled:true,theme:"light"},
    audit: JSON.parse(localStorage.getItem("husky_audit") || "null") || [],
    issues: JSON.parse(localStorage.getItem("husky_issues") || "null") || [],
    refunds: JSON.parse(localStorage.getItem("husky_refunds") || "null") || [],
    manualOrders: JSON.parse(localStorage.getItem("husky_manual_orders") || "null") || [],
    productionRuns: JSON.parse(localStorage.getItem("husky_production_runs") || "null") || [],
    banners: JSON.parse(localStorage.getItem("husky_banners") || "null") || [
      {id:"b1",title:"Estamos no app",image:assets.banner,active:true,starts_at:"",ends_at:"",link_type:"coupon",link_value:"PRIMEIRACOLHER",clicks:0,sort:1},
    ],
    channels: JSON.parse(localStorage.getItem("husky_channels") || "null") || ["App próprio","WhatsApp","Instagram","iFood","Presencial","Manual"],
    loyalty: JSON.parse(localStorage.getItem("husky_loyalty") || "null") || {enabled:true,rule:"Compre 9 bolos e ganhe 1",points_per_real:1,reward_threshold:9},
  };
}

function saveAll(){
  const d=state.data;
  Object.entries({products:d.products,orders:d.orders,categories:d.categories,addons:d.addons,coupons:d.coupons,customers:d.customers,reviews:d.reviews,chats:d.chats,expenses:d.expenses,suppliers:d.suppliers,notifications:d.notifications,users:d.users,settings:d.settings,audit:d.audit,issues:d.issues,refunds:d.refunds,manual_orders:d.manualOrders,production_runs:d.productionRuns,banners:d.banners}).forEach(([k,v])=>localStorage.setItem(`husky_${k}`,JSON.stringify(v)));
  localStorage.setItem("husky_store_open", JSON.stringify(state.storeOpen));
  localStorage.setItem("husky_sound_on", JSON.stringify(state.soundOn));
}

function newId(){return (crypto.randomUUID?crypto.randomUUID():String(Date.now()))}
function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))}

async function safeTable(label, builder){
  try{
    const res=await builder;
    if(res.error){console.warn(label,res.error.message);return []}
    return res.data||[];
  }catch(e){console.warn(label,e.message);return []}
}
async function loadSupabaseData(){
  if(!HAS_SUPABASE || !state.user) return;
  try{
    const productsData=await safeTable('products', db.from('products').select('*'));
    const ordersData=await safeTable('customer_orders', db.from('customer_orders').select('*, order_items(*)').order('created_at',{ascending:false}));
    const couponsData=await safeTable('coupons', db.from('coupons').select('*'));
    const catsData=await safeTable('product_categories', db.from('product_categories').select('*'));
    const addonsData=await safeTable('product_addons', db.from('product_addons').select('*'));
    const bannersData=await safeTable('banners', db.from('banners').select('*'));
    const profilesData=await safeTable('profiles', db.from('profiles').select('*'));
    const chatsData=await safeTable('chat_messages', db.from('chat_messages').select('*').order('created_at',{ascending:false}));
    const settingsData=await safeTable('store_settings', db.from('store_settings').select('*'));
    const reviewsData=await safeTable('reviews', db.from('reviews').select('*'));
    if(productsData.length) state.data.products=productsData.map(p=>({id:p.id,name:p.name,slug:p.slug,category:p.category||'Bolos de pote',price:Number(p.price||0),promo_price:p.promo_price,cost:Number(p.cost_estimate||p.cost||0),stock:Number(p.stock||0),min_stock:Number(p.min_stock||0),active:p.active!==false,available:p.available!==false,visible_on_client:p.visible_on_client!==false,featured:!!p.featured,image_url:p.image_url,size:p.size,weight:p.weight,prep_time:p.preparation_minutes||p.prep_time,tag:p.tag,description:p.description,details:p.details,ingredients:p.ingredients,allergens:p.allergens,sku:p.sku}));
    if(ordersData) state.data.orders=ordersData.map(o=>({...o,items:o.order_items||[],address:o.address_snapshot||o.address||null,history:o.history||[]}));
    if(couponsData.length) state.data.coupons=couponsData.map(c=>({id:c.id,code:c.code,title:c.title,type:c.discount_type,value:Number(c.discount_value||0),min_subtotal:Number(c.min_subtotal||0),min_items:Number(c.min_items||0),active:c.active!==false,starts_at:c.starts_at||'',expires_at:c.expires_at||'',max_uses:c.max_uses||0,used:c.used_count||0,first_purchase:c.first_purchase_only||false,products:[],clients:[]}));
    if(catsData.length) state.data.categories=catsData.map(c=>({id:c.id,name:c.name,active:c.active!==false,sort:c.sort_order||c.sort||1,image:c.image_url||'',schedule:typeof c.schedule==='string'?c.schedule:JSON.stringify(c.schedule||{})}));
    if(addonsData.length) state.data.addons=addonsData.map(a=>({id:a.id,group:a.group_name||a.group||'Adicionais',name:a.name,price:Number(a.price||0),active:a.active!==false,required:!!a.required,min:a.min_choices||0,max:a.max_choices||1,stock:a.stock||0,products:[]}));
    if(bannersData.length) state.data.banners=bannersData.map(b=>({id:b.id,title:b.title,image:b.image_url||b.image,active:b.active!==false,starts_at:b.starts_at,ends_at:b.ends_at,link_type:b.link_type,link_value:b.link_value,clicks:b.clicks||0,sort:b.sort_order||b.sort||1}));
    if(profilesData) state.data.customers=profilesData.map(p=>({id:p.id,name:p.name||p.email||'Cliente',email:p.email||'',phone:p.phone||'',address:p.address||'',orders:state.data.orders.filter(o=>o.user_id===p.id).length,total_spent:state.data.orders.filter(o=>o.user_id===p.id).reduce((sum,o)=>sum+Number(o.total||0),0),last_order:'',favorite:'',status:p.status||'active',notes:p.notes||'',birthday:p.birthday||''}));
    if(chatsData){
      const profileById = new Map((profilesData||[]).map(p=>[String(p.id),p]));
      const orderById = new Map((state.data.orders||[]).map(o=>[String(o.id),o]));
      state.data.chats=chatsData.map(m=>{
        const prof=profileById.get(String(m.user_id))||{};
        const ord=m.order_id?orderById.get(String(m.order_id)):null;
        return {id:m.id,user_id:m.user_id,order_id:m.order_id,order_number:ord?.order_number||'',customer:prof.name||prof.email||('Cliente '+String(m.user_id||'').slice(0,6)),phone:prof.phone||'',sender:m.sender,message:m.message,created_at:m.created_at,read:!!m.read_at};
      });
    }
    if(reviewsData.length) state.data.reviews=reviewsData.map(r=>({id:r.id,order_number:'',customer:'Cliente',rating:r.rating,comment:r.comment,product:'',date:r.created_at,answered:!!r.store_reply,answer:r.store_reply,tags:r.tags||[]}));
    if(settingsData.length){const store=settingsData.find(x=>x.key==='store')?.value||{};state.data.settings={...state.data.settings,store_name:store.name||state.data.settings.store_name,whatsapp:store.whatsapp||state.data.settings.whatsapp,description:store.description||state.data.settings.description,min_order:store.minimum_order||state.data.settings.min_order,delivery_fee:store.delivery_fee||state.data.settings.delivery_fee,free_delivery_from:store.free_delivery_from||state.data.settings.free_delivery_from};state.storeOpen=store.open!==false && store.paused!==true;}
    saveAll();
  }catch(e){console.warn('Supabase gestão:',e.message);toast('Alguns dados não carregaram do Supabase: '+e.message)}
}

async function loadSupabaseChatData(){
  if(!HAS_SUPABASE || !state.user) return;
  try{
    const [chatsData, profilesData, ordersData] = await Promise.all([
      safeTable('chat_messages', db.from('chat_messages').select('id,user_id,order_id,sender,message,created_at,read_at').order('created_at',{ascending:false}).limit(500)),
      safeTable('profiles', db.from('profiles').select('id,name,email,phone,address')),
      safeTable('customer_orders', db.from('customer_orders').select('id,order_number,user_id,customer_name,customer_email,customer_phone').order('created_at',{ascending:false}).limit(200))
    ]);
    const profileById = new Map((profilesData||[]).map(p=>[String(p.id),p]));
    const orderById = new Map((ordersData||[]).map(o=>[String(o.id),o]));
    state.data.chats=(chatsData||[]).map(m=>{
      const prof=profileById.get(String(m.user_id))||{};
      const ord=m.order_id?orderById.get(String(m.order_id)):null;
      return {
        id:m.id,user_id:m.user_id,order_id:m.order_id,order_number:ord?.order_number||'',
        customer:prof.name||ord?.customer_name||prof.email||ord?.customer_email||('Cliente '+String(m.user_id||'').slice(0,6)),
        phone:prof.phone||ord?.customer_phone||'',sender:m.sender,message:m.message,created_at:m.created_at,read:!!m.read_at
      };
    });
    saveAll();
  }catch(e){console.warn('Chat gestão:',e.message);toast('Não foi possível atualizar o chat: '+e.message)}
}

async function loadSupabaseCouponsOnly(){
  if(!HAS_SUPABASE || !state.user) return;
  const couponsData=await safeTable('coupons', db.from('coupons').select('*').order('created_at',{ascending:false}));
  state.data.coupons=(couponsData||[]).map(c=>({id:c.id,code:c.code,title:c.title,type:c.discount_type,value:Number(c.discount_value||0),min_subtotal:Number(c.min_subtotal||0),min_items:Number(c.min_items||0),active:c.active!==false,starts_at:c.starts_at||'',expires_at:c.expires_at||'',max_uses:c.max_uses||0,used:c.used_count||0,first_purchase:c.first_purchase_only||false,products:[],clients:[]}));
  saveAll();
}

function setupGestaoRealtime(){
  if(!HAS_SUPABASE||!state.user) return;
  [state.chatChannel,state.ordersChannel,state.productsChannel,state.catalogChannel].filter(Boolean).forEach(ch=>db.removeChannel(ch));
  state.chatChannel=db.channel('gestao-chat-v2')
    .on('postgres_changes',{event:'*',schema:'public',table:'chat_messages'},async()=>{await loadSupabaseChatData();if(state.route==='chat')render();})
    .subscribe();
  state.ordersChannel=db.channel('gestao-orders-v2')
    .on('postgres_changes',{event:'*',schema:'public',table:'customer_orders'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  state.productsChannel=db.channel('gestao-products-v2')
    .on('postgres_changes',{event:'*',schema:'public',table:'products'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  state.catalogChannel=db.channel('gestao-catalogo-v2')
    .on('postgres_changes',{event:'*',schema:'public',table:'coupons'},async()=>{await loadSupabaseCouponsOnly();if(state.route==='coupons')render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'product_categories'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'product_addons'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'banners'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'store_settings'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  if(state.refreshTimer) clearInterval(state.refreshTimer);
  state.refreshTimer=setInterval(async()=>{
    try{
      if(state.route==='chat') { await loadSupabaseChatData(); render(); }
      if(state.route==='coupons') { await loadSupabaseCouponsOnly(); render(); }
    }catch(e){console.warn('refresh gestão',e.message)}
  },1500);
}
async function upsertSupabase(table,payload,options={}){
  if(!HAS_SUPABASE||!state.user) return true;
  try{
    const {error}=await db.from(table).upsert(payload,options);
    if(error) throw error;
    return true;
  }catch(e){toast('Erro Supabase: '+e.message);console.error('Erro Supabase',table,payload,e);return false;}
}
async function updateSupabase(table,payload,id){
  if(!HAS_SUPABASE||!state.user) return;
  try{const {error}=await db.from(table).update(payload).eq('id',id); if(error) throw error;}catch(e){toast('Erro Supabase: '+e.message)}
}
function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function fmtDate(v){try{return new Date(v).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return v}}
function escapeHtml(str){return String(str??"").replace(/[&<>'"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;","\'":"&#39;","\"":"&quot;"}[ch]||ch})}
function showFatalError(title,error){
  console.error(title,error);
  const root=document.getElementById('root');
  if(!root) return;
  root.innerHTML=`<main class="login"><section class="login-box"><div class="logo"><div class="logo-mark"><span>🐺</span></div><div><h1>Husky Gestão</h1><p>Proteção contra tela branca</p></div></div><h2>${escapeHtml(title||'Erro na gestão')}</h2><p>A tela foi protegida para não ficar branca. Veja o detalhe e tente limpar a sessão.</p><div class="card" style="background:#fee2e2;color:#991b1b;font-weight:900">${escapeHtml(error?.message||error||'Erro desconhecido')}</div><div class="grid" style="margin-top:14px"><button class="btn blue" onclick="location.reload()">Recarregar</button><button class="btn outline" onclick="localStorage.removeItem('husky_admin_user');localStorage.removeItem('husky_gestao_auth_v1');location.reload()">Limpar sessão da gestão</button></div></section></main>`;
}
window.addEventListener('error',e=>showFatalError('Erro na gestão',e.error||e.message));
window.addEventListener('unhandledrejection',e=>showFatalError('Erro de conexão na gestão',e.reason||e));
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.remove("hidden");setTimeout(()=>el.classList.add("hidden"),2600)}
function audit(action, details){state.data.audit.unshift({id:crypto.randomUUID?.()||Date.now(),user:state.user?.email||"local",action,details,created_at:new Date().toISOString()});saveAll()}
function setRoute(route, sub="overview"){state.route=route;state.subroute=sub;state.selectedOrder=null;render(); if(route==="chat"){setTimeout(()=>manualChatRefresh(false),50)} if(["coupons","products","store"].includes(route)){setTimeout(()=>loadSupabaseData().then(()=>render()),80)} }
function statusLabel(s){return ({paid:"Aguardando aceite",accepted:"Aceito",preparing:"Em produção",packing:"Embalando",ready:"Pronto",delivery:"Em entrega",done:"Entregue",cancelled:"Cancelado",refunded:"Reembolsado",problem:"Problema"}[s]||s)}
function statusClass(s){if(["paid","accepted","ready","done"].includes(s))return "paid";if(["preparing","packing"].includes(s))return "production";if(["delivery"].includes(s))return "delivery";if(["cancelled","refunded","problem"].includes(s))return "cancelled";return "pending"}
function nextStatus(s, fulfillment){const flow=fulfillment==="pickup"?["paid","accepted","preparing","packing","ready","done"]:["paid","accepted","preparing","packing","ready","delivery","done"];return flow[Math.min(flow.indexOf(s)+1,flow.length-1)]||s}
function ensureLogin(){if(!state.user){renderLogin();return false}return true}

async function login(email,password){
  if(HAS_SUPABASE){
    const {data,error}=await db.auth.signInWithPassword({email,password});
    if(error){toast("Login inválido: "+error.message);return}
    const role=await loadRole(data.user.id);
    if(!role){toast("Usuário sem permissão de gestão.");await db.auth.signOut();return}
    state.user={id:data.user.id,email:data.user.email,name:role.name||data.user.email,role:role.role||"operator",permissions:role.permissions||[]};
  }else{
    const found=state.data.users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.active);
    if(!found){toast("E-mail sem permissão de gestão. Use admin@husky.com no modo local.");return}
    state.user={id:found.id,email:found.email,name:found.name,role:found.role,permissions:found.permissions};
  }
  localStorage.setItem("husky_admin_user",JSON.stringify(state.user));audit("login","Acesso à gestão");
  await loadSupabaseData(); setupGestaoRealtime(); render();
}
async function loadRole(userId){
  try{
    const {data,error}=await db.from("admin_users").select("*").eq("user_id",userId).eq("active",true).single();
    if(error)return null;
    let permissions=data.permissions;
    if(typeof permissions==='string'){
      try{permissions=JSON.parse(permissions)}catch{permissions=[permissions]}
    }
    if(!Array.isArray(permissions)) permissions=['all'];
    return {...data, permissions};
  }catch(e){return null}
}
async function logout(){
  if (HAS_SUPABASE && db) {
    try { await db.auth.signOut(); } catch (e) {}
  }
  state.user=null;
  localStorage.removeItem("husky_admin_user");
  renderLogin();
}

function renderLogin(){
  document.getElementById("root").innerHTML=`<main class="login"><section class="login-box"><div class="logo"><div class="logo-mark"><img src="${assets.logo}" onerror="this.style.display='none'"><span>🐺</span></div><div><h1>Husky Gestão</h1><p>Painel operacional completo</p></div></div><h2>Entrar na gestão</h2><p>Acesso separado do cliente. Use e-mail com permissão administrativa.</p><div class="grid"><div class="field"><label>E-mail</label><input id="loginEmail" value="admin@husky.com"></div><div class="field"><label>Senha</label><input id="loginPass" type="password" value="123456"></div><button class="btn blue" onclick="login(document.getElementById('loginEmail').value,document.getElementById('loginPass').value)">Entrar</button><button class="btn light" onclick="toast('Recuperação será feita pelo Supabase Auth.')">Recuperar senha</button><p style="font-size:12px;color:#777;font-weight:800">Modo local: use admin@husky.com. No Supabase, crie o usuário em Authentication e cadastre em admin_users.</p></div></section></main>`;
}

function layout(content){
  const nav=[
    ["Operação",[["dashboard","🏠","Dashboard"],["orders","🧾","Pedidos"],["production","👩‍🍳","Produção"],["deliveries","🚚","Entregas"],["chat","💬","Chat/Suporte"]]],
    ["Loja",[["products","🍰","Cardápio"],["categories","🗂️","Categorias"],["addons","➕","Adicionais"],["inventory","📦","Estoque"],["store","🔓","Loja/Horários"],["banners","🖼️","Banners/Feed"]]],
    ["Comercial",[["customers","👥","Clientes"],["coupons","🎟️","Cupons"],["reviews","⭐","Avaliações"],["loyalty","🏆","Fidelidade"],["channels","📣","Canais"]]],
    ["Financeiro",[["finance","💰","Financeiro"],["expenses","💸","Despesas"],["suppliers","🤝","Fornecedores"],["refunds","↩️","Reembolsos"],["reports","📊","Relatórios"]]],
    ["Sistema",[["issues","⚠️","Chamados"],["manual","✍️","Pedidos manuais"],["schedule","📅","Agendados"],["notifications","🔔","Notificações"],["audit","🕵️","Auditoria"],["users","🔐","Usuários"],["settings","⚙️","Configurações"],["export","📤","Exportação"]]],
  ];
  const navHtml=nav.map(([g,items])=>`<div class="group-title">${g}</div>${items.map(([r,i,l])=>`<button class="${state.route===r?'active':''}" onclick="setRoute('${r}')"><span>${i}</span><span>${l}</span></button>`).join('')}`).join('');
  const mobileItems=[...nav.flatMap(x=>x[1])].slice(0,6).map(([r,i,l])=>`<button class="${state.route===r?'active':''}" onclick="setRoute('${r}')"><span>${i}</span><span>${l.split('/')[0]}</span></button>`).join('');
  return `<div class="app"><aside class="sidebar"><div class="logo"><div class="logo-mark"><img src="${assets.logo}" onerror="this.style.display='none'"><span>🐺</span></div><div><h1>Husky Gestão</h1><p>Controle total da confeitaria</p></div></div><div class="user-card"><small>${state.user.role}</small><strong>${state.user.name}</strong><p style="margin:4px 0 0;color:#777;font-weight:800;font-size:12px">${state.user.email}</p></div><nav class="nav">${navHtml}</nav><button class="btn outline" style="margin-top:20px;width:100%" onclick="logout()">Sair</button></aside><main class="main"><header class="topbar"><div><span class="pill ${state.storeOpen?'':'closed'}">${state.storeOpen?'🟢 Loja aberta':'🔴 Loja fechada'}</span> <span class="pill">${HAS_SUPABASE?'Supabase conectado':'Modo local sem Supabase'}</span></div><div class="toolbar"><button class="btn light" onclick="toggleSound()">${state.soundOn?'🔊 Som':'🔇 Sem som'}</button><button class="btn ${state.storeOpen?'red':'green'}" onclick="toggleStore()">${state.storeOpen?'Fechar loja':'Abrir loja'}</button><button class="btn blue" onclick="setRoute('orders')">Ver pedidos</button></div></header><section class="content">${content}</section></main><div class="mobile-menu"><nav class="nav">${mobileItems}</nav></div></div>`;
}
function title(title,desc,actions=""){return `<div class="title-row"><div><h2>${title}</h2><p>${desc}</p></div><div class="toolbar">${actions}</div></div>`}
function render(){
  try{
    if(!ensureLogin())return; let html=""; const r=state.route;
    if(r==="dashboard")html=dashboard(); if(r==="orders")html=ordersPage(); if(r==="production")html=productionPage(); if(r==="deliveries")html=deliveriesPage(); if(r==="products")html=productsPage(); if(r==="categories")html=genericCrud("Categorias","Organize o cardápio por grupos e horários.","categories",categoryFields()); if(r==="addons")html=genericCrud("Adicionais","Controle complementos, regras e disponibilidade.","addons",addonFields()); if(r==="inventory")html=inventoryPage(); if(r==="store")html=storePage(); if(r==="finance")html=financePage(); if(r==="coupons")html=couponsPage(); if(r==="customers")html=customersPage(); if(r==="reviews")html=reviewsPage(); if(r==="chat")html=chatPage(); if(r==="expenses")html=genericCrud("Despesas","Registre custos, comprovantes e categorias.","expenses",expenseFields()); if(r==="suppliers")html=genericCrud("Fornecedores","Cadastre contatos, compras e histórico.","suppliers",supplierFields()); if(r==="banners")html=genericCrud("Banners e feed","Gerencie promoções da home do cliente.","banners",bannerFields()); if(r==="notifications")html=notificationsPage(); if(r==="audit")html=auditPage(); if(r==="users")html=usersPage(); if(r==="issues")html=genericCrud("Chamados internos","Registre problemas, responsáveis e resolução.","issues",issueFields()); if(r==="refunds")html=genericCrud("Reembolsos","Controle reembolso total/parcial e aprovação.","refunds",refundFields()); if(r==="manual")html=manualOrdersPage(); if(r==="channels")html=channelsPage(); if(r==="schedule")html=schedulePage(); if(r==="loyalty")html=loyaltyPage(); if(r==="reports")html=reportsPage(); if(r==="settings")html=settingsPage(); if(r==="export")html=exportPage();
    document.getElementById("root").innerHTML=layout(html||dashboard());
  }catch(e){showFatalError('Erro ao renderizar a gestão',e)}
}
function toggleStore(){state.storeOpen=!state.storeOpen;state.data.notifications.unshift({id:Date.now(),type:"store",title:state.storeOpen?"Loja aberta":"Loja fechada",text:"Status alterado pela gestão",read:false,created_at:new Date().toISOString()});audit("store_status",state.storeOpen?"Aberta":"Fechada");saveAll();render()}
function toggleSound(){state.soundOn=!state.soundOn;localStorage.setItem("husky_sound_on",JSON.stringify(state.soundOn));render()}

function dashboard(){
  const o=state.data.orders, p=state.data.products;
  const todayRevenue=o.filter(x=>x.payment_status==="approved"&&!['cancelled','refunded'].includes(x.status)).reduce((s,x)=>s+x.total,0);
  const cakes=o.flatMap(x=>x.items).reduce((s,i)=>s+i.quantity,0);
  const low=p.filter(x=>Number(x.stock)<=Number(x.min_stock)).length;
  const newOrders=o.filter(x=>x.status==="paid").length;
  const avg=o.length?todayRevenue/o.length:0;
  return `${title('Dashboard','Visão geral em tempo real da operação da Husky.',`<button class="btn blue" onclick="setRoute('orders')">Central de pedidos</button><button class="btn cream" onclick="setRoute('products')">Editar cardápio</button><button class="btn light" onclick="window.print()">Imprimir resumo</button>`)}<div class="grid cols-4"><div class="metric"><small>Faturamento hoje</small><strong>${money(todayRevenue)}</strong><span>Pedidos pagos aprovados</span></div><div class="metric"><small>Bolos vendidos</small><strong>${cakes}</strong><span>Unidades no período</span></div><div class="metric"><small>Aguardando aceite</small><strong>${newOrders}</strong><span>Pedidos que precisam de ação</span></div><div class="metric"><small>Ticket médio</small><strong>${money(avg)}</strong><span>Valor médio por pedido</span></div></div><div class="grid cols-3" style="margin-top:16px"><div class="card"><h3>Alertas agora</h3>${alertList()}</div><div class="card"><h3>Ações rápidas</h3><div class="grid"><button class="btn blue" onclick="setRoute('orders')">Aceitar pedidos</button><button class="btn light" onclick="setRoute('production')">Modo produção</button><button class="btn light" onclick="setRoute('inventory')">Ver estoque baixo (${low})</button><button class="btn light" onclick="setRoute('coupons')">Criar cupom</button></div></div><div class="card"><h3>Produtos mais vendidos</h3>${bestProducts()}</div></div><div style="margin-top:16px" class="split"><div>${ordersKanban(true)}</div><div class="card"><h3>Resumo financeiro</h3>${financeSummary()}</div></div>`;
}
function alertList(){const alerts=[...state.data.notifications.filter(n=>!n.read).slice(0,7)]; if(!alerts.length)return `<div class="empty">Sem alertas pendentes</div>`; return alerts.map(n=>`<div class="order-card"><strong>${n.title}</strong><p>${n.text}</p><button class="btn light" onclick="markNotification('${n.id}')">Marcar como lido</button></div>`).join('')}
function bestProducts(){const map={};state.data.orders.forEach(o=>o.items.forEach(i=>map[i.product_name]=(map[i.product_name]||0)+i.quantity));const arr=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);return arr.length?arr.map(([n,q])=>`<p style="font-weight:900">${n}<span style="float:right">${q}</span></p><div class="bar"><span style="width:${Math.min(100,q*20)}%"></span></div>`).join(''):`<div class="empty">Sem vendas ainda</div>`}
function financeSummary(){const gross=state.data.orders.reduce((s,o)=>s+o.total,0), discounts=state.data.orders.reduce((s,o)=>s+(o.discount||0),0), fees=gross*.035, expenses=state.data.expenses.reduce((s,e)=>s+Number(e.value||0),0);return `<p><b>Bruto:</b> ${money(gross)}</p><p><b>Taxas estimadas:</b> ${money(fees)}</p><p><b>Descontos:</b> ${money(discounts)}</p><p><b>Despesas:</b> ${money(expenses)}</p><hr><h2>${money(gross-fees-expenses)}</h2><p style="color:#777;font-weight:800">Lucro líquido estimado</p>`}

function ordersPage(){
  const actions=`<button class="btn blue" onclick="setRoute('manual')">Criar pedido manual</button><button class="btn light" onclick="exportCSV('orders')">Exportar CSV</button>`;
  return `${title('Central de pedidos','Pedidos pagos, aceite, produção, entrega, cancelamento e histórico.',actions)}${filters()}${ordersKanban(false)}${state.selectedOrder?orderModal(state.selectedOrder):''}`;
}
function filters(){return `<div class="toolbar"><input style="border:0;border-radius:16px;padding:13px;background:#fff;font-weight:800;min-width:260px" placeholder="Buscar pedido, cliente, telefone, produto..." value="${state.search}" oninput="state.search=this.value;render()"><select onchange="state.statusFilter=this.value;render()" style="border:0;border-radius:16px;padding:13px;background:#fff;font-weight:900"><option value="all">Todos status</option>${['paid','accepted','preparing','packing','ready','delivery','done','cancelled','problem'].map(s=>`<option ${state.statusFilter===s?'selected':''} value="${s}">${statusLabel(s)}</option>`).join('')}</select><select onchange="state.periodFilter=this.value;render()" style="border:0;border-radius:16px;padding:13px;background:#fff;font-weight:900"><option value="today">Hoje</option><option value="7">Últimos 7 dias</option><option value="month">Mês atual</option><option value="all">Todos</option></select></div>`}
function filteredOrders(){const q=state.search.toLowerCase();return state.data.orders.filter(o=>{const match=!q||JSON.stringify(o).toLowerCase().includes(q);const st=state.statusFilter==='all'||o.status===state.statusFilter;return match&&st}).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))}
function ordersKanban(compact){const columns=[['paid','Aguardando aceite'],['accepted','Aceitos'],['preparing','Produção'],['ready','Prontos/Entrega']];return `<div class="kanban">${columns.map(([key,label])=>`<div class="column"><h3>${label}</h3>${filteredOrders().filter(o=>key==='ready'?['packing','ready','delivery','done'].includes(o.status):o.status===key).map(o=>orderCard(o,compact)).join('')||'<div class="empty">Vazio</div>'}</div>`).join('')}</div>`}
function orderCard(o,compact){const late=(Date.now()-new Date(o.created_at).getTime())/60000>25&&!['done','cancelled'].includes(o.status);return `<div class="order-card"><div style="display:flex;justify-content:space-between;gap:8px"><h4>${o.order_number}</h4><span class="status ${statusClass(o.status)}">${statusLabel(o.status)}</span></div><p><b>${o.customer_name}</b> • ${fmtDate(o.created_at)} ${late?'<span class="badge">Atrasando</span>':''}</p><p>${o.items.map(i=>`${i.quantity}x ${i.product_name}`).join(', ')}</p><p><b>${money(o.total)}</b> • ${o.payment_method} • ${o.fulfillment==='delivery'?'Entrega':'Retirada'}</p><div class="actions"><button class="btn light" onclick="openOrder('${o.id}')">Detalhes</button>${!compact?quickOrderButtons(o):''}</div></div>`}
function quickOrderButtons(o){if(o.status==='paid')return `<button class="btn green" onclick="changeOrderStatus('${o.id}','accepted')">Aceitar</button><button class="btn red" onclick="cancelOrder('${o.id}')">Recusar</button>`; if(!['done','cancelled','refunded'].includes(o.status))return `<button class="btn blue" onclick="changeOrderStatus('${o.id}','${nextStatus(o.status,o.fulfillment)}')">Avançar</button>`; return ``}
function openOrder(id){state.selectedOrder=state.data.orders.find(o=>o.id===id);render()}
function closeModal(){state.selectedOrder=null;render()}
function changeOrderStatus(id,status){const o=state.data.orders.find(x=>x.id===id);if(!o)return;if(o.payment_status!=='approved'&&status!=='cancelled'){toast('Pedido sem pagamento aprovado não pode avançar.');return}o.status=status;o.history=o.history||[];const note=`Status alterado para ${statusLabel(status)} por ${state.user.name}`;o.history.push({time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),text:note});state.data.notifications.unshift({id:Date.now(),type:'status',title:`${o.order_number}: ${statusLabel(status)}`,text:`Cliente será atualizado no app.`,read:false,created_at:new Date().toISOString()});audit('order_status',`${o.order_number} -> ${status}`);saveAll(); if(HAS_SUPABASE){updateSupabase('customer_orders',{status},o.id);db.from('order_history').insert({order_id:o.id,status,note,actor_id:state.user.id,actor_name:state.user.name});} if(state.soundOn&&status==='accepted')beep();render()}
function cancelOrder(id){const reason=prompt('Motivo do cancelamento/recusa:');if(!reason)return;const o=state.data.orders.find(x=>x.id===id);o.status='cancelled';o.cancel_reason=reason;o.history.push({time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),text:`Pedido cancelado: ${reason}`});state.data.issues.unshift({id:Date.now(),order_number:o.order_number,customer:o.customer_name,type:'Cancelamento',priority:'alta',status:'aberto',responsible:state.user.name,note:reason,created_at:new Date().toISOString()});audit('order_cancel',`${o.order_number}: ${reason}`);saveAll();render()}
function orderModal(o){return `<div class="modal no-print"><div class="modal-box"><div class="modal-head"><div><h3>${o.order_number}</h3><p style="margin:6px 0;color:#777;font-weight:800">${o.customer_name} • ${fmtDate(o.created_at)} • <span class="status ${statusClass(o.status)}">${statusLabel(o.status)}</span></p></div><button class="btn light" onclick="closeModal()">Fechar</button></div><div class="modal-body"><div class="section-tabs"><button class="active">Resumo</button><button onclick="printCommand('${o.id}')">Imprimir comanda</button><button onclick="sendWhatsApp('${o.id}')">WhatsApp</button><button onclick="createRefund('${o.id}')">Reembolso</button><button onclick="createIssue('${o.id}')">Abrir chamado</button></div><div class="grid cols-2"><div class="card"><h3>Cliente</h3><p><b>Nome:</b> ${o.customer_name}</p><p><b>Telefone:</b> ${o.customer_phone}</p><p><b>E-mail:</b> ${o.customer_email}</p><p><b>Endereço:</b> ${o.fulfillment==='delivery'?`${o.address?.street||''}, ${o.address?.number||''} - ${o.address?.neighborhood||''}`:'Retirada'}</p><p><b>Referência:</b> ${o.address?.reference||'-'}</p></div><div class="card"><h3>Pagamento</h3><p><b>Status:</b> ${o.payment_status}</p><p><b>Forma:</b> ${o.payment_method}</p><p><b>Transação:</b> ${o.payment_gateway_id}</p><p><b>Total:</b> ${money(o.total)}</p><p><b>Líquido estimado:</b> ${money(o.total-o.total*.035)}</p></div></div><div class="card" style="margin-top:16px"><h3>Itens</h3><table class="table"><thead><tr><th>Produto</th><th>Qtd</th><th>Unitário</th><th>Adicionais</th><th>Obs</th><th>Total</th></tr></thead><tbody>${o.items.map(i=>`<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${money(i.unit_price)}</td><td>${(i.addons||[]).join(', ')}</td><td>${i.observation||''}</td><td>${money(i.total)}</td></tr>`).join('')}</tbody></table></div><div class="grid cols-2" style="margin-top:16px"><div class="card"><h3>Histórico do pedido</h3><div class="timeline">${(o.history||[]).map(h=>`<div class="timeline-item"><span class="dot"></span><div><b>${h.time}</b><p style="margin:3px 0;color:#777;font-weight:800">${h.text}</p></div></div>`).join('')}</div></div><div class="card"><h3>Ações de status</h3><div class="grid"><button class="btn green" onclick="changeOrderStatus('${o.id}','accepted')">Aceitar pedido</button><button class="btn blue" onclick="changeOrderStatus('${o.id}','preparing')">Iniciar produção</button><button class="btn blue" onclick="changeOrderStatus('${o.id}','packing')">Embalando</button><button class="btn blue" onclick="changeOrderStatus('${o.id}','ready')">Pronto</button><button class="btn blue" onclick="changeOrderStatus('${o.id}','delivery')">Saiu para entrega</button><button class="btn green" onclick="changeOrderStatus('${o.id}','done')">Entregue/Retirado</button><button class="btn red" onclick="cancelOrder('${o.id}')">Cancelar</button></div></div></div></div></div></div>`}
function printCommand(id){const o=state.data.orders.find(x=>x.id===id);const w=window.open('','_blank');w.document.write(`<html><head><title>Comanda ${o.order_number}</title><style>body{font-family:Arial;padding:20px}h1{font-size:22px}.box{border:1px solid #000;padding:10px;margin:10px 0}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:6px;text-align:left}</style></head><body><h1>Husky Confeiteiro</h1><h2>Comanda ${o.order_number}</h2><div class="box"><b>${o.customer_name}</b><br>${o.fulfillment==='delivery'?'Entrega':'Retirada'}<br>Pagamento: ${o.payment_status}</div><table><tr><th>Item</th><th>Qtd</th><th>Obs</th></tr>${o.items.map(i=>`<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${i.observation||''}</td></tr>`).join('')}</table><p>Previsão: ${o.fulfillment==='delivery'?'20-35 min':'Retirada'}</p></body></html>`);w.document.close();w.print()}
function sendWhatsApp(id){const o=state.data.orders.find(x=>x.id===id);const txt=encodeURIComponent(`Olá, ${o.customer_name}! Seu pedido ${o.order_number} da Husky Confeiteiro está como: ${statusLabel(o.status)}.`);window.open(`https://wa.me/55${o.customer_phone.replace(/\D/g,'')}?text=${txt}`,'_blank')}
function createRefund(id){const o=state.data.orders.find(x=>x.id===id);const reason=prompt('Motivo do reembolso:'); if(!reason)return; state.data.refunds.unshift({id:Date.now(),order_number:o.order_number,customer:o.customer_name,value:o.total,type:'total',status:'solicitado',reason,approved_by:'',created_at:new Date().toISOString()});audit('refund_create',o.order_number);saveAll();render()}
function createIssue(id){const o=state.data.orders.find(x=>x.id===id);const note=prompt('Descreva o problema/chamado:'); if(!note)return; state.data.issues.unshift({id:Date.now(),order_number:o.order_number,customer:o.customer_name,type:'Pedido',priority:'normal',status:'aberto',responsible:state.user.name,note,created_at:new Date().toISOString()});audit('issue_create',o.order_number);saveAll();render()}

function productionPage(){const open=state.data.orders.filter(o=>['accepted','preparing','packing'].includes(o.status));const totals={};open.forEach(o=>o.items.forEach(i=>totals[i.product_name]=(totals[i.product_name]||0)+i.quantity));return `${title('Produção','Modo cozinha/confeitaria com cards grandes e sem financeiro.',`<button class="btn light" onclick="setRoute('inventory')">Ver estoque</button><button class="btn blue" onclick="startProductionRun()">Criar produção do dia</button>`)}<div class="grid cols-2"><div class="card"><h3>Total a produzir</h3>${Object.entries(totals).map(([n,q])=>`<p style="font-size:20px;font-weight:950">${q} ${n}</p>`).join('')||'<div class="empty">Nada em produção</div>'}</div><div class="card"><h3>Comandas rápidas</h3><button class="btn light" onclick="window.print()">Imprimir tela</button></div></div><div class="kanban" style="margin-top:16px">${['accepted','preparing','packing','ready'].map(s=>`<div class="column"><h3>${statusLabel(s)}</h3>${state.data.orders.filter(o=>o.status===s).map(o=>orderCard(o,false)).join('')||'<div class="empty">Vazio</div>'}</div>`).join('')}</div>`}
function startProductionRun(){const data={id:Date.now(),date:new Date().toISOString().slice(0,10),responsible:state.user.name,items:state.data.products.map(p=>({product_id:p.id,name:p.name,qty:0})),losses:0,status:'aberta'};state.data.productionRuns.unshift(data);audit('production_run','Produção do dia criada');saveAll();setRoute('inventory')}
function deliveriesPage(){const dels=state.data.orders.filter(o=>o.fulfillment==='delivery'&&['ready','delivery','done','problem'].includes(o.status));return `${title('Entregas','Controle de pedidos prontos, rota, entregador e comprovante.',`<button class="btn light" onclick="setRoute('store')">Área de entrega</button>`)}<div class="grid cols-3"><div class="card"><h3>Prontos para sair</h3>${dels.filter(o=>o.status==='ready').map(o=>orderCard(o,false)).join('')||'<div class="empty">Nenhum</div>'}</div><div class="card"><h3>Saiu para entrega</h3>${dels.filter(o=>o.status==='delivery').map(o=>orderCard(o,false)).join('')||'<div class="empty">Nenhum</div>'}</div><div class="card"><h3>Entregues/problemas</h3>${dels.filter(o=>['done','problem'].includes(o.status)).map(o=>orderCard(o,false)).join('')||'<div class="empty">Nenhum</div>'}</div></div>`}
function productsPage(){return `${title('Cardápio','Edite produtos, preço, foto, disponibilidade e visibilidade no app do cliente.',`<button class="btn blue" onclick="openProductForm()">Criar produto</button><button class="btn light" onclick="syncClient()">Atualizar cliente</button>`)}<div class="table-wrap"><table class="table"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Custo</th><th>Estoque</th><th>Cliente</th><th>Status</th><th>Ações</th></tr></thead><tbody>${state.data.products.map(p=>`<tr><td><img class="mini-img" src="${p.image_url}" onerror="this.style.display='none'"> <b>${p.name}</b><br><small>${p.description}</small></td><td>${p.category}</td><td>${money(p.price)}</td><td>${money(p.cost)}</td><td><span class="status ${p.stock<=p.min_stock?'low':'active'}">${p.stock}</span></td><td>${p.visible_on_client?'Sim':'Não'}</td><td><span class="status ${p.available?'active':'closed'}">${p.available?'Disponível':'Indisponível'}</span></td><td><button class="btn light" onclick="editProduct('${p.id}')">Editar</button> <button class="btn ${p.available?'red':'green'}" onclick="toggleProduct('${p.id}')">${p.available?'Esgotar':'Reativar'}</button></td></tr>`).join('')}</tbody></table></div>`}
function toggleProduct(id){const p=state.data.products.find(x=>x.id===id);p.available=!p.available;if(p.available&&p.stock===0)p.stock=1;audit('product_toggle',`${p.name}: ${p.available}`);saveAll();updateSupabase('products',{available:p.available,stock:p.stock},p.id);render()}
function openProductForm(){editProduct(null)}
function editProduct(id){const p=id?state.data.products.find(x=>x.id===id):{id:'p'+Date.now(),name:'',category:'Bolos de pote',price:18,cost:0,stock:0,min_stock:4,active:true,available:true,visible_on_client:true,featured:false,image_url:'',description:'',details:'',ingredients:'',allergens:'',sku:''};const isNew=!id;document.getElementById('root').insertAdjacentHTML('beforeend',`<div class="modal"><div class="modal-box"><div class="modal-head"><h3>${isNew?'Criar produto':'Editar produto'}</h3><button class="btn light" onclick="render()">Fechar</button></div><div class="modal-body"><div class="form-grid">${['name','category','price','cost','stock','min_stock','image_url','tag','sku','description','details','ingredients','allergens'].map(k=>`<div class="field ${['description','details','ingredients','allergens'].includes(k)?'wide':''}"><label>${k}</label>${['description','details','ingredients','allergens'].includes(k)?`<textarea id="pf_${k}">${p[k]||''}</textarea>`:`<input id="pf_${k}" value="${p[k]??''}">`}</div>`).join('')}<div class="wide toolbar"><label class="pill"><input type="checkbox" id="pf_available" ${p.available?'checked':''}> Disponível</label><label class="pill"><input type="checkbox" id="pf_visible" ${p.visible_on_client?'checked':''}> Mostrar no cliente</label><label class="pill"><input type="checkbox" id="pf_featured" ${p.featured?'checked':''}> Destaque</label></div></div><button class="btn blue" onclick="saveProduct('${p.id}',${isNew})">Salvar produto</button></div></div></div>`)}
function saveProduct(id,isNew){const p=isNew?{id}:state.data.products.find(x=>x.id===id);['name','category','price','cost','stock','min_stock','image_url','tag','sku','description','details','ingredients','allergens'].forEach(k=>p[k]=document.getElementById('pf_'+k).value);['price','cost','stock','min_stock'].forEach(k=>p[k]=Number(p[k]||0));p.available=document.getElementById('pf_available').checked;p.visible_on_client=document.getElementById('pf_visible').checked;p.featured=document.getElementById('pf_featured').checked;if(isNew)state.data.products.unshift(p);audit('product_save',p.name);saveAll();upsertSupabase('products',{id:p.id,name:p.name,slug:p.slug||String(p.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),description:p.description,details:p.details,ingredients:p.ingredients,allergens:p.allergens,image_url:p.image_url,price:p.price,cost_estimate:p.cost,stock:p.stock,min_stock:p.min_stock,tag:p.tag,sku:p.sku,active:true,available:p.available,visible_on_client:p.visible_on_client,featured:p.featured});render()}
function syncClient(){toast('Alterações salvas. O app cliente lerá o mesmo banco/configuração.');saveAll()}
function inventoryPage(){return `${title('Estoque','Entrada, saída, estoque mínimo, perdas e produção do dia.',`<button class="btn blue" onclick="adjustStockPrompt()">Ajustar estoque</button><button class="btn light" onclick="startProductionRun()">Produção do dia</button>`)}<div class="grid cols-4">${state.data.products.map(p=>`<div class="metric"><small>${p.name}</small><strong>${p.stock}</strong><span>${p.stock<=p.min_stock?'Estoque baixo':'Estoque ok'}</span><button class="btn light" onclick="adjustStock('${p.id}')">Ajustar</button></div>`).join('')}</div><div style="margin-top:16px" class="card"><h3>Produções do dia</h3>${state.data.productionRuns.map(run=>`<div class="order-card"><b>${run.date}</b><p>Responsável: ${run.responsible} • Status: ${run.status}</p></div>`).join('')||'<div class="empty">Sem produções registradas</div>'}</div>`}
function adjustStockPrompt(){const id=prompt('ID do produto: p1, p2, p3...');if(id)adjustStock(id)}
function adjustStock(id){const p=state.data.products.find(x=>x.id===id);const q=Number(prompt(`Novo estoque para ${p.name}:`,p.stock));if(Number.isFinite(q)){p.stock=q;p.available=q>0;state.data.notifications.unshift({id:Date.now(),type:'stock',title:'Estoque alterado',text:`${p.name}: ${q}`,read:false,created_at:new Date().toISOString()});audit('stock_adjust',`${p.name}: ${q}`);saveAll();render()}}
function storePage(){const s=state.data.settings;return `${title('Loja, horários e área de entrega','Abra/feche, pause pedidos, configure horários, taxas e área atendida.',`<button class="btn ${state.storeOpen?'red':'green'}" onclick="toggleStore()">${state.storeOpen?'Fechar loja':'Abrir loja'}</button>`)}<div class="grid cols-2"><div class="card"><h3>Status da loja</h3><p class="status ${state.storeOpen?'active':'closed'}">${state.storeOpen?'Aberta':'Fechada'}</p><div class="field"><label>Motivo da pausa/fechamento</label><input id="pauseReason" placeholder="Muitos pedidos, falta de insumo..."></div><button class="btn light" onclick="pauseStore()">Pausar com motivo</button></div><div class="card"><h3>Horários</h3><div class="field"><label>Sábado</label><input id="hSat" value="${s.hours.saturday}"></div><div class="field"><label>Domingo</label><input id="hSun" value="${s.hours.sunday}"></div><div class="field"><label>Capacidade máxima de pedidos</label><input id="capacity" value="${s.capacity}"></div><button class="btn blue" onclick="saveHours()">Salvar horários</button></div><div class="card"><h3>Taxas e entrega</h3><div class="field"><label>Taxa fixa</label><input id="deliveryFee" value="${s.delivery_fee}"></div><div class="field"><label>Frete grátis acima de</label><input id="freeFrom" value="${s.free_delivery_from}"></div><div class="field"><label>Área atendida</label><textarea id="deliveryArea">Embu das Artes, regiões próximas, retirada disponível.</textarea></div><button class="btn blue" onclick="saveDeliverySettings()">Salvar entrega</button></div><div class="card"><h3>Pedido agendado</h3><label class="pill"><input type="checkbox" ${s.accept_scheduled?'checked':''} onchange="state.data.settings.accept_scheduled=this.checked;saveAll()"> Aceitar agendamento</label><p style="font-weight:800;color:#777">Bloqueio de horários lotados e agenda semanal ficam nesta área.</p></div></div>`}
function pauseStore(){state.storeOpen=false;state.data.settings.pause_reason=document.getElementById('pauseReason').value;saveAll();render()}function saveHours(){state.data.settings.hours.saturday=document.getElementById('hSat').value;state.data.settings.hours.sunday=document.getElementById('hSun').value;state.data.settings.capacity=Number(document.getElementById('capacity').value);saveAll();toast('Horários salvos')}function saveDeliverySettings(){state.data.settings.delivery_fee=Number(document.getElementById('deliveryFee').value);state.data.settings.free_delivery_from=Number(document.getElementById('freeFrom').value);state.data.settings.delivery_area=document.getElementById('deliveryArea').value;saveAll();toast('Entrega salva')}
function financePage(){const gross=state.data.orders.reduce((s,o)=>s+o.total,0);const discounts=state.data.orders.reduce((s,o)=>s+(o.discount||0),0);const delivery=state.data.orders.reduce((s,o)=>s+(o.delivery_fee||0),0);const fees=gross*.035;const expenses=state.data.expenses.reduce((s,e)=>s+Number(e.value||0),0);return `${title('Financeiro','Pagamentos, taxas, líquido, Pix, cartão, reembolsos e repasses.',`<button class="btn light" onclick="exportCSV('finance')">Exportar financeiro</button>`)}<div class="grid cols-4"><div class="metric"><small>Bruto</small><strong>${money(gross)}</strong></div><div class="metric"><small>Descontos</small><strong>${money(discounts)}</strong></div><div class="metric"><small>Taxas estimadas</small><strong>${money(fees)}</strong></div><div class="metric"><small>Líquido</small><strong>${money(gross-fees-expenses)}</strong></div></div><div class="table-wrap" style="margin-top:16px"><table class="table"><thead><tr><th>Pedido</th><th>Pagamento</th><th>Status</th><th>Bruto</th><th>Entrega</th><th>Desconto</th><th>Taxa</th><th>Líquido</th><th>ID transação</th></tr></thead><tbody>${state.data.orders.map(o=>`<tr><td>${o.order_number}</td><td>${o.payment_method}</td><td>${o.payment_status}</td><td>${money(o.total)}</td><td>${money(o.delivery_fee)}</td><td>${money(o.discount)}</td><td>${money(o.total*.035)}</td><td>${money(o.total-o.total*.035)}</td><td>${o.payment_gateway_id}</td></tr>`).join('')}</tbody></table></div>`}
function couponsPage(){return genericCrud('Cupons e promoções','Crie cupom, frete grátis, limite de uso, primeira compra e produtos aplicáveis.','coupons',couponFields())}
function customersPage(){return `${title('Clientes','Histórico, gasto total, observações, WhatsApp e pedidos anteriores.',`<button class="btn light" onclick="exportCSV('customers')">Exportar clientes</button>`)}<div class="table-wrap"><table class="table"><thead><tr><th>Cliente</th><th>Contato</th><th>Pedidos</th><th>Total gasto</th><th>Favorito</th><th>Status</th><th>Ações</th></tr></thead><tbody>${state.data.customers.map(c=>`<tr><td><b>${c.name}</b><br><small>${c.notes||''}</small></td><td>${c.phone}<br>${c.email}</td><td>${c.orders}</td><td>${money(c.total_spent)}</td><td>${c.favorite}</td><td><span class="status ${c.status==='active'?'active':'closed'}">${c.status}</span></td><td><button class="btn light" onclick="openCustomerWhats('${c.id}')">WhatsApp</button><button class="btn light" onclick="createManualForCustomer('${c.id}')">Pedido manual</button></td></tr>`).join('')}</tbody></table></div>`}
function openCustomerWhats(id){const c=state.data.customers.find(x=>x.id===id);window.open(`https://wa.me/55${c.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Olá! Aqui é da Husky Confeiteiro 💙')}`,'_blank')}
function createManualForCustomer(id){setRoute('manual');setTimeout(()=>toast('Selecione o cliente na criação de pedido manual.'),100)}
function reviewsPage(){return `${title('Avaliações e feedbacks','Veja, responda e transforme feedback em melhoria.',`<button class="btn light" onclick="exportCSV('reviews')">Exportar feedbacks</button>`)}<div class="grid cols-3"><div class="metric"><small>Nota média</small><strong>${avgRating()}</strong></div><div class="metric"><small>Avaliações</small><strong>${state.data.reviews.length}</strong></div><div class="metric"><small>Não respondidas</small><strong>${state.data.reviews.filter(r=>!r.answered).length}</strong></div></div><div class="grid cols-2" style="margin-top:16px">${state.data.reviews.map(r=>`<div class="card"><h3>${'⭐'.repeat(r.rating)} ${r.customer}</h3><p>${r.comment}</p><p><b>Produto:</b> ${r.product} • <b>Pedido:</b> ${r.order_number}</p><button class="btn blue" onclick="answerReview('${r.id}')">Responder</button><button class="btn light" onclick="recoveryCoupon('${r.id}')">Enviar cupom recuperação</button></div>`).join('')}</div>`}
function avgRating(){const r=state.data.reviews;return r.length?(r.reduce((s,x)=>s+x.rating,0)/r.length).toFixed(1):'0.0'}function answerReview(id){const txt=prompt('Resposta da loja:');if(txt){const r=state.data.reviews.find(x=>x.id===id);r.answered=true;r.answer=txt;saveAll();render()}}function recoveryCoupon(id){toast('Cupom de recuperação sugerido para o cliente.')}
function chatThreads(){
  const map=new Map();
  (state.data.chats||[]).forEach(m=>{
    const key=m.user_id||m.customer||'sem-cliente';
    if(!map.has(key))map.set(key,{key,user_id:m.user_id,customer:m.customer||'Cliente',order_number:m.order_number||'',phone:m.phone||'',messages:[],last:null,unread:0});
    const t=map.get(key);t.messages.push(m);t.last=m;if(m.sender==='customer'&&!m.read)t.unread++;
  });
  const arr=[...map.values()].map(t=>{t.messages.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));t.last=t.messages[t.messages.length-1];return t;}).sort((a,b)=>new Date(b.last?.created_at||0)-new Date(a.last?.created_at||0));
  if(!state.selectedChatUser&&arr.length)state.selectedChatUser=arr[0].key;
  return arr;
}
function selectedThread(){return chatThreads().find(t=>String(t.key)===String(state.selectedChatUser))||null}
function chatPage(){
  const threads=chatThreads();
  const thread=selectedThread();
  const query=(state.search||'').toLowerCase();
  const filtered=threads.filter(t=>!query||String(t.customer).toLowerCase().includes(query)||String(t.order_number).toLowerCase().includes(query)||String(t.last?.message||'').toLowerCase().includes(query));
  const quick=['Recebemos seu pedido e já vamos iniciar o preparo.','Seu pedido está em produção.','Seu pedido está sendo embalado.','Seu pedido saiu para entrega.','Tivemos um pequeno atraso, mas já estamos finalizando.','Você autoriza a substituição deste item?','Obrigada pelo feedback! 💙'];
  return `${title('Chat/Suporte','Conversas em tempo real com os clientes, no estilo WhatsApp.',`<button class="btn light" onclick="exportCSV('chats')">Exportar chat</button><button class="btn blue" onclick="manualChatRefresh()">Atualizar</button>`)}<div class="wa-shell ${thread?'chat-open':''}"><aside class="wa-list"><div class="wa-list-head"><h3 style="margin:0;font-size:22px;font-weight:950">Conversas</h3><div class="wa-search">🔎 <input placeholder="Buscar cliente, pedido ou mensagem" value="${escapeHtml(state.search||'')}" oninput="state.search=this.value;render()"></div></div><div class="wa-contact-list">${filtered.map(t=>chatContact(t)).join('')||'<div class="empty">Nenhuma conversa ainda. Quando o cliente mandar mensagem, aparece aqui.</div>'}</div></aside>${thread?`<section class="wa-chat"><div class="wa-chat-head"><div class="wa-chat-user"><button class="btn light mobile-back" style="display:none;padding:9px 11px" onclick="state.selectedChatUser=null;render()">←</button><div class="wa-avatar">${initials(thread.customer)}</div><div><h3>${escapeHtml(thread.customer)}</h3><p>${thread.order_number?`Pedido ${escapeHtml(thread.order_number)} • `:''}${thread.messages.length} mensagem(ns)</p></div></div><div class="toolbar"><button class="btn light" onclick="openChatWhatsApp()">WhatsApp</button><button class="btn light" onclick="markThreadRead('${escapeAttr(thread.key)}')">Marcar lida</button></div></div><div class="wa-messages" id="waMessages">${thread.messages.map(chatMessageBubble).join('')}</div><div class="wa-quick">${quick.map(q=>`<button onclick="document.getElementById('chatReply').value='${escapeAttr(q)}';sendGestaoChat()">${escapeHtml(q)}</button>`).join('')}</div><div class="wa-input"><textarea id="chatReply" placeholder="Digite uma mensagem para o cliente..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendGestaoChat()}"></textarea><button class="send" onclick="sendGestaoChat()">➤</button></div></section>`:`<section class="wa-chat"><div class="wa-empty"><div class="wa-avatar">💬</div><h3>Selecione uma conversa</h3><p style="color:#777;font-weight:800">As mensagens do cliente aparecem aqui, e suas respostas voltam para o app dele.</p></div></section>`}</div>`;
}
function chatContact(t){return `<button class="wa-contact ${String(state.selectedChatUser)===String(t.key)?'active':''}" onclick="selectChatThread('${escapeAttr(t.key)}')"><div class="wa-avatar">${initials(t.customer)}</div><div class="wa-contact-main"><strong>${escapeHtml(t.customer)}</strong><span>${escapeHtml(t.last?.message||'')}</span></div><div class="wa-contact-meta"><small>${fmtDate(t.last?.created_at||'')}</small>${t.unread?`<span class="unread">${t.unread}</span>`:''}</div></button>`}
function chatMessageBubble(m){const cls=m.sender==='customer'?'customer':(m.sender==='system'?'system':'store');const label=m.sender==='customer'?'Cliente':(m.sender==='system'?'Sistema':'Husky');return `<div class="wa-msg ${cls}">${escapeHtml(m.message)}<small>${label} • ${fmtDate(m.created_at)}</small></div>`}
function selectChatThread(key){state.selectedChatUser=key;markThreadRead(key,false);render();setTimeout(()=>{const box=document.getElementById('waMessages');if(box)box.scrollTop=box.scrollHeight;},50)}
async function sendGestaoChat(){
  const thread=selectedThread();const input=document.getElementById('chatReply');const msg=(input?.value||'').trim();if(!thread||!msg)return;
  if(!thread.user_id){toast('Conversa sem user_id. Não foi possível enviar ao cliente.');return;}
  const local={id:'tmp-'+Date.now(),user_id:thread.user_id,order_id:thread.messages[thread.messages.length-1]?.order_id||null,order_number:thread.order_number,customer:thread.customer,sender:'store',message:msg,created_at:new Date().toISOString(),read:true};
  state.data.chats.push(local); if(input)input.value=''; saveAll(); render();
  if(HAS_SUPABASE){
    const {data,error}=await db.from('chat_messages')
      .insert({user_id:thread.user_id,order_id:local.order_id,sender:'store',message:msg})
      .select('id,user_id,order_id,sender,message,created_at,read_at')
      .single();
    if(error){toast('Erro ao enviar no Supabase: '+error.message);return;}
    if(data){
      state.data.chats=state.data.chats.map(m=>m.id===local.id?{...local,id:data.id,created_at:data.created_at}:m);
      saveAll();
    }
    setTimeout(async()=>{await loadSupabaseChatData();render();},300);
  }
}
function markThreadRead(key,rerender=true){const t=chatThreads().find(x=>String(x.key)===String(key));if(!t)return;t.messages.filter(m=>m.sender==='customer'&&!m.read).forEach(m=>{m.read=true;if(HAS_SUPABASE&&m.id)updateSupabase('chat_messages',{read_at:new Date().toISOString()},m.id)});saveAll();if(rerender)render()}
async function manualChatRefresh(showToast=true){if(HAS_SUPABASE)await loadSupabaseChatData();render();if(showToast)toast('Chat atualizado')}
function openChatWhatsApp(){const t=selectedThread();if(!t)return;const cust=state.data.customers.find(c=>c.id===t.user_id||c.name===t.customer);const phone=String(cust?.phone||t.phone||'').replace(/\D/g,'');if(!phone){toast('Cliente sem telefone cadastrado.');return;}window.open(`https://wa.me/55${phone}?text=${encodeURIComponent('Olá! Aqui é da Husky Confeiteiro 💙')}`,'_blank')}
function initials(name){return String(name||'C').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'C'}
function escapeAttr(str){return String(str??'').replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
async function replyChat(id){state.selectedChatUser=(state.data.chats.find(x=>String(x.id)===String(id))||{}).user_id||state.selectedChatUser;render()}
function markChat(id){const m=state.data.chats.find(x=>String(x.id)===String(id));if(m)m.read=true;if(HAS_SUPABASE)updateSupabase('chat_messages',{read_at:new Date().toISOString()},id);saveAll();render()}

function genericCrud(titleText,desc,key,fields){const arr=state.data[key]||[];return `${title(titleText,desc,`<button class="btn blue" onclick="genericOpen('${key}')">Criar</button><button class="btn light" onclick="exportCSV('${key}')">Exportar</button>`)}<div class="table-wrap"><table class="table"><thead><tr>${fields.map(f=>`<th>${f.label}</th>`).join('')}<th>Ações</th></tr></thead><tbody>${arr.map(item=>`<tr>${fields.map(f=>`<td>${renderValue(item[f.name],f)}</td>`).join('')}<td><button class="btn light" onclick="genericOpen('${key}','${item.id}')">Editar</button><button class="btn red" onclick="genericDelete('${key}','${item.id}')">Excluir</button></td></tr>`).join('')}</tbody></table></div>`}
function renderValue(v,f){if(f.type==='money')return money(v);if(f.type==='bool')return `<span class="status ${v?'active':'closed'}">${v?'Sim':'Não'}</span>`;return v??''}
function genericOpen(key,id){const map={categories:categoryFields(),addons:addonFields(),coupons:couponFields(),expenses:expenseFields(),suppliers:supplierFields(),banners:bannerFields(),issues:issueFields(),refunds:refundFields()};const fields=map[key];const arr=state.data[key];const item=id?arr.find(x=>x.id===id):{id:newId()};document.getElementById('root').insertAdjacentHTML('beforeend',`<div class="modal"><div class="modal-box"><div class="modal-head"><h3>${id?'Editar':'Criar'}</h3><button class="btn light" onclick="render()">Fechar</button></div><div class="modal-body"><div class="form-grid">${fields.map(f=>`<div class="field ${f.wide?'wide':''}"><label>${f.label}</label>${f.type==='textarea'?`<textarea id="gf_${f.name}">${item[f.name]||''}</textarea>`:f.type==='bool'?`<select id="gf_${f.name}"><option value="true" ${item[f.name]?'selected':''}>Sim</option><option value="false" ${!item[f.name]?'selected':''}>Não</option></select>`:`<input id="gf_${f.name}" value="${item[f.name]??''}">`}</div>`).join('')}</div><button class="btn blue" onclick="genericSave('${key}','${item.id}',${!id})">Salvar</button></div></div></div>`)}
async function genericSave(key,id,isNew){
  const map={categories:categoryFields(),addons:addonFields(),coupons:couponFields(),expenses:expenseFields(),suppliers:supplierFields(),banners:bannerFields(),issues:issueFields(),refunds:refundFields()};
  const fields=map[key];
  const arr=state.data[key];
  const item=isNew?{id}:arr.find(x=>x.id===id);
  fields.forEach(f=>{
    let val=document.getElementById('gf_'+f.name).value;
    if(f.type==='number'||f.type==='money')val=Number(val||0);
    if(f.type==='bool')val=val==='true';
    item[f.name]=val;
  });
  if(isNew)arr.unshift(item);
  audit(key+'_save',id);
  saveAll();
  const ok=await syncGenericToSupabase(key,item);
  if(ok){await loadSupabaseData();}
  render();
}
async function syncGenericToSupabase(key,item){
  if(!HAS_SUPABASE) return true;
  const tableMap={categories:'product_categories',addons:'product_addons',coupons:'coupons',expenses:'expenses',suppliers:'suppliers',banners:'banners',issues:'internal_tickets',refunds:'refunds'};
  const table=tableMap[key];
  if(!table) return true;
  let payload={};
  let options={};
  if(isUuid(item.id)) payload.id=item.id;
  if(key==='categories') payload={...payload,name:item.name,sort_order:Number(item.sort||0),active:item.active,schedule:{label:item.schedule||''}};
  if(key==='coupons'){
    const code=String(item.code||'').trim().toUpperCase();
    if(!code){toast('Informe o código do cupom.');return false;}
    payload={...payload,code,title:item.title||code,description:item.description||'',discount_type:item.type||'value',discount_value:Number(item.value||0),min_subtotal:Number(item.min_subtotal||0),min_items:Number(item.min_items||0),max_uses:Number(item.max_uses||0),active:item.active!==false,first_purchase_only:!!item.first_purchase,free_delivery:(item.type==='free_delivery')};
    options={onConflict:'code'};
  }
  if(key==='addons') payload={...payload,group_name:item.group,name:item.name,price:Number(item.price||0),stock:Number(item.stock||0),required:item.required,active:item.active};
  if(key==='banners') payload={...payload,title:item.title,image_url:item.image,link_type:item.link_type,link_value:item.link_value,sort_order:Number(item.sort||0),active:item.active};
  if(key==='expenses') payload={...payload,name:item.name,category:item.category,value:Number(item.value||0),date:item.date,payment_method:item.payment_method,quantity:Number(item.quantity||0),supplier:item.supplier,note:item.note};
  if(key==='suppliers') payload={...payload,name:item.name,phone:item.phone,email:item.email,product:item.product,avg_value:Number(item.avg_value||0),active:item.active};
  if(key==='issues') payload={...payload,order_number:item.order_number,customer:item.customer,type:item.type,priority:item.priority,responsible:item.responsible,status:item.status,note:item.note};
  if(key==='refunds') payload={...payload,order_number:item.order_number,customer:item.customer,value:Number(item.value||0),type:item.type,status:item.status,reason:item.reason,approved_by:item.approved_by};
  return await upsertSupabase(table,payload,options);
}
function genericDelete(key,id){if(confirm('Excluir item?')){state.data[key]=state.data[key].filter(x=>x.id!==id);audit(`${key}_delete`,id);saveAll();render()}}
function categoryFields(){return [{name:'name',label:'Nome'},{name:'sort',label:'Ordem',type:'number'},{name:'schedule',label:'Horário'},{name:'active',label:'Ativo',type:'bool'}]}
function addonFields(){return [{name:'group',label:'Grupo'},{name:'name',label:'Nome'},{name:'price',label:'Preço',type:'money'},{name:'stock',label:'Estoque',type:'number'},{name:'required',label:'Obrigatório',type:'bool'},{name:'active',label:'Ativo',type:'bool'}]}
function couponFields(){return [{name:'code',label:'Código'},{name:'title',label:'Nome'},{name:'type',label:'Tipo'},{name:'value',label:'Valor',type:'number'},{name:'min_subtotal',label:'Mínimo',type:'money'},{name:'max_uses',label:'Limite',type:'number'},{name:'used',label:'Usado',type:'number'},{name:'active',label:'Ativo',type:'bool'}]}
function expenseFields(){return [{name:'name',label:'Despesa'},{name:'category',label:'Categoria'},{name:'value',label:'Valor',type:'money'},{name:'date',label:'Data'},{name:'payment_method',label:'Pagamento'},{name:'quantity',label:'Qtd',type:'number'},{name:'supplier',label:'Fornecedor'},{name:'note',label:'Obs',type:'textarea',wide:true}]}
function supplierFields(){return [{name:'name',label:'Nome'},{name:'phone',label:'Telefone'},{name:'email',label:'E-mail'},{name:'product',label:'Produto'},{name:'avg_value',label:'Valor médio',type:'money'},{name:'active',label:'Ativo',type:'bool'}]}
function bannerFields(){return [{name:'title',label:'Título'},{name:'image',label:'Imagem'},{name:'link_type',label:'Tipo link'},{name:'link_value',label:'Valor link'},{name:'sort',label:'Ordem',type:'number'},{name:'active',label:'Ativo',type:'bool'}]}
function issueFields(){return [{name:'order_number',label:'Pedido'},{name:'customer',label:'Cliente'},{name:'type',label:'Tipo'},{name:'priority',label:'Prioridade'},{name:'responsible',label:'Responsável'},{name:'status',label:'Status'},{name:'note',label:'Observação',type:'textarea',wide:true}]}
function refundFields(){return [{name:'order_number',label:'Pedido'},{name:'customer',label:'Cliente'},{name:'value',label:'Valor',type:'money'},{name:'type',label:'Tipo'},{name:'status',label:'Status'},{name:'reason',label:'Motivo',type:'textarea',wide:true},{name:'approved_by',label:'Aprovado por'}]}

function notificationsPage(){return `${title('Notificações','Central de alertas de pedido, estoque, pagamento e avaliação.',`<button class="btn light" onclick="state.data.notifications.forEach(n=>n.read=true);saveAll();render()">Marcar tudo como lido</button>`)}<div class="grid cols-2">${state.data.notifications.map(n=>`<div class="card"><span class="status ${n.read?'info':'warning'}">${n.type}</span><h3>${n.title}</h3><p>${n.text}</p><small>${fmtDate(n.created_at)}</small><br><button class="btn light" onclick="markNotification('${n.id}')">${n.read?'Lida':'Marcar lida'}</button></div>`).join('')}</div>`}
function markNotification(id){const n=state.data.notifications.find(x=>String(x.id)===String(id));if(n)n.read=true;saveAll();render()}
function auditPage(){return `${title('Auditoria','Histórico de ações: quem alterou, quando e o quê.',`<button class="btn light" onclick="exportCSV('audit')">Exportar auditoria</button>`)}<div class="table-wrap"><table class="table"><thead><tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Detalhes</th></tr></thead><tbody>${state.data.audit.map(a=>`<tr><td>${fmtDate(a.created_at)}</td><td>${a.user}</td><td>${a.action}</td><td>${a.details}</td></tr>`).join('')}</tbody></table></div>`}
function usersPage(){return `${title('Usuários e permissões','Administrador, operador, produção, entregador e financeiro.',`<button class="btn blue" onclick="genericOpenUser()">Criar usuário</button>`)}<div class="table-wrap"><table class="table"><thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Ativo</th><th>Permissões</th><th>Último acesso</th><th>Ações</th></tr></thead><tbody>${state.data.users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.active?'Sim':'Não'}</td><td>${(u.permissions||[]).join(', ')}</td><td>${u.last_access}</td><td><button class="btn light" onclick="toast('Editar usuário em breve')">Editar</button></td></tr>`).join('')}</tbody></table></div>`}
function genericOpenUser(){const email=prompt('E-mail do novo usuário:');if(!email)return;state.data.users.unshift({id:Date.now(),name:email.split('@')[0],email,role:'operator',active:true,last_access:'',permissions:['orders','chat']});audit('user_create',email);saveAll();render()}
function manualOrdersPage(){return `${title('Pedidos manuais','Registre WhatsApp, Instagram, presencial, iFood e eventos.',`<button class="btn blue" onclick="createManualOrder()">Criar pedido manual</button>`)}<div class="card"><p>Use esta área para registrar vendas que não vieram pelo app, mantendo relatórios e estoque corretos.</p></div><div class="table-wrap" style="margin-top:16px"><table class="table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Canal</th><th>Total</th><th>Status</th></tr></thead><tbody>${state.data.manualOrders.map(o=>`<tr><td>${o.order_number}</td><td>${o.customer_name}</td><td>${o.channel}</td><td>${money(o.total)}</td><td>${o.status}</td></tr>`).join('')}</tbody></table></div>`}
function createManualOrder(){const name=prompt('Nome do cliente:');if(!name)return;const total=Number(prompt('Valor total:',18));const o={id:Date.now(),order_number:'MAN-'+Date.now().toString().slice(-5),customer_name:name,channel:'Manual',total,status:'paid',created_at:new Date().toISOString()};state.data.manualOrders.unshift(o);state.data.orders.unshift({...o,payment_status:'approved',payment_method:'Manual',fulfillment:'pickup',subtotal:total,delivery_fee:0,discount:0,items:[{product_name:'Pedido manual',quantity:1,unit_price:total,total}],history:[{time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),text:'Pedido manual criado'}]});saveAll();render()}
function channelsPage(){return `${title('Canais de venda','Acompanhe vendas por App, WhatsApp, Instagram, iFood, presencial e manual.')}<div class="grid cols-3">${state.data.channels.map(ch=>{const total=state.data.orders.filter(o=>o.channel===ch).reduce((s,o)=>s+o.total,0);return `<div class="metric"><small>${ch}</small><strong>${money(total)}</strong><span>${state.data.orders.filter(o=>o.channel===ch).length} pedidos</span></div>`}).join('')}</div>`}
function schedulePage(){return `${title('Pedidos agendados','Agenda por dia, horário, capacidade, entregas e retiradas.')}<div class="card"><h3>Agenda da semana</h3><p>Pedidos agendados aparecerão aqui por horário. Configure capacidade em Loja/Horários.</p></div>`}
function loyaltyPage(){const l=state.data.loyalty;return `${title('Programa de fidelidade','Pontos, carimbo virtual, cliente VIP e cupom de aniversário.')}<div class="card"><label class="pill"><input type="checkbox" ${l.enabled?'checked':''} onchange="state.data.loyalty.enabled=this.checked;saveAll()"> Ativar fidelidade</label><div class="field"><label>Regra</label><input value="${l.rule}" onchange="state.data.loyalty.rule=this.value;saveAll()"></div><div class="field"><label>Carimbos necessários</label><input value="${l.reward_threshold}" onchange="state.data.loyalty.reward_threshold=Number(this.value);saveAll()"></div></div>`}
function reportsPage(){return `${title('Relatórios','Vendas, produtos, clientes, operação, financeiro e estoque.',`<button class="btn light" onclick="exportCSV('orders')">Exportar pedidos</button><button class="btn light" onclick="exportCSV('products')">Exportar produtos</button>`)}<div class="charts"><div class="card"><h3>Vendas por produto</h3>${bestProducts()}</div><div class="card"><h3>Operação</h3><p><b>Tempo médio de aceite:</b> 3 min</p><p><b>Tempo médio de produção:</b> 22 min</p><p><b>Pedidos atrasados:</b> ${state.data.orders.filter(o=>o.status!=='done'&&(Date.now()-new Date(o.created_at)>30*60000)).length}</p><p><b>Cancelamentos:</b> ${state.data.orders.filter(o=>o.status==='cancelled').length}</p></div></div><div class="grid cols-4" style="margin-top:16px"><div class="metric"><small>Clientes novos</small><strong>${state.data.customers.length}</strong></div><div class="metric"><small>Produtos esgotados</small><strong>${state.data.products.filter(p=>!p.available).length}</strong></div><div class="metric"><small>Cupons ativos</small><strong>${state.data.coupons.filter(c=>c.active).length}</strong></div><div class="metric"><small>Avaliações</small><strong>${avgRating()}</strong></div></div>`}
function settingsPage(){const s=state.data.settings;return `${title('Configurações','Dados da loja, aparência, políticas, Pix, entrega e segurança.')}<div class="grid cols-2"><div class="card"><h3>Dados da loja</h3>${['store_name','description','phone','whatsapp','email','cnpj','address'].map(k=>`<div class="field"><label>${k}</label><input id="set_${k}" value="${s[k]||''}"></div>`).join('')}<button class="btn blue" onclick="saveSettings()">Salvar</button></div><div class="card"><h3>Aparência e app do cliente</h3><p><b>Cores:</b> azul, bege, branco.</p><p><b>Mascote:</b> Husky 3D.</p><p><b>Pix:</b> ${APP_CONFIG.pixKey}</p><button class="btn light" onclick="toast('No app cliente, essas configurações vêm do Supabase/store_settings.')">Sincronizar cliente</button></div><div class="card"><h3>Políticas</h3><div class="field"><label>Entrega</label><textarea id="set_delivery_policy">${s.delivery_policy||''}</textarea></div><div class="field"><label>Cancelamento</label><textarea id="set_cancel_policy">${s.cancel_policy||''}</textarea></div><button class="btn blue" onclick="savePolicies()">Salvar políticas</button></div><div class="card"><h3>Segurança</h3><p>Login separado da gestão, permissões por cargo, auditoria e bloqueio de cliente.</p><p>Chaves secretas nunca ficam no front-end. Pagamento real precisa de webhook.</p></div></div>`}
function saveSettings(){['store_name','description','phone','whatsapp','email','cnpj','address'].forEach(k=>state.data.settings[k]=document.getElementById('set_'+k).value);saveAll();if(HAS_SUPABASE){upsertSupabase('store_settings',{key:'store',value:{name:state.data.settings.store_name,description:state.data.settings.description,phone:state.data.settings.phone,whatsapp:state.data.settings.whatsapp,email:state.data.settings.email,cnpj:state.data.settings.cnpj,address:state.data.settings.address,open:state.storeOpen,delivery_fee:state.data.settings.delivery_fee,free_delivery_from:state.data.settings.free_delivery_from,minimum_order:state.data.settings.min_order}})}toast('Configurações salvas')}function savePolicies(){state.data.settings.delivery_policy=document.getElementById('set_delivery_policy').value;state.data.settings.cancel_policy=document.getElementById('set_cancel_policy').value;saveAll();toast('Políticas salvas')}
function exportPage(){return `${title('Exportação','Baixe CSV de pedidos, clientes, vendas, estoque, financeiro e avaliações.')}<div class="grid cols-3">${['orders','products','customers','coupons','reviews','expenses','audit'].map(k=>`<button class="btn light" onclick="exportCSV('${k}')">Exportar ${k}</button>`).join('')}</div>`}
function exportCSV(key){const data=state.data[key]||[];if(!data.length){toast('Nada para exportar');return}const rows=[Object.keys(data[0]).join(',')].concat(data.map(o=>Object.values(o).map(v=>`"${String(typeof v==='object'?JSON.stringify(v):v).replace(/"/g,'""')}"`).join(',')));const blob=new Blob([rows.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`husky_${key}.csv`;a.click();URL.revokeObjectURL(a.href)}
function beep(){try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.value=.05;o.start();setTimeout(()=>{o.stop();ctx.close()},180)}catch(e){}}


/* ===== PATCH GESTÃO VELOCIDADE + BOTÕES + SINCRONIA ===== */
let __gestaoSyncRunning=false;
let __gestaoChatSnap='';
function mapCouponFromDb(c){return {id:c.id,code:c.code,title:c.title,type:c.discount_type||'value',value:Number(c.discount_value||0),min_subtotal:Number(c.min_subtotal||0),min_items:Number(c.min_items||0),active:c.active!==false,starts_at:c.starts_at||'',expires_at:c.expires_at||'',max_uses:c.max_uses||0,used:c.used_count||0,first_purchase:c.first_purchase_only||false,description:c.description||'',products:[],clients:[]}}
async function loadSupabaseCouponsOnly(){
  if(!HAS_SUPABASE || !state.user) return;
  const couponsData=await safeTable('coupons', db.from('coupons').select('*').order('updated_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false}));
  state.data.coupons=(couponsData||[]).map(mapCouponFromDb);
  saveAll();
}
async function loadSupabaseChatData(){
  if(!HAS_SUPABASE || !state.user) return;
  try{
    const [chatsData, profilesData, ordersData] = await Promise.all([
      safeTable('chat_messages', db.from('chat_messages').select('id,user_id,order_id,sender,message,created_at,read_at').order('created_at',{ascending:false}).limit(700)),
      safeTable('profiles', db.from('profiles').select('id,name,email,phone,address')),
      safeTable('customer_orders', db.from('customer_orders').select('id,order_number,user_id,customer_name,customer_email,customer_phone').order('created_at',{ascending:false}).limit(300))
    ]);
    const snap=JSON.stringify((chatsData||[]).map(m=>[m.id,m.sender,m.message,m.read_at]));
    if(snap===__gestaoChatSnap && state.data.chats.length) return;
    __gestaoChatSnap=snap;
    const profileById = new Map((profilesData||[]).map(p=>[String(p.id),p]));
    const orderById = new Map((ordersData||[]).map(o=>[String(o.id),o]));
    state.data.chats=(chatsData||[]).map(m=>{
      const prof=profileById.get(String(m.user_id))||{};
      const ord=m.order_id?orderById.get(String(m.order_id)):null;
      return {id:m.id,user_id:m.user_id,order_id:m.order_id,order_number:ord?.order_number||'',customer:prof.name||ord?.customer_name||prof.email||ord?.customer_email||('Cliente '+String(m.user_id||'').slice(0,6)),phone:prof.phone||ord?.customer_phone||'',sender:m.sender,message:m.message,created_at:m.created_at,read:!!m.read_at};
    });
    saveAll();
  }catch(e){console.warn('Chat gestão:',e.message);}
}
function setupGestaoRealtime(){
  if(!HAS_SUPABASE||!state.user) return;
  [state.chatChannel,state.ordersChannel,state.productsChannel,state.catalogChannel].filter(Boolean).forEach(ch=>{try{db.removeChannel(ch)}catch(e){}});
  state.chatChannel=db.channel('gestao-chat-fast')
    .on('postgres_changes',{event:'*',schema:'public',table:'chat_messages'},async()=>{await loadSupabaseChatData();if(state.route==='chat')render();})
    .subscribe(status=>console.log('gestão chat realtime',status));
  state.ordersChannel=db.channel('gestao-orders-fast')
    .on('postgres_changes',{event:'*',schema:'public',table:'customer_orders'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  state.productsChannel=db.channel('gestao-products-fast')
    .on('postgres_changes',{event:'*',schema:'public',table:'products'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  state.catalogChannel=db.channel('gestao-catalog-fast')
    .on('postgres_changes',{event:'*',schema:'public',table:'coupons'},async()=>{await loadSupabaseCouponsOnly();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'product_categories'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'product_addons'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'banners'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'store_settings'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  if(state.refreshTimer) clearInterval(state.refreshTimer);
  state.refreshTimer=setInterval(async()=>{
    if(__gestaoSyncRunning) return;
    __gestaoSyncRunning=true;
    try{
      if(state.route==='chat') { await loadSupabaseChatData(); render(); }
      else if(state.route==='coupons') { await loadSupabaseCouponsOnly(); render(); }
      else if(['products','dashboard','orders','store','banners','categories','addons'].includes(state.route)) { await loadSupabaseData(); render(); }
    }catch(e){console.warn('refresh gestão rápido',e.message)}
    finally{__gestaoSyncRunning=false;}
  },1500);
}
async function genericDelete(key,id){
  if(!confirm('Excluir item?')) return;
  const tableMap={categories:'product_categories',addons:'product_addons',coupons:'coupons',expenses:'expenses',suppliers:'suppliers',banners:'banners',issues:'internal_tickets',refunds:'refunds'};
  const table=tableMap[key];
  const item=(state.data[key]||[]).find(x=>String(x.id)===String(id));
  state.data[key]=state.data[key].filter(x=>String(x.id)!==String(id));
  audit(key+'_delete',id); saveAll(); render();
  if(HAS_SUPABASE && table && item && isUuid(item.id)){
    const {error}=await db.from(table).delete().eq('id',item.id);
    if(error) toast('Erro ao excluir no Supabase: '+error.message);
  }
}
async function saveProduct(id,isNew){
  const p=isNew?{id:(isUuid(id)?id:newId())}:state.data.products.find(x=>x.id===id);
  ['name','category','price','cost','stock','min_stock','image_url','tag','sku','description','details','ingredients','allergens'].forEach(k=>p[k]=document.getElementById('pf_'+k)?.value||'');
  ['price','cost','stock','min_stock'].forEach(k=>p[k]=Number(p[k]||0));
  p.available=document.getElementById('pf_available').checked;
  p.visible_on_client=document.getElementById('pf_visible').checked;
  p.featured=document.getElementById('pf_featured').checked;
  if(isNew) state.data.products.unshift(p);
  audit('product_save',p.name); saveAll(); render();
  const slug=String(p.slug||p.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  await upsertSupabase('products',{id:p.id,name:p.name,slug,category:p.category,description:p.description,details:p.details,ingredients:p.ingredients,allergens:p.allergens,image_url:p.image_url,price:p.price,cost_estimate:p.cost,stock:p.stock,min_stock:p.min_stock,tag:p.tag,sku:p.sku,active:true,available:p.available,visible_on_client:p.visible_on_client,featured:p.featured,updated_at:new Date().toISOString()});
  await loadSupabaseData(); render(); toast('Produto salvo e enviado ao cliente.');
}
async function toggleProduct(id){
  const p=state.data.products.find(x=>String(x.id)===String(id)); if(!p) return;
  p.available=!p.available; if(p.available&&Number(p.stock||0)===0)p.stock=1;
  audit('product_toggle',p.name+': '+p.available); saveAll(); render();
  await updateSupabase('products',{available:p.available,stock:p.stock,updated_at:new Date().toISOString()},p.id);
}
async function adjustStock(id){
  const p=state.data.products.find(x=>String(x.id)===String(id)); if(!p){toast('Produto não encontrado.');return;}
  const q=Number(prompt('Novo estoque para '+p.name+':',p.stock));
  if(Number.isFinite(q)){p.stock=q;p.available=q>0;state.data.notifications.unshift({id:Date.now(),type:'stock',title:'Estoque alterado',text:p.name+': '+q,read:false,created_at:new Date().toISOString()});audit('stock_adjust',p.name+': '+q);saveAll();render();await updateSupabase('products',{stock:p.stock,available:p.available,updated_at:new Date().toISOString()},p.id)}
}
function syncClient(){loadSupabaseData().then(()=>{render();toast('Cliente sincronizado. Alterações publicadas no Supabase.');});}
async function saveHours(){state.data.settings.hours.saturday=document.getElementById('hSat').value;state.data.settings.hours.sunday=document.getElementById('hSun').value;state.data.settings.capacity=Number(document.getElementById('capacity').value);saveAll();await saveStoreSettingsFast();toast('Horários salvos e enviados ao cliente')}
async function saveDeliverySettings(){state.data.settings.delivery_fee=Number(document.getElementById('deliveryFee').value);state.data.settings.free_delivery_from=Number(document.getElementById('freeFrom').value);state.data.settings.delivery_area=document.getElementById('deliveryArea').value;saveAll();await saveStoreSettingsFast();toast('Entrega salva e enviada ao cliente')}
async function pauseStore(){state.storeOpen=false;state.data.settings.pause_reason=document.getElementById('pauseReason').value;saveAll();await saveStoreSettingsFast();render()}
async function toggleStore(){state.storeOpen=!state.storeOpen;state.data.notifications.unshift({id:Date.now(),type:'store',title:state.storeOpen?'Loja aberta':'Loja fechada',text:'Status alterado pela gestão',read:false,created_at:new Date().toISOString()});audit('store_status',state.storeOpen?'Aberta':'Fechada');saveAll();await saveStoreSettingsFast();render()}
async function saveStoreSettingsFast(){
  if(!HAS_SUPABASE) return;
  await upsertSupabase('store_settings',{key:'store',value:{name:state.data.settings.store_name,description:state.data.settings.description,phone:state.data.settings.phone,whatsapp:state.data.settings.whatsapp,email:state.data.settings.email,cnpj:state.data.settings.cnpj,address:state.data.settings.address,open:state.storeOpen,paused:!state.storeOpen,pause_reason:state.data.settings.pause_reason||'',delivery_fee:state.data.settings.delivery_fee,free_delivery_from:state.data.settings.free_delivery_from,minimum_order:state.data.settings.min_order,hours:state.data.settings.hours,capacity:state.data.settings.capacity,updated_at:new Date().toISOString()}});
}
async function saveSettings(){['store_name','description','phone','whatsapp','email','cnpj','address'].forEach(k=>state.data.settings[k]=document.getElementById('set_'+k).value);saveAll();await saveStoreSettingsFast();toast('Configurações salvas e enviadas ao cliente')}
async function savePolicies(){state.data.settings.delivery_policy=document.getElementById('set_delivery_policy').value;state.data.settings.cancel_policy=document.getElementById('set_cancel_policy').value;saveAll();await saveStoreSettingsFast();toast('Políticas salvas')}
/* ===== FIM PATCH GESTÃO ===== */

/* ===== AJUSTE FINAL: PEDIDOS MANUAIS + CHAT INSTANTÂNEO + POPUP ===== */
let __huskyGestaoChatReady = false;
let __huskyGestaoSeenChatIds = new Set((state.data.chats || []).map(m => String(m.id)));
let __huskyGestaoLastChatSnap = "";
function preserveChatDraftAndRender(){
  const draft = document.getElementById('chatReply')?.value || '';
  render();
  const input = document.getElementById('chatReply');
  if (input && draft && !input.value) input.value = draft;
  const box = document.getElementById('waMessages');
  if (box) box.scrollTop = box.scrollHeight;
}
function chatPopupContainer(){
  let box = document.getElementById('chatPopupContainer');
  if (!box) {
    box = document.createElement('div');
    box.id = 'chatPopupContainer';
    box.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:9999;display:grid;gap:10px;width:min(360px,calc(100vw - 36px));pointer-events:none;';
    document.body.appendChild(box);
  }
  return box;
}
function showChatPopup(customer, message, key){
  const box = chatPopupContainer();
  const item = document.createElement('button');
  item.type = 'button';
  item.style.cssText = 'pointer-events:auto;text-align:left;border:0;border-radius:22px;background:#171717;color:#fff;padding:14px 16px;box-shadow:0 18px 45px rgba(0,0,0,.25);font-weight:900;cursor:pointer;animation:chatPop .18s ease-out;';
  item.innerHTML = '<div style="display:flex;gap:10px;align-items:flex-start"><div style="width:42px;height:42px;border-radius:14px;background:#3b6da6;display:grid;place-items:center;flex:0 0 auto">💬</div><div style="min-width:0"><div style="font-size:13px;color:#edd8ab;text-transform:uppercase;letter-spacing:.05em">Nova mensagem</div><div style="font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(customer || 'Cliente')+'</div><div style="font-size:13px;color:rgba(255,255,255,.78);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(message || '')+'</div></div></div>';
  item.onclick = () => { state.route = 'chat'; state.selectedChatUser = key; item.remove(); preserveChatDraftAndRender(); };
  box.appendChild(item);
  setTimeout(() => item.remove(), 9000);
}
(function injectChatPopupStyle(){
  if(document.getElementById('chatPopupStyle')) return;
  const st=document.createElement('style'); st.id='chatPopupStyle';
  st.textContent='@keyframes chatPop{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}';
  document.head.appendChild(st);
})();

const __baseLoadSupabaseDataFinal = loadSupabaseData;
loadSupabaseData = async function(){
  const localManualOrders = (state.data.orders || []).filter(o => o && (o._localOnly || (!isUuid(o.id) && String(o.order_number || '').startsWith('MAN-'))));
  await __baseLoadSupabaseDataFinal();
  const existingNumbers = new Set((state.data.orders || []).map(o => String(o.order_number || '')));
  localManualOrders.forEach(o => { if (!existingNumbers.has(String(o.order_number || ''))) state.data.orders.unshift(o); });
  state.data.manualOrders = (state.data.orders || [])
    .filter(o => String(o.channel || '').toLowerCase() === 'manual' || String(o.order_number || '').startsWith('MAN-'))
    .map(o => ({ id:o.id, order_number:o.order_number, customer_name:o.customer_name, channel:o.channel || 'Manual', total:Number(o.total||0), status:o.status || 'paid', created_at:o.created_at }));
  saveAll();
};

loadSupabaseChatData = async function(forceRender=false){
  if(!HAS_SUPABASE || !state.user) return;
  try{
    const [chatsData, profilesData, ordersData] = await Promise.all([
      safeTable('chat_messages', db.from('chat_messages').select('id,user_id,order_id,sender,message,created_at,read_at').order('created_at',{ascending:false}).limit(500)),
      safeTable('profiles', db.from('profiles').select('id,name,email,phone,address')),
      safeTable('customer_orders', db.from('customer_orders').select('id,order_number,user_id,customer_name,customer_email,customer_phone').order('created_at',{ascending:false}).limit(250))
    ]);
    const profileById = new Map((profilesData||[]).map(p=>[String(p.id),p]));
    const orderById = new Map((ordersData||[]).map(o=>[String(o.id),o]));
    const normalized=(chatsData||[]).map(m=>{
      const prof=profileById.get(String(m.user_id))||{};
      const ord=m.order_id?orderById.get(String(m.order_id)):null;
      return {id:m.id,user_id:m.user_id,order_id:m.order_id,order_number:ord?.order_number||'',customer:prof.name||ord?.customer_name||prof.email||ord?.customer_email||('Cliente '+String(m.user_id||'').slice(0,6)),phone:prof.phone||ord?.customer_phone||'',sender:m.sender,message:m.message,created_at:m.created_at,read:!!m.read_at};
    });
    const snap = JSON.stringify(normalized.map(m=>[m.id,m.sender,m.message,m.read,m.created_at]));
    if(snap === __huskyGestaoLastChatSnap && !forceRender) return;
    const previousSeen = new Set(__huskyGestaoSeenChatIds);
    __huskyGestaoLastChatSnap = snap;
    state.data.chats = normalized;
    normalized.forEach(m => {
      const key = String(m.id);
      if (__huskyGestaoChatReady && !previousSeen.has(key) && m.sender === 'customer') {
        const threadKey = m.user_id ? String(m.user_id) : (m.order_id ? 'order-'+m.order_id : 'guest-'+m.customer);
        showChatPopup(m.customer, m.message, threadKey);
        if(state.soundOn) beep();
      }
      __huskyGestaoSeenChatIds.add(key);
    });
    __huskyGestaoChatReady = true;
    saveAll();
    if(forceRender) preserveChatDraftAndRender();
  }catch(e){ console.warn('Chat gestão final:', e.message); }
};

setupGestaoRealtime = function(){
  if(!HAS_SUPABASE||!state.user) return;
  [state.chatChannel,state.ordersChannel,state.productsChannel,state.catalogChannel].filter(Boolean).forEach(ch=>{try{db.removeChannel(ch)}catch(e){}});
  state.chatChannel=db.channel('gestao-chat-instant-'+state.user.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'chat_messages'},()=>loadSupabaseChatData(true))
    .subscribe();
  state.ordersChannel=db.channel('gestao-orders-instant-'+state.user.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'customer_orders'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'order_items'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  state.catalogChannel=db.channel('gestao-catalog-instant-'+state.user.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'coupons'},async()=>{await loadSupabaseCouponsOnly();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'products'},async()=>{await loadSupabaseData();render();})
    .on('postgres_changes',{event:'*',schema:'public',table:'store_settings'},async()=>{await loadSupabaseData();render();})
    .subscribe();
  if(state.refreshTimer) clearInterval(state.refreshTimer);
  state.refreshTimer=setInterval(async()=>{
    try{
      await loadSupabaseChatData(state.route==='chat');
      if(state.route==='orders' || state.route==='manual' || state.route==='dashboard') { await loadSupabaseData(); render(); }
    }catch(e){console.warn('polling final',e.message)}
  }, 650);
};

createManualOrder = async function(){
  const name = prompt('Nome do cliente:'); if(!name) return;
  const phone = prompt('WhatsApp do cliente, opcional:', '') || '';
  const itemName = prompt('Produto/descrição do pedido:', 'Pedido manual') || 'Pedido manual';
  const total = Number(prompt('Valor total:', 18)); if(!Number.isFinite(total) || total <= 0){toast('Valor inválido.'); return;}
  const orderNumber = 'MAN-' + Date.now().toString().slice(-6);
  const localId = 'manual-local-' + Date.now();
  const createdAt = new Date().toISOString();
  const localOrder = {id:localId,_localOnly:true,order_number:orderNumber,created_at:createdAt,customer_name:name,customer_email:'',customer_phone:phone,status:'paid',payment_status:'approved',payment_method:'Manual',payment_gateway_id:'manual',fulfillment:'pickup',channel:'Manual',subtotal:total,delivery_fee:0,discount:0,total,coupon_code:'',address:null,items:[{product_id:null,product_name:itemName,quantity:1,unit_price:total,total,observation:'Pedido criado manualmente',addons:[]}],history:[{time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),text:'Pedido manual criado pela gestão'}]};
  state.data.orders.unshift(localOrder);
  state.data.manualOrders.unshift({id:localId,order_number:orderNumber,customer_name:name,channel:'Manual',total,status:'paid',created_at:createdAt});
  saveAll(); render(); toast('Pedido manual criado. Salvando no Supabase...');
  if(HAS_SUPABASE){
    try{
      const orderId = newId();
      const payload = {id:orderId,order_number:orderNumber,status:'paid',payment_status:'approved',payment_method:'Manual',fulfillment:'pickup',channel:'Manual',subtotal:total,delivery_fee:0,discount:0,total,coupon_code:null,customer_name:name,customer_email:null,customer_phone:phone,address_snapshot:{manual:true,created_by:state.user.email},internal_notes:'Pedido manual criado pela gestão',created_at:createdAt,updated_at:new Date().toISOString()};
      const {data,error}=await db.from('customer_orders').insert(payload).select('*').single();
      if(error) throw error;
      const {error:itemError}=await db.from('order_items').insert({order_id:orderId,product_id:null,product_name:itemName,quantity:1,unit_price:total,observation:'Pedido manual',total});
      if(itemError) throw itemError;
      state.data.orders = state.data.orders.map(o => o.id===localId ? {...localOrder,...data,id:orderId,_localOnly:false,items:localOrder.items,order_items:localOrder.items} : o);
      state.data.manualOrders = state.data.manualOrders.map(o => o.id===localId ? {...o,id:orderId} : o);
      audit('manual_order_create',orderNumber);
      saveAll();
      await loadSupabaseData();
      render();
      toast('Pedido manual salvo e fixado na gestão.');
    }catch(e){
      console.warn('Erro ao salvar pedido manual:', e.message);
      toast('Pedido ficou salvo localmente. Erro Supabase: '+e.message);
    }
  }
};

manualOrdersPage = function(){return `${title('Pedidos manuais','Registre WhatsApp, Instagram, presencial, iFood e eventos.',`<button class="btn blue" onclick="createManualOrder()">Criar pedido manual</button><button class="btn light" onclick="loadSupabaseData().then(()=>render())">Atualizar</button>`)}<div class="card"><p>Pedidos manuais agora são salvos também em customer_orders, então não somem ao atualizar.</p></div><div class="table-wrap" style="margin-top:16px"><table class="table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Canal</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead><tbody>${(state.data.manualOrders||[]).map(o=>`<tr><td>${escapeHtml(o.order_number)}</td><td>${escapeHtml(o.customer_name||'')}</td><td>${escapeHtml(o.channel||'Manual')}</td><td>${money(o.total)}</td><td>${escapeHtml(statusLabel(o.status||'paid'))}</td><td><button class="btn light" onclick="openOrder('${escapeAttr(o.id)}')">Detalhes</button></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Nenhum pedido manual.</div></td></tr>'}</tbody></table></div>`};
/* ===== FIM AJUSTE FINAL ===== */

(async function bootGestao(){
  // Segurança: quando o Supabase está configurado, a gestão NUNCA confia só no localStorage.
  // Ela valida a sessão separada da gestão e confirma se o usuário existe em admin_users.
  if (HAS_SUPABASE && db) {
    try {
      const { data } = await db.auth.getSession();
      const sessionUser = data?.session?.user || null;

      if (!sessionUser) {
        state.user = null;
        localStorage.removeItem("husky_admin_user");
        renderLogin();
        return;
      }

      const role = await loadRole(sessionUser.id);
      if (!role) {
        await db.auth.signOut();
        state.user = null;
        localStorage.removeItem("husky_admin_user");
        renderLogin();
        toast("Esta conta não tem permissão de gestão.");
        return;
      }

      state.user = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: role.name || sessionUser.email,
        role: role.role || "operator",
        permissions: role.permissions || []
      };
      localStorage.setItem("husky_admin_user", JSON.stringify(state.user));
      await loadSupabaseData();
      setupGestaoRealtime();
      render();
      return;
    } catch (e) {
      state.user = null;
      localStorage.removeItem("husky_admin_user");
      renderLogin();
      return;
    }
  }

  // Modo local sem Supabase: permite usar o login local de teste.
  if(state.user){ await loadSupabaseData(); setupGestaoRealtime(); render(); }
  else renderLogin();
})();
