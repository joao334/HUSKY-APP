(function () {
  const cfg = window.HUSKY_CONFIG || {};
  const assets = {
    logo: "assets/husky/logo.png",
    hero: "assets/husky/hero.png",
    mascot: "assets/husky/mascote.png",
    brigadeiro: "assets/husky/bolo-brigadeiro.png",
    maracuja: "assets/husky/bolo-maracuja.png",
    prestigio: "assets/husky/bolo-prestigio.png"
  };

  const now = new Date();
  const today = now.toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const nextHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  window.HuskySeed = {
    version: 3,
    settings: {
      storeOpen: true,
      paused: false,
      appName: cfg.appName || "Husk iFood",
      brandName: cfg.brandName || "Husky Confeitaria",
      storeName: cfg.storeName || "Husky Confeitaria e Caixa",
      city: cfg.city || "Embu das Artes",
      state: "SP",
      whatsapp: cfg.whatsapp || "5511945198349",
      instagramHandle: cfg.instagramHandle || "huskybolos",
      instagramUrl: cfg.instagramUrl || "https://www.instagram.com/huskybolos/",
      deliveryFee: Number(cfg.deliveryFee || 6.99),
      freeDeliveryFrom: Number(cfg.freeDeliveryFrom || 45),
      minOrder: Number(cfg.minOrder || 18),
      deliveryTime: "35-55 min",
      pickupTime: "20-30 min",
      deliveryMin: 35,
      deliveryMax: 55,
      preparationTime: 20,
      rating: 4.9,
      reviews: 318,
      announcement: "Forno ligado hoje: pedidos ate 21h30.",
      allowScheduling: true,
      allowPickup: true,
      allowDelivery: true,
      allowChat: true,
      allowReviews: true,
      googleClientId: cfg.googleClientId || "",
      googleLoginEnabled: true,
      integrations: {
        google: {
          enabled: true,
          clientId: cfg.googleClientId || "",
          status: cfg.googleClientId ? "ready" : "demo",
          lastLoginAt: ""
        },
        ifood: {
          enabled: Boolean(cfg.ifood?.enabled),
          merchantId: cfg.ifood?.merchantId || "",
          clientId: cfg.ifood?.clientId || "",
          clientSecret: cfg.ifood?.clientSecret || "",
          autoImportOrders: cfg.ifood?.autoImportOrders !== false,
          autoSyncMenu: cfg.ifood?.autoSyncMenu !== false,
          status: cfg.ifood?.enabled ? "ready" : "not_connected",
          lastSyncAt: "",
          lastImportAt: ""
        }
      },
      loyaltyRule: "A cada 10 pedidos, ganhe 1 bolo de pote.",
      serviceArea: cfg.serviceArea || ["Centro", "Jardim Vista Alegre", "Parque Pirajussara", "Santo Eduardo"],
      openingHours: cfg.openingHours || {
        monday: "Fechado",
        tuesday: "14:00 as 21:00",
        wednesday: "14:00 as 21:00",
        thursday: "14:00 as 21:00",
        friday: "14:00 as 22:00",
        saturday: "12:00 as 22:00",
        sunday: "12:00 as 20:00"
      }
    },
    orderStatuses: [
      { id: "pending", label: "Aguardando confirmacao", clientLabel: "Pedido enviado", tone: "warning" },
      { id: "accepted", label: "Aceito", clientLabel: "Aceito pela loja", tone: "info" },
      { id: "preparing", label: "Em preparo", clientLabel: "Em preparo", tone: "warning" },
      { id: "ready", label: "Pronto", clientLabel: "Pronto para retirada", tone: "success" },
      { id: "waiting_pickup", label: "Aguardando retirada", clientLabel: "Aguardando retirada", tone: "success" },
      { id: "out_for_delivery", label: "Saiu para entrega", clientLabel: "Saiu para entrega", tone: "info" },
      { id: "delivered", label: "Entregue", clientLabel: "Entregue", tone: "success" },
      { id: "completed", label: "Finalizado", clientLabel: "Finalizado", tone: "success" },
      { id: "cancelled", label: "Cancelado", clientLabel: "Cancelado", tone: "danger" },
      { id: "refused", label: "Recusado", clientLabel: "Recusado pela loja", tone: "danger" },
      { id: "payment_pending", label: "Pagamento pendente", clientLabel: "Pagamento pendente", tone: "warning" },
      { id: "payment_failed", label: "Pagamento recusado", clientLabel: "Pagamento recusado", tone: "danger" },
      { id: "refund_requested", label: "Reembolso solicitado", clientLabel: "Reembolso solicitado", tone: "warning" },
      { id: "refunded", label: "Reembolsado", clientLabel: "Reembolsado", tone: "info" }
    ],
    categories: [
      { id: "todos", name: "Todos", slug: "todos", icon: "layout-grid", active: true, sort: 0 },
      { id: "bolos", name: "Bolos de pote", slug: "bolos-de-pote", icon: "cake-slice", active: true, sort: 1 },
      { id: "combos", name: "Combos", slug: "combos", icon: "package-plus", active: true, sort: 2 },
      { id: "promocoes", name: "Promocoes", slug: "promocoes", icon: "badge-percent", active: true, sort: 3 },
      { id: "mais-vendidos", name: "Mais vendidos", slug: "mais-vendidos", icon: "flame", active: true, sort: 4 },
      { id: "lancamentos", name: "Lancamentos", slug: "lancamentos", icon: "sparkles", active: true, sort: 5 },
      { id: "geladas", name: "Sobremesas geladas", slug: "sobremesas-geladas", icon: "snowflake", active: true, sort: 6 },
      { id: "hoje", name: "Disponiveis hoje", slug: "disponiveis-hoje", icon: "calendar-check", active: true, sort: 7 }
    ],
    products: [
      {
        id: "p-brigadeiro",
        slug: "lambe-lambe-brigadeiro",
        name: "Lambe Lambe Brigadeiro",
        creativeName: "Lambe Lambe Brigadeiro",
        category: "bolos",
        extraCategories: ["mais-vendidos", "hoje"],
        description: "Bolo de chocolate com brigadeiro cremoso, massa molhadinha e finalizacao artesanal.",
        details: "Camadas bem montadas, brigadeiro brilhante e textura cremosa para comer gelado.",
        ingredients: "Chocolate, leite condensado, creme de leite, farinha, ovos e granulado.",
        allergens: "Contem leite, gluten, ovos e derivados de soja.",
        price: 18,
        promotionalPrice: null,
        cost: 6.2,
        stock: 18,
        minStock: 5,
        prepTime: 20,
        weight: "Aproximadamente 250g",
        size: "250 ml",
        image: assets.brigadeiro,
        tag: "Mais vendido",
        active: true,
        isAvailable: true,
        featured: true,
        popularity: 98,
        createdAt: "2026-04-01",
        options: ["Colher gratis", "Embalagem presente", "Mensagem no cartao"]
      },
      {
        id: "p-maracuja",
        slug: "abana-rabo",
        name: "Abana Rabo",
        creativeName: "Abana Rabo",
        category: "bolos",
        extraCategories: ["mais-vendidos", "geladas", "hoje"],
        description: "Bolo de chocolate com recheio cremoso de maracuja. Doce, acido e simplesmente perfeito.",
        details: "O contraste do chocolate com o maracuja deixa o sabor leve e marcante.",
        ingredients: "Chocolate, maracuja, leite condensado, creme de leite, farinha e ovos.",
        allergens: "Contem leite, gluten, ovos e derivados de soja.",
        price: 18,
        promotionalPrice: null,
        cost: 6.1,
        stock: 14,
        minStock: 5,
        prepTime: 20,
        weight: "Aproximadamente 250g",
        size: "250 ml",
        image: assets.maracuja,
        tag: "Queridinho da matilha",
        active: true,
        isAvailable: true,
        featured: true,
        popularity: 94,
        createdAt: "2026-04-05",
        options: ["Colher gratis", "Embalagem presente", "Mensagem no cartao"]
      },
      {
        id: "p-prestigio",
        slug: "uivo-de-prestigio",
        name: "Uivo de Prestigio",
        creativeName: "Uivo de Prestigio",
        category: "bolos",
        extraCategories: ["hoje"],
        description: "Chocolate com coco cremoso em camadas generosas.",
        details: "Classico de chocolate e coco com finalizacao cremosa.",
        ingredients: "Chocolate, coco, leite condensado, creme de leite, farinha e ovos.",
        allergens: "Contem leite, gluten, ovos, coco e derivados de soja.",
        price: 18,
        promotionalPrice: null,
        cost: 6,
        stock: 11,
        minStock: 4,
        prepTime: 20,
        weight: "Aproximadamente 250g",
        size: "250 ml",
        image: assets.prestigio,
        tag: "Classico",
        active: true,
        isAvailable: true,
        featured: false,
        popularity: 81,
        createdAt: "2026-03-25",
        options: ["Colher gratis", "Embalagem presente"]
      },
      {
        id: "p-pata",
        slug: "pata-crocante",
        name: "Pata Crocante",
        creativeName: "Pata Crocante",
        category: "bolos",
        extraCategories: ["lancamentos"],
        description: "Creme de ninho com Oreo crocante.",
        details: "Uma opcao mais crocante, feita para quem ama textura no bolo de pote.",
        ingredients: "Leite ninho, biscoito Oreo, leite condensado e creme de leite.",
        allergens: "Contem leite, gluten e derivados de soja.",
        price: 18,
        promotionalPrice: null,
        cost: 6.7,
        stock: 0,
        minStock: 4,
        prepTime: 20,
        weight: "Aproximadamente 250g",
        size: "250 ml",
        image: assets.mascot,
        tag: "Esgotado hoje",
        active: true,
        isAvailable: false,
        featured: false,
        popularity: 76,
        createdAt: "2026-04-20",
        options: ["Colher gratis"]
      },
      {
        id: "p-combo3",
        slug: "combo-matilha-3-sabores",
        name: "Combo Matilha 3 sabores",
        creativeName: "Combo Matilha",
        category: "combos",
        extraCategories: ["promocoes", "hoje"],
        description: "Escolha 3 bolos de pote para dividir, presentear ou guardar para mais tarde.",
        details: "Informe os sabores na observacao. Se algum acabar, a loja chama no chat.",
        ingredients: "Sabores sortidos conforme disponibilidade.",
        allergens: "Pode conter leite, gluten, ovos, coco e derivados de soja.",
        price: 50,
        promotionalPrice: 48,
        cost: 18.5,
        stock: 8,
        minStock: 3,
        prepTime: 25,
        weight: "3 unidades de 250g",
        size: "3 potes de 250 ml",
        image: assets.hero,
        tag: "Economize",
        active: true,
        isAvailable: true,
        featured: true,
        popularity: 89,
        createdAt: "2026-04-18",
        options: ["Escolher sabores no comentario", "Sacola presente"]
      },
      {
        id: "p-combo4",
        slug: "combo-familia-husky",
        name: "Combo Familia Husky",
        creativeName: "Combo Familia Husky",
        category: "combos",
        extraCategories: ["promocoes", "mais-vendidos"],
        description: "Leve 4 bolos de pote com desconto automatico no carrinho.",
        details: "Ideal para familia, presente coletivo ou para abastecer a geladeira.",
        ingredients: "Sabores sortidos conforme disponibilidade.",
        allergens: "Pode conter leite, gluten, ovos, coco e derivados de soja.",
        price: 68,
        promotionalPrice: 64,
        cost: 24.5,
        stock: 5,
        minStock: 2,
        prepTime: 30,
        weight: "4 unidades de 250g",
        size: "4 potes de 250 ml",
        image: assets.hero,
        tag: "Combo",
        active: true,
        isAvailable: true,
        featured: false,
        popularity: 86,
        createdAt: "2026-04-21",
        options: ["Escolher sabores no comentario", "Sacola presente", "Cartao"]
      },
      {
        id: "p-presente",
        slug: "kit-presente-husky",
        name: "Kit Presente Husky",
        creativeName: "Kit Presente Husky",
        category: "presentes",
        extraCategories: ["promocoes"],
        description: "Dois bolos de pote, sacola kraft e cartao com mensagem.",
        details: "Um presente simples, bonito e pronto para entregar.",
        ingredients: "Sabores sortidos conforme disponibilidade.",
        allergens: "Pode conter leite, gluten, ovos, coco e derivados de soja.",
        price: 42,
        promotionalPrice: null,
        cost: 15,
        stock: 6,
        minStock: 2,
        prepTime: 30,
        weight: "2 unidades de 250g",
        size: "2 potes de 250 ml",
        image: assets.logo,
        tag: "Para presentear",
        active: true,
        isAvailable: true,
        featured: false,
        popularity: 71,
        createdAt: "2026-04-15",
        options: ["Mensagem no cartao", "Escolher sabores no comentario"]
      },
      {
        id: "p-cafe",
        slug: "cafe-gelado-da-casa",
        name: "Cafe gelado da casa",
        creativeName: "Cafe gelado da casa",
        category: "bebidas",
        extraCategories: ["lancamentos", "hoje"],
        description: "Cafe gelado cremoso para acompanhar o bolo de pote.",
        details: "Feito na hora, com calda da casa.",
        ingredients: "Cafe, leite, gelo e calda da casa.",
        allergens: "Contem leite.",
        price: 12,
        promotionalPrice: null,
        cost: 4,
        stock: 16,
        minStock: 4,
        prepTime: 8,
        weight: "300 ml",
        size: "Copo 300 ml",
        image: assets.mascot,
        tag: "Novo",
        active: true,
        isAvailable: true,
        featured: false,
        popularity: 52,
        createdAt: "2026-05-01",
        options: ["Sem acucar", "Com gelo extra"]
      }
    ],
    addOns: [
      { id: "a-colher", name: "Colher descartavel", price: 0, active: true },
      { id: "a-sacola", name: "Sacola kraft presenteavel", price: 2.5, active: true },
      { id: "a-cartao", name: "Cartao com mensagem", price: 2, active: true },
      { id: "a-brigadeiro", name: "Camada extra de brigadeiro", price: 4, active: true }
    ],
    coupons: [
      { id: "c-primeira", code: "PRIMEIRACOLHER", title: "Primeira colher", description: "R$ 5 de desconto acima de R$ 30.", type: "value", value: 5, minSubtotal: 30, minItems: 0, active: true, used: 3, limit: 100, usageLimitPerUser: 1, expiresAt: "2026-05-31", categories: [], products: [] },
      { id: "c-husky10", code: "HUSKY10", title: "10% OFF", description: "10% de desconto acima de R$ 50.", type: "percent", value: 10, minSubtotal: 50, minItems: 0, active: true, used: 8, limit: 200, usageLimitPerUser: 1, expiresAt: "2026-06-30", categories: [], products: [] },
      { id: "c-frete", code: "FRETEGRATIS", title: "Entrega gratis", description: "Frete gratis acima de R$ 50.", type: "free_delivery", value: 0, minSubtotal: 50, minItems: 0, active: true, used: 11, limit: 120, usageLimitPerUser: 1, expiresAt: "2026-05-31", categories: [], products: [] },
      { id: "c-aniversario", code: "NIVERHUSKY", title: "Aniversario", description: "R$ 8 no mes do aniversario.", type: "value", value: 8, minSubtotal: 40, minItems: 0, active: true, used: 1, limit: 80, usageLimitPerUser: 1, expiresAt: "2026-12-31", categories: [], products: [] }
    ],
    customers: [
      { id: "u-yasmin", name: "Yasmin", phone: "11999990000", email: "yasmin@email.com", neighborhood: "Centro", orders: 4, totalSpent: 162, favorite: "Abana Rabo", notes: "Gosta de doce mais azedinho.", birthday: "1999-05-12", blocked: false },
      { id: "u-joao", name: "Joao", phone: "11988880000", email: "joao@email.com", neighborhood: "Jardim Vista Alegre", orders: 2, totalSpent: 91, favorite: "Uivo de Prestigio", notes: "Prefere retirada.", birthday: "", blocked: false },
      { id: "u-demo", name: "Cliente demo", phone: "11900000000", email: "cliente@demo.com", neighborhood: "Centro", orders: 1, totalSpent: 42.99, favorite: "Lambe Lambe Brigadeiro", notes: "", birthday: "", blocked: false }
    ],
    addresses: [
      { id: "addr-demo", userId: "u-demo", label: "Casa", zipcode: "06800-000", street: "Rua Exemplo", number: "123", complement: "Casa 2", neighborhood: "Centro", city: "Embu das Artes", state: "SP", reference: "Portao azul", isDefault: true, deliveryFee: 6.99, estimatedTime: "35-55 min" },
      { id: "addr-work", userId: "u-demo", label: "Trabalho", zipcode: "06803-000", street: "Avenida Central", number: "55", complement: "Sala 4", neighborhood: "Jardim Vista Alegre", city: "Embu das Artes", state: "SP", reference: "Recepcao", isDefault: false, deliveryFee: 7.99, estimatedTime: "40-60 min" }
    ],
    favorites: [
      { id: "fav-1", userId: "u-demo", productId: "p-maracuja", createdAt: today },
      { id: "fav-2", userId: "u-demo", productId: "p-brigadeiro", createdAt: today }
    ],
    orders: [
      {
        id: "o-1024",
        number: "HUS-1024",
        createdAt: today,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString(),
        scheduledFor: "",
        customerId: "u-demo",
        customerName: "Cliente demo",
        phone: "11900000000",
        fulfillment: "delivery",
        addressId: "addr-demo",
        address: "Rua Exemplo, 123 - Centro",
        paymentMethod: "Pix",
        paymentStatus: "approved",
        status: "preparing",
        channel: "App proprio",
        subtotal: 36,
        deliveryFee: 6.99,
        discount: 0,
        total: 42.99,
        couponCode: "",
        note: "Mandar bem gelado.",
        courierId: "",
        items: [
          { productId: "p-brigadeiro", name: "Lambe Lambe Brigadeiro", qty: 1, price: 18, note: "Com colher" },
          { productId: "p-maracuja", name: "Abana Rabo", qty: 1, price: 18, note: "Bem gelado" }
        ],
        history: [
          { status: "pending", text: "Pedido enviado", at: today },
          { status: "accepted", text: "Pedido aceito pela loja", at: today },
          { status: "preparing", text: "Pedido entrou em preparo", at: today }
        ]
      },
      {
        id: "o-1025",
        number: "HUS-1025",
        createdAt: yesterday,
        estimatedDeliveryTime: yesterday,
        scheduledFor: "",
        customerId: "u-joao",
        customerName: "Joao",
        phone: "11988880000",
        fulfillment: "pickup",
        addressId: "",
        address: "",
        paymentMethod: "Cartao",
        paymentStatus: "approved",
        status: "completed",
        channel: "Caixa",
        subtotal: 54,
        deliveryFee: 0,
        discount: 5,
        total: 49,
        couponCode: "PRIMEIRACOLHER",
        note: "Retirada as 20h",
        courierId: "",
        items: [
          { productId: "p-prestigio", name: "Uivo de Prestigio", qty: 3, price: 18, note: "Retirar as 20h" }
        ],
        history: [
          { status: "pending", text: "Pedido criado no caixa", at: yesterday },
          { status: "accepted", text: "Pedido aceito", at: yesterday },
          { status: "preparing", text: "Producao iniciada", at: yesterday },
          { status: "ready", text: "Pedido pronto", at: yesterday },
          { status: "completed", text: "Pedido finalizado", at: yesterday }
        ]
      }
    ],
    chatThreads: [
      {
        id: "thread-o-1024",
        orderId: "o-1024",
        customerId: "u-demo",
        customerName: "Cliente demo",
        phone: "11900000000",
        unread: 1,
        status: "open",
        messages: [
          { id: "m1", from: "store", text: "Oi! Seu pedido ja foi recebido.", createdAt: today },
          { id: "m2", from: "customer", text: "Quero saber se da para mandar bem gelado.", createdAt: today },
          { id: "m3", from: "store", text: "Da sim, deixei anotado no pedido.", createdAt: today }
        ]
      }
    ],
    notifications: [
      { id: "n1", userId: "u-demo", title: "Pedido em preparo", message: "Seu pedido HUS-1024 entrou em preparo.", type: "order", orderId: "o-1024", isRead: false, createdAt: today },
      { id: "n2", userId: "u-demo", title: "Cupom disponivel", message: "Use HUSKY10 em pedidos acima de R$ 50.", type: "coupon", orderId: "", isRead: false, createdAt: today }
    ],
    reviews: [
      { id: "r1", userId: "u-yasmin", orderId: "o-1025", customerName: "Yasmin", rating: 5, productRating: 5, deliveryRating: 5, serviceRating: 5, comment: "Chegou perfeito e muito gostoso.", product: "Abana Rabo", answered: false, createdAt: yesterday }
    ],
    helpTopics: [
      { id: "wrong", title: "Pedido veio errado", description: "Informe o item e anexe uma foto, se precisar." },
      { id: "missing", title: "Produto faltando", description: "A loja confere a comanda e responde pelo chat." },
      { id: "late", title: "Pedido atrasado", description: "Veja a previsao e chame a loja pelo pedido." },
      { id: "payment", title: "Problema com pagamento", description: "Pix, cartao, dinheiro ou estorno." },
      { id: "cancel", title: "Quero cancelar", description: "Cancelamento livre antes da confirmacao." },
      { id: "refund", title: "Quero reembolso", description: "Acompanhamento de solicitacao e retorno." }
    ],
    deliveryZones: [
      { id: "z-centro", name: "Centro", city: "Embu das Artes", neighborhood: "Centro", deliveryFee: 6.99, minOrder: 18, estimatedMin: 35, estimatedMax: 55, active: true },
      { id: "z-vista", name: "Jardim Vista Alegre", city: "Embu das Artes", neighborhood: "Jardim Vista Alegre", deliveryFee: 7.99, minOrder: 22, estimatedMin: 40, estimatedMax: 60, active: true },
      { id: "z-taboao", name: "Taboao da Serra", city: "Taboao da Serra", neighborhood: "Centro", deliveryFee: 10, minOrder: 35, estimatedMin: 60, estimatedMax: 75, active: false }
    ],
    inventoryItems: [
      { id: "inv-1", name: "Leite condensado", type: "ingrediente", unit: "un", quantity: 18, minimumQuantity: 8, costPerUnit: 6.9, supplier: "Atacado", expirationDate: "2026-06-10", active: true },
      { id: "inv-2", name: "Embalagens 250ml", type: "embalagem", unit: "un", quantity: 64, minimumQuantity: 40, costPerUnit: 0.65, supplier: "Embalagens SP", expirationDate: "", active: true },
      { id: "inv-3", name: "Maracuja", type: "ingrediente", unit: "kg", quantity: 2.5, minimumQuantity: 3, costPerUnit: 14, supplier: "Feira", expirationDate: "2026-05-08", active: true }
    ],
    inventoryMovements: [
      { id: "mov-1", inventoryItemId: "inv-2", type: "saida", quantity: 2, reason: "Venda HUS-1024", relatedOrderId: "o-1024", createdAt: today }
    ],
    expenses: [
      { id: "ex-1", description: "Embalagens 250ml", category: "Embalagens", amount: 42, quantity: 60, paymentMethod: "Pix", supplier: "Embalagens SP", expenseDate: "2026-05-03", notes: "" },
      { id: "ex-2", description: "Impulsionamento Instagram", category: "Marketing", amount: 25, quantity: 1, paymentMethod: "Cartao", supplier: "Meta", expenseDate: "2026-05-02", notes: "Post combo" }
    ],
    couriers: [
      { id: "cour-1", name: "Entrega propria", phone: "11977770000", vehicleType: "moto", vehiclePlate: "", status: "available", active: true, delivered: 12, payout: 48 }
    ],
    marketingBanners: [
      { id: "ban-1", title: "Husky Confeiteiro no delivery proprio", subtitle: "Peça direto com a loja e acompanhe tudo por aqui.", image: assets.hero, active: true, sort: 1 },
      { id: "ban-2", title: "Frete gratis", subtitle: "Use FRETEGRATIS acima de R$ 50.", image: assets.logo, active: true, sort: 2 }
    ],
    instagramPosts: [
      { id: "ig-1", type: "Reel", title: "Montagem do Lambe Lambe", caption: "Camadas generosas e brigadeiro brilhando.", status: "Publicado", reach: 1240, clicks: 61, image: assets.brigadeiro },
      { id: "ig-2", type: "Story", title: "Enquete de sabor", caption: "Chocolate com maracuja ou coco?", status: "Planejado", reach: 0, clicks: 0, image: assets.maracuja },
      { id: "ig-3", type: "Post", title: "Combo Matilha", caption: "Tres sabores para adocar a semana.", status: "Rascunho", reach: 0, clicks: 0, image: assets.hero }
    ],
    roles: [
      { id: "role-admin", name: "Administrador", permissions: ["all"] },
      { id: "role-attendant", name: "Atendente", permissions: ["orders", "chat", "customers"] },
      { id: "role-kitchen", name: "Producao", permissions: ["kitchen"] },
      { id: "role-finance", name: "Financeiro", permissions: ["finance", "reports"] },
      { id: "role-marketing", name: "Marketing", permissions: ["products", "coupons", "marketing"] }
    ],
    adminUsers: [
      { id: "adm-1", name: "Admin Husky", email: "admin@husky.local", phone: "11999999999", roleId: "role-admin", active: true, lastLoginAt: today },
      { id: "adm-2", name: "Cozinha", email: "cozinha@husky.local", phone: "11988888888", roleId: "role-kitchen", active: true, lastLoginAt: today }
    ],
    auditLogs: [
      { id: "audit-1", user: "Admin Husky", action: "Aceitou o pedido HUS-1024", module: "Pedidos", entityId: "o-1024", createdAt: today },
      { id: "audit-2", user: "Sistema", action: "Baixou estoque automaticamente", module: "Estoque", entityId: "o-1024", createdAt: today }
    ],
    printerSettings: [
      { id: "print-1", name: "Comanda cozinha", printerType: "termica", paperWidth: "80mm", autoPrintNewOrders: false, autoPrintAcceptedOrders: true, active: true }
    ],
    cash: {
      open: true,
      openedAt: today,
      initialAmount: 80,
      payments: [
        { id: "pay-1", method: "Pix", status: "approved", amount: 42.99, createdAt: today, orderNumber: "HUS-1024" },
        { id: "pay-2", method: "Cartao", status: "approved", amount: 49, createdAt: yesterday, orderNumber: "HUS-1025" }
      ],
      expenses: [
        { id: "cash-ex-1", title: "Embalagens", amount: 22, createdAt: today }
      ]
    },
    appStructure: {
      clientScreens: [
        "splash", "onboarding", "login", "register", "forgot-password", "home", "search", "categories", "product", "cart", "checkout", "payment", "order-success", "orders", "tracking", "chat", "help", "review", "profile", "addresses", "payments", "coupons", "favorites", "notifications", "settings"
      ],
      adminScreens: [
        "login", "dashboard", "pedidos", "detalhe-do-pedido", "kanban", "cozinha", "chat", "produtos", "categorias", "estoque", "clientes", "cupons", "financeiro", "despesas", "caixa", "relatorios", "entregas", "avaliacoes", "marketing", "configuracoes", "usuarios", "permissoes", "auditoria"
      ],
      recommendedStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Supabase Realtime", "Vercel"]
    }
  };
})();
