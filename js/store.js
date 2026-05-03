(function () {
  const KEY = "husky_v2_data";
  const CART_KEY = "husky_v2_cart";
  const PROFILE_KEY = "husky_v2_profile";
  const LIVE_KEY = "husky_v2_live_ping";
  const LIVE_CHANNEL = "husky_v2_realtime";
  const SOURCE_ID = `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  let liveChannel = null;
  try {
    liveChannel = new BroadcastChannel(LIVE_CHANNEL);
  } catch (error) {
    liveChannel = null;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function seeded() {
    const data = clone(window.HuskySeed);
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function normalize(data) {
    data.version = window.HuskySeed.version;
    data.settings = Object.assign(clone(window.HuskySeed.settings), data.settings || {});
    [
      "orderStatuses", "categories", "products", "addOns", "coupons", "customers", "addresses",
      "favorites", "orders", "chatThreads", "notifications", "reviews", "helpTopics",
      "deliveryZones", "inventoryItems", "inventoryMovements", "expenses", "couriers",
      "marketingBanners", "instagramPosts", "roles", "adminUsers", "auditLogs", "printerSettings"
    ].forEach((key) => {
      if (!Array.isArray(data[key])) data[key] = clone(window.HuskySeed[key] || []);
    });
    data.cash = Object.assign(clone(window.HuskySeed.cash), data.cash || {});
    return data;
  }

  function read() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seeded();
    try {
      const parsed = JSON.parse(raw);
      if (parsed.version !== window.HuskySeed.version) return seeded();
      return normalize(parsed);
    } catch (error) {
      localStorage.removeItem(KEY);
      return seeded();
    }
  }

  function emitData(normalized, remote) {
    window.dispatchEvent(new CustomEvent("husky:data", { detail: normalized }));
    if (remote) return;
    const ping = { source: SOURCE_ID, at: Date.now() };
    try {
      if (liveChannel) liveChannel.postMessage(ping);
    } catch (error) {}
    try {
      localStorage.setItem(LIVE_KEY, JSON.stringify(ping));
    } catch (error) {}
  }

  function notifyRemoteData() {
    window.dispatchEvent(new CustomEvent("husky:data", { detail: read() }));
  }

  if (liveChannel) {
    liveChannel.onmessage = (event) => {
      if (event.data?.source !== SOURCE_ID) notifyRemoteData();
    };
  }

  window.addEventListener("storage", (event) => {
    if (event.key === KEY && event.newValue) notifyRemoteData();
    if (event.key === LIVE_KEY && event.newValue) {
      try {
        const ping = JSON.parse(event.newValue);
        if (ping.source !== SOURCE_ID) notifyRemoteData();
      } catch (error) {}
    }
    if (event.key === CART_KEY) {
      window.dispatchEvent(new CustomEvent("husky:cart", { detail: getCart() }));
    }
    if (event.key === PROFILE_KEY) {
      window.dispatchEvent(new CustomEvent("husky:profile", { detail: getProfile() }));
    }
  });

  function write(data, options) {
    const normalized = normalize(data);
    localStorage.setItem(KEY, JSON.stringify(normalized));
    emitData(normalized, options?.remote === true);
    return normalized;
  }

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function dateTime(value) {
    if (!value) return "";
    return new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function nextOrderNumber(data) {
    const numbers = data.orders
      .map((order) => Number(String(order.number || "").replace(/\D/g, "")))
      .filter(Boolean);
    const next = (numbers.length ? Math.max.apply(null, numbers) : 1025) + 1;
    return `HUS-${next}`;
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("husky:cart", { detail: cart }));
    return cart;
  }

  function clearCart() {
    return setCart([]);
  }

  function getProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") || {
        id: "u-demo",
        name: "Cliente demo",
        phone: "11900000000",
        email: "cliente@demo.com",
        birthday: "",
        avatarUrl: "",
        authProvider: "demo",
        googleSub: "",
        savedAccount: true,
        address: "Rua Exemplo, 123 - Centro",
        neighborhood: "Centro"
      };
    } catch (error) {
      localStorage.removeItem(PROFILE_KEY);
      return getProfile();
    }
  }

  function setProfile(profile) {
    const next = Object.assign({}, getProfile(), profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("husky:profile", { detail: next }));
    return next;
  }

  function productIsAvailable(product) {
    return Boolean(product && product.active && product.isAvailable !== false && Number(product.stock || 0) > 0);
  }

  function visibleProducts(data, includeUnavailable) {
    return data.products.filter((product) => product.active && (includeUnavailable || productIsAvailable(product)));
  }

  function categoryMatches(product, categoryId) {
    if (!categoryId || categoryId === "todos") return true;
    return product.category === categoryId || (product.extraCategories || []).includes(categoryId);
  }

  function productPrice(product) {
    return Number(product.promotionalPrice || product.price || 0);
  }

  function deliveryInfo(data, address) {
    const neighborhood = String(address?.neighborhood || address || "").toLowerCase();
    const zone = data.deliveryZones.find((item) =>
      item.active && String(item.neighborhood || item.name).toLowerCase() === neighborhood
    );
    if (!zone) {
      return {
        available: data.settings.serviceArea.map((item) => item.toLowerCase()).includes(neighborhood),
        fee: Number(data.settings.deliveryFee || 0),
        minOrder: Number(data.settings.minOrder || 0),
        estimatedTime: data.settings.deliveryTime,
        message: "Usando taxa padrao da loja."
      };
    }
    return {
      available: true,
      fee: Number(zone.deliveryFee || 0),
      minOrder: Number(zone.minOrder || data.settings.minOrder || 0),
      estimatedTime: `${zone.estimatedMin}-${zone.estimatedMax} min`,
      message: `Entrega em ${zone.name}.`
    };
  }

  function cartTotals(cart, data, couponCode, options) {
    const mode = options?.fulfillment || "delivery";
    const address = options?.address || null;
    const delivery = deliveryInfo(data, address);
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0) + Number(item.addOnsTotal || 0), 0);
    const coupon = data.coupons.find((item) => item.active && item.code.toUpperCase() === String(couponCode || "").toUpperCase());
    let discount = 0;
    let deliveryFee = mode === "pickup" ? 0 : (subtotal >= data.settings.freeDeliveryFrom ? 0 : delivery.fee);
    let couponMessage = "";

    if (coupon) {
      const itemCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      const canUse = subtotal >= Number(coupon.minSubtotal || 0) && itemCount >= Number(coupon.minItems || 0);
      if (canUse) {
        if (coupon.type === "value") discount = Math.min(Number(coupon.value || 0), subtotal);
        if (coupon.type === "percent") discount = Math.min(subtotal * (Number(coupon.value || 0) / 100), subtotal);
        if (coupon.type === "free_delivery") deliveryFee = 0;
        couponMessage = `${coupon.title} aplicado.`;
      } else {
        couponMessage = `Cupom valido a partir de ${money(coupon.minSubtotal)}.`;
      }
    }

    const comboCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    if (!coupon && comboCount >= 4 && subtotal >= 72) {
      discount = 8;
      couponMessage = "Combo automatico: R$ 8 de desconto levando 4 itens.";
    }

    const minOrder = Math.max(Number(data.settings.minOrder || 0), Number(delivery.minOrder || 0));
    const missingMin = Math.max(0, minOrder - subtotal);
    const total = Math.max(0, subtotal - discount) + deliveryFee;
    return { subtotal, discount, deliveryFee, total, coupon, couponMessage, minOrder, missingMin, delivery };
  }

  function statusMeta(data, status) {
    return data.orderStatuses.find((item) => item.id === status) || { id: status, label: status, clientLabel: status, tone: "info" };
  }

  function orderSteps(order) {
    const deliverySteps = ["pending", "accepted", "preparing", "out_for_delivery", "delivered", "completed"];
    const pickupSteps = ["pending", "accepted", "preparing", "ready", "waiting_pickup", "completed"];
    if (["cancelled", "refused", "refund_requested", "refunded", "payment_failed"].includes(order.status)) {
      return ["pending", order.status];
    }
    return order.fulfillment === "pickup" ? pickupSteps : deliverySteps;
  }

  function addNotification(data, payload) {
    data.notifications.unshift(Object.assign({
      id: uid("notif"),
      userId: payload.userId || "u-demo",
      title: "",
      message: "",
      type: "system",
      orderId: "",
      isRead: false,
      createdAt: new Date().toISOString()
    }, payload));
  }

  function addAudit(data, action, module, entityId, user) {
    data.auditLogs.unshift({
      id: uid("audit"),
      user: user || "Sistema",
      action,
      module,
      entityId: entityId || "",
      createdAt: new Date().toISOString()
    });
  }

  function ensureCustomer(data, profile) {
    let customer = data.customers.find((item) => item.id === profile.id || item.phone === profile.phone);
    if (!customer) {
      customer = {
        id: profile.id || uid("user"),
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        neighborhood: profile.neighborhood || "",
        orders: 0,
        totalSpent: 0,
        favorite: "",
        notes: "",
        birthday: profile.birthday || "",
        blocked: false
      };
      data.customers.unshift(customer);
    }
    customer.name = profile.name || customer.name;
    customer.phone = profile.phone || customer.phone;
    customer.email = profile.email || customer.email;
    customer.neighborhood = profile.neighborhood || customer.neighborhood;
    customer.orders = Number(customer.orders || 0) + 1;
    return customer;
  }

  function addOrder(orderPayload) {
    const data = read();
    const number = nextOrderNumber(data);
    const customer = ensureCustomer(data, {
      id: orderPayload.customerId,
      name: orderPayload.customerName,
      phone: orderPayload.phone,
      email: orderPayload.email,
      neighborhood: orderPayload.neighborhood
    });
    const now = new Date().toISOString();
    const order = Object.assign({
      id: uid("order"),
      number,
      createdAt: now,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString(),
      scheduledFor: "",
      status: "pending",
      paymentStatus: orderPayload.paymentMethod === "Pix" ? "pending" : "approved",
      channel: "App proprio",
      history: [{ status: "pending", text: "Pedido enviado", at: now }]
    }, orderPayload, { number, customerId: customer.id });

    if (!Array.isArray(order.history)) order.history = [{ status: order.status, text: "Pedido criado", at: now }];
    data.orders.unshift(order);
    customer.totalSpent = Number(customer.totalSpent || 0) + Number(order.total || 0);

    data.cash.payments.unshift({
      id: uid("pay"),
      method: order.paymentMethod || "Pix",
      status: order.paymentStatus || "approved",
      amount: order.total,
      orderNumber: order.number,
      createdAt: order.createdAt
    });

    order.items.forEach((item) => {
      const product = data.products.find((candidate) => candidate.id === item.productId);
      if (product) {
        product.stock = Math.max(0, Number(product.stock || 0) - Number(item.qty || 0));
        if (product.stock === 0) product.isAvailable = false;
      }
    });

    const thread = {
      id: `thread-${order.id}`,
      orderId: order.id,
      customerId: customer.id,
      customerName: order.customerName,
      phone: order.phone,
      unread: 0,
      status: "open",
      messages: [
        { id: uid("msg"), from: "system", text: `Pedido ${order.number} criado.`, createdAt: now },
        { id: uid("msg"), from: "store", text: "Oi! Recebemos seu pedido. Assim que a loja confirmar, o status muda por aqui.", createdAt: now }
      ]
    };
    data.chatThreads.unshift(thread);

    addNotification(data, {
      userId: customer.id,
      title: "Pedido enviado",
      message: `Seu pedido ${order.number} foi enviado para a loja.`,
      type: "order",
      orderId: order.id
    });
    addAudit(data, `Criou o pedido ${order.number}`, "Pedidos", order.id, order.channel === "Caixa" ? "Caixa" : "Cliente");

    write(data);
    return order;
  }

  function updateOrderStatus(orderId, status, user) {
    const data = read();
    const order = data.orders.find((item) => item.id === orderId);
    if (order) {
      const meta = statusMeta(data, status);
      order.status = status;
      order.history = Array.isArray(order.history) ? order.history : [];
      order.history.push({ status, text: meta.label, at: new Date().toISOString() });
      addNotification(data, {
        userId: order.customerId,
        title: meta.clientLabel || meta.label,
        message: `Pedido ${order.number}: ${meta.clientLabel || meta.label}.`,
        type: "order",
        orderId
      });
      const thread = data.chatThreads.find((item) => item.orderId === orderId);
      if (thread) {
        thread.messages.push({ id: uid("msg"), from: "system", text: `Atualizacao: ${meta.clientLabel || meta.label}.`, createdAt: new Date().toISOString() });
      }
      addAudit(data, `Alterou ${order.number} para ${meta.label}`, "Pedidos", orderId, user || "Gestao");
    }
    write(data);
    return order;
  }

  function cancelOrder(orderId, reason) {
    const data = read();
    const order = data.orders.find((item) => item.id === orderId);
    if (order) {
      const allowed = order.status === "pending";
      const nextStatus = allowed ? "cancelled" : "refund_requested";
      order.status = nextStatus;
      order.history.push({ status: nextStatus, text: reason || (allowed ? "Cancelado pelo cliente" : "Solicitacao de cancelamento enviada"), at: new Date().toISOString() });
      addAudit(data, `${allowed ? "Cancelou" : "Solicitou cancelamento do"} ${order.number}`, "Pedidos", orderId, "Cliente");
    }
    write(data);
    return order;
  }

  function reorder(orderId) {
    const data = read();
    const order = data.orders.find((item) => item.id === orderId);
    if (!order) return { added: [], missing: [] };
    const added = [];
    const missing = [];
    const cart = [];
    order.items.forEach((item) => {
      const product = data.products.find((candidate) => candidate.id === item.productId);
      if (productIsAvailable(product)) {
        cart.push({ productId: product.id, name: product.name, price: productPrice(product), qty: item.qty, image: product.image, note: item.note || "", addOnsTotal: 0 });
        added.push(product.name);
      } else {
        missing.push(item.name);
      }
    });
    setCart(cart);
    return { added, missing };
  }

  function saveProduct(product) {
    const data = read();
    const index = data.products.findIndex((item) => item.id === product.id);
    const payload = Object.assign({}, product, {
      price: Number(product.price || 0),
      promotionalPrice: product.promotionalPrice ? Number(product.promotionalPrice) : null,
      cost: Number(product.cost || 0),
      stock: Number(product.stock || 0),
      minStock: Number(product.minStock || 0),
      prepTime: Number(product.prepTime || 0),
      active: product.active !== false,
      isAvailable: product.isAvailable !== false && Number(product.stock || 0) > 0
    });
    let saved;
    if (index >= 0) {
      saved = Object.assign({}, data.products[index], payload);
      data.products[index] = saved;
    } else {
      saved = Object.assign({ id: uid("p"), slug: String(payload.name || "produto").toLowerCase().replace(/\s+/g, "-"), image: "assets/husky/logo.png", featured: false, options: [], extraCategories: [] }, payload);
      data.products.unshift(saved);
    }
    addAudit(data, `Salvou produto ${saved.name}`, "Produtos", saved.id, "Gestao");
    write(data);
    return saved;
  }

  function saveCoupon(coupon) {
    const data = read();
    const index = data.coupons.findIndex((item) => item.id === coupon.id);
    const payload = Object.assign({}, coupon, {
      code: String(coupon.code || "").toUpperCase().trim(),
      value: Number(coupon.value || 0),
      minSubtotal: Number(coupon.minSubtotal || 0),
      minItems: Number(coupon.minItems || 0),
      limit: Number(coupon.limit || 0),
      active: coupon.active !== false
    });
    let saved;
    if (index >= 0) {
      saved = Object.assign({}, data.coupons[index], payload);
      data.coupons[index] = saved;
    } else {
      saved = Object.assign({ id: uid("coupon"), used: 0, usageLimitPerUser: 1, expiresAt: "", categories: [], products: [] }, payload);
      data.coupons.unshift(saved);
    }
    addAudit(data, `Salvou cupom ${saved.code}`, "Cupons", saved.id, "Gestao");
    write(data);
    return saved;
  }

  function addChatMessage(threadId, from, text, imageUrl, extra) {
    const data = read();
    let thread = data.chatThreads.find((item) => item.id === threadId || item.orderId === threadId);
    if (!thread) {
      const profile = getProfile();
      thread = {
        id: threadId,
        orderId: "",
        customerId: profile.id,
        customerName: profile.name,
        phone: profile.phone,
        unread: 0,
        status: "open",
        messages: []
      };
      data.chatThreads.unshift(thread);
    }
    const extraData = extra || {};
    const cleanText = String(text || "").trim();
    if (!cleanText && !imageUrl && !extraData.stickerUrl) return thread;
    const message = Object.assign({
      id: uid("msg"),
      from,
      text: cleanText,
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString()
    }, extraData);
    thread.messages.push(message);
    thread.unread = from === "customer" ? Number(thread.unread || 0) + 1 : 0;
    thread.status = "open";
    addNotification(data, {
      userId: from === "customer" ? "admin" : thread.customerId,
      title: "Nova mensagem",
      message: text || message.stickerLabel || "Figurinha enviada.",
      type: "chat",
      orderId: thread.orderId
    });
    write(data);
    return thread;
  }

  function markThreadRead(threadId) {
    const data = read();
    const thread = data.chatThreads.find((item) => item.id === threadId || item.orderId === threadId);
    if (thread) thread.unread = 0;
    write(data);
  }

  function saveAddress(address) {
    const data = read();
    const profile = getProfile();
    const index = data.addresses.findIndex((item) => item.id === address.id);
    const payload = Object.assign({
      id: uid("addr"),
      userId: profile.id,
      label: "Casa",
      zipcode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: data.settings.city,
      state: "SP",
      reference: "",
      isDefault: false
    }, address);
    if (payload.isDefault) data.addresses.forEach((item) => { if (item.userId === payload.userId) item.isDefault = false; });
    if (index >= 0) data.addresses[index] = payload;
    else data.addresses.push(payload);
    if (payload.isDefault) {
      setProfile({ address: `${payload.street}, ${payload.number} - ${payload.neighborhood}`, neighborhood: payload.neighborhood });
    }
    write(data);
    return payload;
  }

  function removeAddress(addressId) {
    const data = read();
    data.addresses = data.addresses.filter((item) => item.id !== addressId);
    write(data);
  }

  function toggleFavorite(productId) {
    const data = read();
    const profile = getProfile();
    const index = data.favorites.findIndex((item) => item.userId === profile.id && item.productId === productId);
    if (index >= 0) data.favorites.splice(index, 1);
    else data.favorites.unshift({ id: uid("fav"), userId: profile.id, productId, createdAt: new Date().toISOString() });
    write(data);
    return index < 0;
  }

  function isFavorite(data, productId) {
    const profile = getProfile();
    return data.favorites.some((item) => item.userId === profile.id && item.productId === productId);
  }

  function addReview(review) {
    const data = read();
    const payload = Object.assign({
      id: uid("review"),
      userId: getProfile().id,
      customerName: getProfile().name,
      rating: 5,
      productRating: 5,
      deliveryRating: 5,
      serviceRating: 5,
      comment: "",
      answered: false,
      createdAt: new Date().toISOString()
    }, review);
    data.reviews.unshift(payload);
    addAudit(data, `Recebeu avaliacao ${payload.rating} estrelas`, "Avaliacoes", payload.id, "Cliente");
    write(data);
    return payload;
  }

  function updateSettings(settings) {
    const data = read();
    data.settings = Object.assign({}, data.settings, settings);
    addAudit(data, "Atualizou configuracoes da loja", "Configuracoes", "settings", "Gestao");
    write(data);
    return data.settings;
  }

  function addExpense(expense) {
    const data = read();
    const payload = Object.assign({ id: uid("expense"), expenseDate: new Date().toISOString().slice(0, 10) }, expense);
    data.expenses.unshift(payload);
    data.cash.expenses.unshift({ id: uid("cash-expense"), title: payload.description, amount: Number(payload.amount || 0), createdAt: new Date().toISOString() });
    addAudit(data, `Lancou despesa ${payload.description}`, "Financeiro", payload.id, "Gestao");
    write(data);
    return payload;
  }

  function addInventoryMovement(movement) {
    const data = read();
    const item = data.inventoryItems.find((candidate) => candidate.id === movement.inventoryItemId);
    if (item) {
      const qty = Number(movement.quantity || 0);
      item.quantity = movement.type === "entrada" ? Number(item.quantity || 0) + qty : Math.max(0, Number(item.quantity || 0) - qty);
    }
    const payload = Object.assign({ id: uid("mov"), createdAt: new Date().toISOString() }, movement);
    data.inventoryMovements.unshift(payload);
    addAudit(data, "Registrou movimentacao de estoque", "Estoque", payload.id, "Gestao");
    write(data);
    return payload;
  }

  function reset() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(CART_KEY);
    return seeded();
  }

  window.HuskyStore = {
    read,
    write,
    reset,
    money,
    dateTime,
    uid,
    getCart,
    setCart,
    clearCart,
    getProfile,
    setProfile,
    productIsAvailable,
    visibleProducts,
    categoryMatches,
    productPrice,
    deliveryInfo,
    cartTotals,
    statusMeta,
    orderSteps,
    addOrder,
    updateOrderStatus,
    cancelOrder,
    reorder,
    saveProduct,
    saveCoupon,
    addChatMessage,
    markThreadRead,
    saveAddress,
    removeAddress,
    toggleFavorite,
    isFavorite,
    addReview,
    updateSettings,
    addExpense,
    addInventoryMovement
  };
})();
