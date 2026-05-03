(function () {
  const root = document.getElementById("client-root");
  const Store = window.HuskyStore;

  const ui = {
    route: "home",
    category: "todos",
    sort: "popular",
    query: "",
    coupon: "",
    drawerOpen: false,
    productId: "",
    orderId: "",
    orderTab: "active",
    detailQty: 1,
    detailNote: "",
    toast: "",
    checkout: {
      fulfillment: "delivery",
      paymentMethod: "Pix",
      scheduledFor: "",
      note: ""
    }
  };

  const nav = [
    { id: "home", label: "Inicio", icon: "home" },
    { id: "search", label: "Buscar", icon: "search" },
    { id: "orders", label: "Pedidos", icon: "receipt-text" },
    { id: "favorites", label: "Favoritos", icon: "heart" },
    { id: "profile", label: "Perfil", icon: "user-round" }
  ];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function icon(name) {
    return `<i data-lucide="${name}"></i>`;
  }

  function route(route, extra) {
    ui.route = route;
    ui.drawerOpen = false;
    Object.assign(ui, extra || {});
    render();
  }

  function toast(message) {
    ui.toast = message;
    render();
    window.setTimeout(() => {
      if (ui.toast === message) {
        ui.toast = "";
        render();
      }
    }, 2600);
  }

  function profileAddress(data) {
    const profile = Store.getProfile();
    return data.addresses.find((item) => item.userId === profile.id && item.isDefault) || data.addresses.find((item) => item.userId === profile.id);
  }

  function productList(data, options) {
    const opts = options || {};
    const query = ui.query.trim().toLowerCase();
    let list = Store.visibleProducts(data, opts.includeUnavailable !== false).filter((product) => {
      const categoryOk = Store.categoryMatches(product, ui.category);
      const queryOk = !query || [product.name, product.description, product.tag, product.ingredients].join(" ").toLowerCase().includes(query);
      return categoryOk && queryOk;
    });
    if (opts.featured) list = list.filter((product) => product.featured);
    if (ui.sort === "price") list.sort((a, b) => Store.productPrice(a) - Store.productPrice(b));
    if (ui.sort === "new") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (ui.sort === "popular") list.sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
    return list;
  }

  function addToCart(productId, qty, note) {
    const data = Store.read();
    const product = data.products.find((item) => item.id === productId);
    if (!Store.productIsAvailable(product)) {
      toast("Esse item esta indisponivel hoje.");
      return;
    }
    const cart = Store.getCart();
    const current = cart.find((item) => item.productId === productId && (item.note || "") === (note || ""));
    if (current) {
      current.qty += Number(qty || 1);
    } else {
      cart.push({
        productId,
        name: product.name,
        price: Store.productPrice(product),
        qty: Number(qty || 1),
        image: product.image,
        note: note || "",
        addOnsTotal: 0
      });
    }
    Store.setCart(cart);
    toast(`${product.name} entrou no carrinho.`);
  }

  function updateQty(productId, delta) {
    const cart = Store.getCart()
      .map((item) => item.productId === productId ? Object.assign({}, item, { qty: item.qty + delta }) : item)
      .filter((item) => item.qty > 0);
    Store.setCart(cart);
    render();
  }

  function updateCartNote(productId, value) {
    Store.setCart(Store.getCart().map((item) => item.productId === productId ? Object.assign({}, item, { note: value }) : item));
  }

  function saveProfileFromForm(form) {
    const current = Store.getProfile();
    return Store.setProfile({
      id: current.id,
      name: form.querySelector("[name='name']")?.value.trim() || current.name,
      phone: form.querySelector("[name='phone']")?.value.trim() || current.phone,
      email: form.querySelector("[name='email']")?.value.trim() || current.email,
      birthday: form.querySelector("[name='birthday']")?.value || current.birthday,
      address: form.querySelector("[name='address']")?.value.trim() || current.address,
      neighborhood: form.querySelector("[name='neighborhood']")?.value.trim() || current.neighborhood
    });
  }

  function finishOrder(form) {
    const data = Store.read();
    const cart = Store.getCart();
    if (!cart.length) {
      toast("Seu carrinho esta vazio.");
      return;
    }

    const profile = saveProfileFromForm(form);
    const addressId = form.querySelector("[name='addressId']")?.value || "";
    const address = data.addresses.find((item) => item.id === addressId) || profileAddress(data);
    const paymentMethod = form.querySelector("[name='paymentMethod']")?.value || ui.checkout.paymentMethod;
    const fulfillment = form.querySelector("[name='fulfillment']")?.value || ui.checkout.fulfillment;
    const scheduledFor = form.querySelector("[name='scheduledFor']")?.value || "";
    const note = form.querySelector("[name='note']")?.value || "";
    const totals = Store.cartTotals(cart, data, ui.coupon, { fulfillment, address });

    if (fulfillment === "delivery" && !totals.delivery.available) {
      toast("A loja ainda nao entrega nesse bairro.");
      return;
    }
    if (totals.missingMin > 0) {
      toast(`Faltam ${Store.money(totals.missingMin)} para atingir o pedido minimo.`);
      return;
    }

    const order = Store.addOrder({
      customerId: profile.id,
      customerName: profile.name,
      phone: profile.phone,
      email: profile.email,
      neighborhood: address?.neighborhood || profile.neighborhood,
      fulfillment,
      addressId: fulfillment === "delivery" ? address?.id || "" : "",
      address: fulfillment === "delivery" && address ? `${address.street}, ${address.number} - ${address.neighborhood}` : "",
      paymentMethod,
      paymentStatus: paymentMethod === "Pix" ? "pending" : "approved",
      scheduledFor,
      subtotal: totals.subtotal,
      deliveryFee: fulfillment === "pickup" ? 0 : totals.deliveryFee,
      discount: totals.discount,
      total: fulfillment === "pickup" ? Math.max(0, totals.subtotal - totals.discount) : totals.total,
      couponCode: totals.coupon ? totals.coupon.code : "",
      note,
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        qty: item.qty,
        price: item.price,
        note: item.note || ""
      }))
    });

    Store.clearCart();
    ui.coupon = "";
    ui.orderId = order.id;
    ui.route = "success";
    ui.drawerOpen = false;
    toast(`Pedido ${order.number} enviado.`);
  }

  function sendChat(text) {
    const value = String(text || "").trim();
    if (!value) return;
    const data = Store.read();
    const orderId = ui.orderId || data.orders.find((order) => order.customerId === Store.getProfile().id)?.id || "";
    const thread = data.chatThreads.find((item) => item.orderId === orderId) || data.chatThreads[0];
    Store.addChatMessage(thread?.id || orderId || "thread-open", "customer", value);
    ui.route = "chat";
    render();
  }

  function renderNav() {
    return nav.map((item) => `
      <button class="nav-btn ${ui.route === item.id ? "active" : ""}" data-route="${item.id}">
        ${icon(item.icon)}<span>${item.label}</span>
      </button>
    `).join("");
  }

  function renderMobileNav() {
    return `
      <nav class="mobile-tabbar" aria-label="Navegacao do cliente">
        ${nav.map((item) => `
          <button class="${ui.route === item.id ? "active" : ""}" data-route="${item.id}">
            ${icon(item.icon)}<span>${item.label}</span>
          </button>
        `).join("")}
      </nav>
    `;
  }

  function renderHeader(data) {
    const profile = Store.getProfile();
    const address = profileAddress(data);
    const cart = Store.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    return `
      <header class="client-header">
        <div class="header-main">
          <strong>Ola, ${esc(profile.name.split(" ")[0] || "cliente")}</strong>
          <span>${data.settings.storeOpen ? "Aberto agora" : "Fechado"} · Entregar em: ${esc(address ? `${address.street}, ${address.number}` : profile.address)}</span>
        </div>
        <label class="searchbar">
          ${icon("search")}
          <input type="search" data-client-search value="${esc(ui.query)}" placeholder="Buscar bolos, sabores, combos..." />
        </label>
        <button class="icon-btn brand" data-open-cart aria-label="Abrir carrinho">
          ${icon("shopping-bag")}<span>${totalItems || ""}</span>
        </button>
      </header>
    `;
  }

  function renderCategories(data) {
    return `
      <div class="category-row">
        ${data.categories.filter((category) => category.active).map((category) => `
          <button class="${ui.category === category.id ? "active" : ""}" data-category="${category.id}">
            ${icon(category.icon || "circle")}<span>${esc(category.name)}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderStoreStatus(data) {
    const address = profileAddress(data);
    const delivery = Store.deliveryInfo(data, address);
    return `
      <div class="status-row">
        <span class="pill ${data.settings.storeOpen ? "success" : "danger"}">${icon(data.settings.storeOpen ? "door-open" : "door-closed")} ${data.settings.storeOpen ? "Loja aberta" : "Loja fechada"}</span>
        <span class="pill">${icon("clock")} ${esc(delivery.estimatedTime || data.settings.deliveryTime)}</span>
        <span class="pill">${icon("bike")} ${Store.money(delivery.fee)}</span>
        <span class="pill warning">${icon("megaphone")} ${esc(data.settings.announcement)}</span>
      </div>
    `;
  }

  function renderProductCard(product, data) {
    const available = Store.productIsAvailable(product);
    const favorite = Store.isFavorite(data, product.id);
    return `
      <article class="product-card ${available ? "" : "disabled"}">
        <button class="product-media" data-product="${product.id}" aria-label="Abrir ${esc(product.name)}">
          <img src="${esc(product.image)}" alt="${esc(product.name)}">
        </button>
        <div class="product-body">
          <div class="product-top">
            <div>
              <button class="product-title link-title" data-product="${product.id}">${esc(product.name)}</button>
              <span class="mini-pill">${available ? esc(product.tag || "Husky") : "Indisponivel"}</span>
            </div>
            <button class="icon-btn" data-favorite="${product.id}" aria-label="Favoritar">${icon(favorite ? "heart" : "heart-plus")}</button>
          </div>
          <p class="product-desc">${esc(product.description)}</p>
          <div class="product-foot">
            <div>
              <span class="price">${Store.money(Store.productPrice(product))}</span>
              ${product.promotionalPrice ? `<small class="old-price">${Store.money(product.price)}</small>` : ""}
            </div>
            <button class="icon-btn brand" data-add="${product.id}" ${available ? "" : "disabled"} aria-label="Adicionar ${esc(product.name)}">${icon("plus")}</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts(data, products) {
    if (!products.length) {
      return `<div class="cart-empty"><div><strong>Nenhum item encontrado.</strong><p>Teste outra busca, categoria ou ordenacao.</p></div></div>`;
    }
    return `<div class="product-grid">${products.map((product) => renderProductCard(product, data)).join("")}</div>`;
  }

  function renderHome(data) {
    const banner = data.marketingBanners.find((item) => item.active) || data.marketingBanners[0];
    return `
      <section class="hero-strip">
        <div class="hero-copy">
          <span class="eyebrow">Delivery proprio Husky</span>
          <h1>${esc(banner?.title || "Husky Confeiteiro")}</h1>
          <p>${esc(banner?.subtitle || "Escolha, acompanhe, converse com a loja e peca de novo em poucos toques.")}</p>
          ${renderStoreStatus(data)}
          <div class="hero-actions">
            <button class="btn brand" data-route="search">${icon("utensils")} Ver cardapio</button>
            <button class="btn berry" data-route="coupons">${icon("ticket")} Cupons</button>
          </div>
        </div>
        <div class="hero-image"><img src="${esc(banner?.image || "assets/husky/hero.png")}" alt="Banner Husky"></div>
      </section>
      <section>
        <div class="section-head">
          <div><h2>Categorias</h2><p>Filtre por bolos, combos, promocoes e novidades.</p></div>
        </div>
        ${renderCategories(data)}
      </section>
      <section>
        <div class="section-head">
          <div><h2>Destaques</h2><p>Os sabores que mais saem hoje.</p></div>
          <button class="btn light" data-route="search">${icon("arrow-right")} Buscar mais</button>
        </div>
        ${renderProducts(data, productList(data, { featured: true, includeUnavailable: true }).slice(0, 4))}
      </section>
      <section>
        <div class="section-head">
          <div><h2>Promocoes</h2><p>Cupons e combos ativos.</p></div>
        </div>
        ${renderCoupons(data, true)}
      </section>
      <section>
        <div class="section-head">
          <div><h2>Instagram</h2><p>Campanhas e bastidores conectados ao perfil.</p></div>
          <a class="btn light" href="${esc(data.settings.instagramUrl)}" target="_blank" rel="noreferrer">${icon("instagram")} @${esc(data.settings.instagramHandle)}</a>
        </div>
        ${renderInstagram(data)}
      </section>
    `;
  }

  function renderSearch(data) {
    return `
      <section>
        <div class="section-head">
          <div><h2>Buscar</h2><p>Filtro por categoria, disponibilidade, preco, popularidade ou novidade.</p></div>
          <label class="field compact-field"><span>Ordenar</span>
            <select data-sort>
              <option value="popular" ${ui.sort === "popular" ? "selected" : ""}>Popularidade</option>
              <option value="price" ${ui.sort === "price" ? "selected" : ""}>Preco</option>
              <option value="new" ${ui.sort === "new" ? "selected" : ""}>Novidade</option>
            </select>
          </label>
        </div>
        ${renderCategories(data)}
        ${renderProducts(data, productList(data, { includeUnavailable: true }))}
      </section>
    `;
  }

  function renderProduct(data) {
    const product = data.products.find((item) => item.id === ui.productId) || data.products[0];
    const available = Store.productIsAvailable(product);
    return `
      <section class="detail-layout">
        <div class="detail-image"><img src="${esc(product.image)}" alt="${esc(product.name)}"></div>
        <div class="panel detail-panel">
          <button class="btn light" data-route="search">${icon("arrow-left")} Voltar</button>
          <span class="mini-pill" style="margin-top:14px">${available ? esc(product.tag) : "Indisponivel hoje"}</span>
          <h2>${esc(product.name)}</h2>
          <p class="lead">${esc(product.description)}</p>
          <div class="info-grid">
            <div><small>Tamanho</small><strong>${esc(product.size)}</strong></div>
            <div><small>Peso</small><strong>${esc(product.weight)}</strong></div>
            <div><small>Preparo</small><strong>${product.prepTime} min</strong></div>
            <div><small>Preco</small><strong>${Store.money(Store.productPrice(product))}</strong></div>
          </div>
          <div class="notice"><strong>Ingredientes:</strong> ${esc(product.ingredients)}</div>
          <div class="notice warning"><strong>Alergicos:</strong> ${esc(product.allergens)}</div>
          <div class="qty-row">
            <button class="icon-btn" data-detail-minus>${icon("minus")}</button>
            <strong>${ui.detailQty}</strong>
            <button class="icon-btn" data-detail-plus>${icon("plus")}</button>
          </div>
          <label class="field">
            <span>Observacao</span>
            <textarea data-detail-note placeholder="Ex: mandar bem gelado, sem muito recheio...">${esc(ui.detailNote)}</textarea>
          </label>
          <button class="btn brand full" data-add-detail="${product.id}" ${available ? "" : "disabled"}>${icon("shopping-bag")} Adicionar ao carrinho</button>
        </div>
      </section>
    `;
  }

  function renderCart(data, mode) {
    const cart = Store.getCart();
    const address = profileAddress(data);
    const totals = Store.cartTotals(cart, data, ui.coupon, { fulfillment: ui.checkout.fulfillment, address });
    if (!cart.length) {
      return `
        <div class="section-head"><div><h2>Meu carrinho</h2><p>Seu pedido aparece aqui.</p></div>${mode === "drawer" ? `<button class="icon-btn" data-close-cart>${icon("x")}</button>` : ""}</div>
        <div class="cart-empty"><div>${icon("shopping-bag")}<strong>Carrinho vazio</strong><p>Adicione uma docura para continuar.</p></div></div>
      `;
    }
    return `
      <div class="section-head">
        <div><h2>Meu carrinho</h2><p>${cart.reduce((sum, item) => sum + item.qty, 0)} itens escolhidos.</p></div>
        ${mode === "drawer" ? `<button class="icon-btn" data-close-cart>${icon("x")}</button>` : ""}
      </div>
      <div class="cart-list">
        ${cart.map((item) => `
          <div class="cart-item">
            <div>
              <strong>${item.qty}x ${esc(item.name)}</strong>
              <span>${Store.money(item.price)} · ${Store.money(item.price * item.qty)}</span>
              <input data-note="${esc(item.productId)}" value="${esc(item.note || "")}" placeholder="Observacao do item">
            </div>
            <div class="qty">
              <button data-qty="${esc(item.productId)}" data-delta="-1">-</button>
              <strong>${item.qty}</strong>
              <button data-qty="${esc(item.productId)}" data-delta="1">+</button>
            </div>
          </div>
        `).join("")}
      </div>
      <label class="field" style="margin-top:12px"><span>Observacao geral</span><textarea data-order-note>${esc(ui.checkout.note)}</textarea></label>
      <div class="coupon-line">
        <div class="field"><input data-coupon-input value="${esc(ui.coupon)}" placeholder="Inserir cupom" /></div>
        <button class="btn light" data-apply-coupon>${icon("ticket")} Aplicar</button>
      </div>
      ${totals.couponMessage ? `<p class="notice success">${esc(totals.couponMessage)}</p>` : ""}
      ${totals.missingMin > 0 ? `<p class="notice warning">Faltam ${Store.money(totals.missingMin)} para atingir o pedido minimo.</p>` : ""}
      <div class="summary-lines">
        <div class="summary-line"><span>Subtotal</span><strong>${Store.money(totals.subtotal)}</strong></div>
        <div class="summary-line"><span>Taxa de entrega</span><strong>${Store.money(totals.deliveryFee)}</strong></div>
        <div class="summary-line"><span>Desconto</span><strong>${Store.money(totals.discount)}</strong></div>
        <div class="summary-total"><span>Total</span><strong>${Store.money(totals.total)}</strong></div>
      </div>
      <button class="btn brand full" style="margin-top:14px" data-route="checkout" ${totals.missingMin > 0 ? "disabled" : ""}>${icon("arrow-right")} Continuar</button>
    `;
  }

  function renderCartFab(data) {
    const cart = Store.getCart();
    if (!cart.length) return "";
    const totals = Store.cartTotals(cart, data, ui.coupon, { fulfillment: ui.checkout.fulfillment, address: profileAddress(data) });
    return `
      <button class="cart-fab" data-open-cart>
        <span>${icon("shopping-bag")} ${cart.reduce((sum, item) => sum + item.qty, 0)} itens</span>
        <strong>${Store.money(totals.total)}</strong>
      </button>
    `;
  }

  function renderCheckout(data) {
    const cart = Store.getCart();
    if (!cart.length) return `<section>${renderCart(data, "page")}</section>`;
    const profile = Store.getProfile();
    const addresses = data.addresses.filter((item) => item.userId === profile.id);
    const address = profileAddress(data);
    const totals = Store.cartTotals(cart, data, ui.coupon, { fulfillment: ui.checkout.fulfillment, address });
    return `
      <section>
        <div class="section-head">
          <div><h2>Checkout</h2><p>Identificacao, endereco, entrega, pagamento e confirmacao.</p></div>
        </div>
        <form class="checkout-grid" data-checkout-form>
          <div class="panel form-grid">
            <h3 class="field full">Login ou cadastro rapido</h3>
            <label class="field"><span>Nome completo</span><input name="name" required value="${esc(profile.name)}"></label>
            <label class="field"><span>Telefone / WhatsApp</span><input name="phone" required value="${esc(profile.phone)}"></label>
            <label class="field"><span>E-mail</span><input name="email" value="${esc(profile.email)}"></label>
            <label class="field"><span>Nascimento opcional</span><input name="birthday" type="date" value="${esc(profile.birthday || "")}"></label>
            <label class="field full"><span>Endereco livre</span><input name="address" value="${esc(profile.address)}"></label>
            <label class="field"><span>Bairro</span><input name="neighborhood" value="${esc(profile.neighborhood)}"></label>
            <label class="field"><span>Endereco salvo</span><select name="addressId">${addresses.map((item) => `<option value="${item.id}" ${item.id === address?.id ? "selected" : ""}>${esc(item.label)} · ${esc(item.neighborhood)}</option>`).join("")}</select></label>
            <label class="field"><span>Tipo</span><select name="fulfillment" data-fulfillment-select>
              <option value="delivery" ${ui.checkout.fulfillment === "delivery" ? "selected" : ""}>Entrega</option>
              <option value="pickup" ${ui.checkout.fulfillment === "pickup" ? "selected" : ""}>Retirada</option>
              <option value="scheduled" ${ui.checkout.fulfillment === "scheduled" ? "selected" : ""}>Agendamento</option>
            </select></label>
            <label class="field"><span>Agendar para</span><input name="scheduledFor" type="datetime-local" value="${esc(ui.checkout.scheduledFor)}"></label>
            <label class="field"><span>Pagamento</span><select name="paymentMethod">
              ${["Pix", "Cartao online", "Cartao na entrega", "Dinheiro", "Saldo Husky"].map((item) => `<option ${ui.checkout.paymentMethod === item ? "selected" : ""}>${item}</option>`).join("")}
            </select></label>
            <label class="field full"><span>Observacoes do pedido</span><textarea name="note">${esc(ui.checkout.note)}</textarea></label>
          </div>
          <aside class="panel summary">
            <h3>Resumo do pedido</h3>
            <div class="cart-list">${cart.map((item) => `<div class="summary-line"><span>${item.qty}x ${esc(item.name)}</span><strong>${Store.money(item.price * item.qty)}</strong></div>`).join("")}</div>
            <div class="coupon-line">
              <div class="field"><input data-coupon-input value="${esc(ui.coupon)}" placeholder="Cupom" /></div>
              <button class="btn light" type="button" data-apply-coupon>${icon("ticket")} Aplicar</button>
            </div>
            ${totals.delivery.available ? `<p class="notice success">${esc(totals.delivery.message)} Prazo: ${esc(totals.delivery.estimatedTime)}.</p>` : `<p class="notice warning">Entrega indisponivel para esse bairro.</p>`}
            <div class="summary-lines">
              <div class="summary-line"><span>Subtotal</span><strong>${Store.money(totals.subtotal)}</strong></div>
              <div class="summary-line"><span>Entrega</span><strong>${Store.money(totals.deliveryFee)}</strong></div>
              <div class="summary-line"><span>Desconto</span><strong>${Store.money(totals.discount)}</strong></div>
              <div class="summary-total"><span>Total final</span><strong>${Store.money(totals.total)}</strong></div>
            </div>
            <button class="btn brand full" type="submit">${icon("check-circle-2")} Finalizar pedido</button>
          </aside>
        </form>
      </section>
    `;
  }

  function renderSuccess(data) {
    const order = data.orders.find((item) => item.id === ui.orderId) || data.orders[0];
    const meta = Store.statusMeta(data, order.status);
    return `
      <section class="success-panel">
        <div class="panel success-card">
          <img src="assets/husky/mascote.png" alt="Mascote Husky">
          <span class="pill success">${icon("check-circle-2")} Pedido enviado</span>
          <h2>Seu pedido foi recebido pela Husky Confeiteiro.</h2>
          <p>Numero do pedido: <strong>${esc(order.number)}</strong></p>
          <p>Previsao: <strong>${Store.dateTime(order.estimatedDeliveryTime)}</strong></p>
          <p>Status atual: <strong>${esc(meta.clientLabel)}</strong></p>
          <div class="toolbar">
            <button class="btn brand" data-track="${order.id}">${icon("map-pin")} Ver acompanhamento</button>
            <button class="btn light" data-chat-order="${order.id}">${icon("message-circle")} Enviar mensagem</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderOrders(data) {
    const profile = Store.getProfile();
    const all = data.orders.filter((order) => order.customerId === profile.id || order.phone === profile.phone);
    const filtered = all.filter((order) => {
      if (ui.orderTab === "done") return ["delivered", "completed"].includes(order.status);
      if (ui.orderTab === "cancelled") return ["cancelled", "refused", "refunded"].includes(order.status);
      return !["delivered", "completed", "cancelled", "refused", "refunded"].includes(order.status);
    });
    return `
      <section>
        <div class="section-head"><div><h2>Meus pedidos</h2><p>Historico, acompanhamento, ajuda e repetir pedido.</p></div></div>
        <div class="tabs">
          <button class="${ui.orderTab === "active" ? "active" : ""}" data-order-tab="active">Em andamento</button>
          <button class="${ui.orderTab === "done" ? "active" : ""}" data-order-tab="done">Concluidos</button>
          <button class="${ui.orderTab === "cancelled" ? "active" : ""}" data-order-tab="cancelled">Cancelados</button>
        </div>
        <div class="order-list">
          ${filtered.length ? filtered.map((order) => renderOrderCard(order, data)).join("") : `<div class="cart-empty"><div><strong>Nenhum pedido aqui.</strong><p>Quando existir pedido nessa aba, ele aparece aqui.</p></div></div>`}
        </div>
      </section>
    `;
  }

  function renderOrderCard(order, data) {
    const meta = Store.statusMeta(data, order.status);
    return `
      <article class="order-card">
        <div class="order-head">
          <div>
            <h3>Pedido ${esc(order.number)}</h3>
            <p class="product-desc">${Store.dateTime(order.createdAt)} · ${order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</p>
          </div>
          <span class="status ${esc(meta.tone || order.status)}">${esc(meta.clientLabel)}</span>
        </div>
        <div class="order-meta">
          <span class="pill">${icon("package")} ${order.items.length} itens</span>
          <span class="pill">${icon("banknote")} ${Store.money(order.total)}</span>
          <span class="pill">${icon(order.fulfillment === "pickup" ? "store" : "bike")} ${order.fulfillment === "pickup" ? "Retirada" : "Entrega"}</span>
        </div>
        <div class="toolbar" style="margin-top:12px">
          <button class="btn light" data-track="${order.id}">${icon("map-pin")} Ver pedido</button>
          <button class="btn light" data-reorder="${order.id}">${icon("rotate-ccw")} Pedir de novo</button>
          <button class="btn light" data-help-order="${order.id}">${icon("circle-help")} Ajuda</button>
          ${["delivered", "completed"].includes(order.status) ? `<button class="btn brand" data-review-order="${order.id}">${icon("star")} Avaliar</button>` : ""}
        </div>
      </article>
    `;
  }

  function renderTracking(data) {
    const order = data.orders.find((item) => item.id === ui.orderId) || data.orders[0];
    const steps = Store.orderSteps(order);
    const currentIndex = steps.indexOf(order.status);
    return `
      <section>
        <div class="section-head">
          <div><h2>Pedido ${esc(order.number)}</h2><p>Chega entre ${Store.dateTime(order.estimatedDeliveryTime)} e alguns minutos depois, conforme rota.</p></div>
          <button class="btn light" data-route="orders">${icon("arrow-left")} Voltar</button>
        </div>
        <div class="profile-grid">
          <div class="panel">
            <h3>Acompanhamento</h3>
            <div class="timeline big-timeline">
              ${steps.map((status, index) => {
                const meta = Store.statusMeta(data, status);
                const done = index <= currentIndex || order.history.some((item) => item.status === status);
                return `<div class="timeline-item ${done ? "done" : ""}"><span class="timeline-dot"></span><span>${esc(meta.clientLabel)}</span></div>`;
              }).join("")}
            </div>
            <div class="toolbar" style="margin-top:14px">
              <button class="btn brand" data-chat-order="${order.id}">${icon("message-circle")} Conversar com a loja</button>
              <button class="btn light" data-help-order="${order.id}">${icon("circle-help")} Ajuda com o pedido</button>
              ${order.status === "pending" ? `<button class="danger-btn" data-cancel-order="${order.id}">${icon("ban")} Cancelar</button>` : ""}
            </div>
          </div>
          <aside class="panel">
            <h3>Resumo</h3>
            <div class="stack">
              ${order.items.map((item) => `<div class="summary-line"><span>${item.qty}x ${esc(item.name)}</span><strong>${Store.money(item.price * item.qty)}</strong></div>`).join("")}
            </div>
            <div class="summary-lines">
              <div class="summary-line"><span>Pagamento</span><strong>${esc(order.paymentMethod)} · ${esc(order.paymentStatus)}</strong></div>
              <div class="summary-line"><span>Entrega</span><strong>${order.fulfillment === "pickup" ? "Retirada" : esc(order.address)}</strong></div>
              <div class="summary-total"><span>Total</span><strong>${Store.money(order.total)}</strong></div>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  function renderChat(data) {
    const orderId = ui.orderId || data.orders.find((order) => order.customerId === Store.getProfile().id)?.id || "";
    const thread = data.chatThreads.find((item) => item.orderId === orderId) || data.chatThreads[0];
    return `
      <section>
        <div class="section-head">
          <div><h2>Chat com a loja</h2><p>Suporte centralizado no pedido.</p></div>
          <a class="btn light" href="https://wa.me/${esc(data.settings.whatsapp)}" target="_blank" rel="noreferrer">${icon("phone")} WhatsApp</a>
        </div>
        <div class="chat-layout">
          <div class="message-panel">
            <div class="message-head"><strong>${thread?.orderId ? "Pedido vinculado" : "Atendimento Husky"}</strong><span class="status open">Online</span></div>
            <div class="message-body">
              ${(thread?.messages || []).map((message) => `
                <div class="bubble ${message.from === "customer" ? "customer" : "store"}">${esc(message.text)}<small>${Store.dateTime(message.createdAt)}</small></div>
              `).join("")}
            </div>
            <div class="quick-row" style="padding:12px 12px 0">
              ${["Prazo do pedido", "Quais sabores tem hoje?", "Preciso alterar endereco", "Problema com pagamento"].map((text) => `<button data-quick-chat="${esc(text)}">${esc(text)}</button>`).join("")}
            </div>
            <form class="message-compose" data-chat-form>
              <input name="message" placeholder="Escreva sua mensagem" autocomplete="off">
              <button class="icon-btn brand" aria-label="Enviar">${icon("send")}</button>
            </form>
          </div>
          <aside class="panel">
            <h3>Ajuda rapida</h3>
            <div class="stack">
              ${data.helpTopics.slice(0, 4).map((topic) => `<button class="btn light full" data-help-topic="${topic.id}">${icon("circle-help")} ${esc(topic.title)}</button>`).join("")}
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  function renderFavorites(data) {
    const profile = Store.getProfile();
    const favoriteIds = data.favorites.filter((item) => item.userId === profile.id).map((item) => item.productId);
    const products = data.products.filter((product) => favoriteIds.includes(product.id));
    return `
      <section>
        <div class="section-head"><div><h2>Meus favoritos</h2><p>Receba alerta quando favorito entrar em promocao ou voltar ao estoque.</p></div></div>
        ${renderProducts(data, products)}
      </section>
    `;
  }

  function renderCoupons(data, compact) {
    const cards = data.coupons.filter((coupon) => coupon.active).map((coupon) => `
      <article class="panel coupon-card">
        <span class="mini-pill">${esc(coupon.code)}</span>
        <h3>${esc(coupon.title)}</h3>
        <p class="product-desc">${esc(coupon.description)}</p>
        <div class="summary-line"><span>Pedido minimo</span><strong>${Store.money(coupon.minSubtotal)}</strong></div>
        <button class="btn light full" data-use-coupon="${esc(coupon.code)}">${icon("copy")} Usar cupom</button>
      </article>
    `).join("");
    return `<div class="coupon-grid ${compact ? "compact-grid" : ""}">${cards}</div>`;
  }

  function renderCouponsPage(data) {
    return `
      <section>
        <div class="section-head"><div><h2>Cupons e promocoes</h2><p>Frete gratis, primeira compra, aniversario e combos.</p></div></div>
        ${renderCoupons(data)}
      </section>
    `;
  }

  function renderInstagram(data) {
    return `
      <div class="instagram-grid">
        ${data.instagramPosts.map((post) => `
          <article class="ig-card">
            <img src="${esc(post.image)}" alt="${esc(post.title)}">
            <div><span class="mini-pill">${esc(post.type)} · ${esc(post.status)}</span><h3>${esc(post.title)}</h3><p>${esc(post.caption)}</p></div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderAddresses(data) {
    const profile = Store.getProfile();
    const addresses = data.addresses.filter((item) => item.userId === profile.id);
    return `
      <section>
        <div class="section-head"><div><h2>Meus enderecos</h2><p>Adicione, edite e marque o endereco padrao.</p></div></div>
        <div class="profile-grid">
          <div class="stack">
            ${addresses.map((address) => `
              <article class="panel address-card">
                <span class="mini-pill">${address.isDefault ? "Padrao" : esc(address.label)}</span>
                <h3>${esc(address.street)}, ${esc(address.number)}</h3>
                <p class="product-desc">${esc(address.complement || "")} ${esc(address.neighborhood)} · ${esc(address.city)}-${esc(address.state)}</p>
                <p class="notice">${esc(Store.deliveryInfo(data, address).message)} Taxa ${Store.money(Store.deliveryInfo(data, address).fee)}.</p>
                <div class="toolbar">
                  <button class="btn light" data-default-address="${address.id}">${icon("map-pin")} Padrao</button>
                  <button class="danger-btn" data-remove-address="${address.id}">${icon("trash-2")} Remover</button>
                </div>
              </article>
            `).join("")}
          </div>
          <form class="panel form-grid" data-address-form>
            <h3 class="field full">Adicionar endereco</h3>
            <label class="field"><span>Tipo</span><select name="label"><option>Casa</option><option>Trabalho</option><option>Outro</option></select></label>
            <label class="field"><span>CEP</span><input name="zipcode" placeholder="00000-000"></label>
            <label class="field full"><span>Rua</span><input name="street" required></label>
            <label class="field"><span>Numero</span><input name="number" required></label>
            <label class="field"><span>Complemento</span><input name="complement"></label>
            <label class="field"><span>Bairro</span><input name="neighborhood" required></label>
            <label class="field"><span>Cidade</span><input name="city" value="${esc(data.settings.city)}"></label>
            <label class="field"><span>Estado</span><input name="state" value="SP"></label>
            <label class="field full"><span>Referencia</span><input name="reference"></label>
            <label class="field"><span>Padrao</span><select name="isDefault"><option value="true">Sim</option><option value="false">Nao</option></select></label>
            <button class="btn brand full" type="submit">${icon("save")} Salvar endereco</button>
          </form>
        </div>
      </section>
    `;
  }

  function renderNotifications(data) {
    const profile = Store.getProfile();
    const list = data.notifications.filter((item) => item.userId === profile.id || item.userId === "u-demo");
    return `
      <section>
        <div class="section-head"><div><h2>Notificacoes</h2><p>Pedido, chat, cupons, favoritos e loja aberta.</p></div></div>
        <div class="stack">${list.map((item) => `
          <article class="panel notification-card">
            <span class="mini-pill">${esc(item.type)}</span>
            <h3>${esc(item.title)}</h3>
            <p class="product-desc">${esc(item.message)}</p>
            <small>${Store.dateTime(item.createdAt)}</small>
          </article>
        `).join("")}</div>
      </section>
    `;
  }

  function renderHelp(data) {
    const order = data.orders.find((item) => item.id === ui.orderId);
    return `
      <section>
        <div class="section-head"><div><h2>Central de ajuda</h2><p>${order ? `Ajuda vinculada ao pedido ${order.number}.` : "Escolha o assunto e fale com a loja."}</p></div></div>
        <div class="coupon-grid">
          ${data.helpTopics.map((topic) => `
            <article class="panel coupon-card">
              <span class="mini-pill">${icon("circle-help")} Ajuda</span>
              <h3>${esc(topic.title)}</h3>
              <p class="product-desc">${esc(topic.description)}</p>
              <button class="btn brand full" data-quick-chat="${esc(topic.title)}">${icon("message-circle")} Falar com a loja</button>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderReview(data) {
    const order = data.orders.find((item) => item.id === ui.orderId) || data.orders[0];
    return `
      <section>
        <div class="section-head"><div><h2>Avaliar pedido</h2><p>Pedido ${esc(order.number)}.</p></div></div>
        <form class="panel form-grid" data-review-form>
          <label class="field"><span>Nota geral</span><select name="rating">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n} estrelas</option>`).join("")}</select></label>
          <label class="field"><span>Produto</span><select name="productRating">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n}</option>`).join("")}</select></label>
          <label class="field"><span>Entrega</span><select name="deliveryRating">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n}</option>`).join("")}</select></label>
          <label class="field"><span>Atendimento</span><select name="serviceRating">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n}</option>`).join("")}</select></label>
          <label class="field full"><span>Comentario</span><textarea name="comment" placeholder="O pedido chegou bem? Voce pediria novamente?"></textarea></label>
          <button class="btn brand full" type="submit">${icon("star")} Enviar avaliacao</button>
        </form>
      </section>
    `;
  }

  function renderProfile(data) {
    const profile = Store.getProfile();
    const orders = data.orders.filter((order) => order.customerId === profile.id || order.phone === profile.phone);
    const spent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return `
      <section>
        <div class="section-head"><div><h2>Perfil</h2><p>Dados, enderecos, cupons, favoritos, notificacoes e ajuda.</p></div></div>
        <div class="profile-grid">
          <form class="panel form-grid" data-profile-form>
            <h3 class="field full">Meus dados</h3>
            <label class="field"><span>Nome</span><input name="name" value="${esc(profile.name)}"></label>
            <label class="field"><span>Telefone</span><input name="phone" value="${esc(profile.phone)}"></label>
            <label class="field"><span>E-mail</span><input name="email" value="${esc(profile.email)}"></label>
            <label class="field"><span>Nascimento</span><input name="birthday" type="date" value="${esc(profile.birthday || "")}"></label>
            <label class="field full"><span>Endereco principal</span><input name="address" value="${esc(profile.address)}"></label>
            <label class="field"><span>Bairro</span><input name="neighborhood" value="${esc(profile.neighborhood)}"></label>
            <button class="btn brand full" type="submit">${icon("save")} Salvar perfil</button>
          </form>
          <aside class="panel">
            <h3>Clube Husky</h3>
            <div class="metric-grid" style="grid-template-columns:1fr 1fr">
              <div class="metric"><span>Pontos</span><strong>${Math.floor(spent)}</strong><span>1 ponto por real</span></div>
              <div class="metric"><span>Pedidos</span><strong>${orders.length}</strong><span>${esc(data.settings.loyaltyRule)}</span></div>
            </div>
            <div class="stack" style="margin-top:14px">
              <button class="btn light full" data-route="addresses">${icon("map-pin")} Meus enderecos</button>
              <button class="btn light full" data-route="coupons">${icon("ticket")} Meus cupons</button>
              <button class="btn light full" data-route="favorites">${icon("heart")} Favoritos</button>
              <button class="btn light full" data-route="notifications">${icon("bell")} Notificacoes</button>
              <button class="btn light full" data-route="help">${icon("circle-help")} Central de ajuda</button>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  function renderRoute(data) {
    if (ui.route === "search") return renderSearch(data);
    if (ui.route === "product") return renderProduct(data);
    if (ui.route === "cart") return renderCart(data, "page");
    if (ui.route === "checkout") return renderCheckout(data);
    if (ui.route === "success") return renderSuccess(data);
    if (ui.route === "orders") return renderOrders(data);
    if (ui.route === "tracking") return renderTracking(data);
    if (ui.route === "chat") return renderChat(data);
    if (ui.route === "favorites") return renderFavorites(data);
    if (ui.route === "coupons") return renderCouponsPage(data);
    if (ui.route === "addresses") return renderAddresses(data);
    if (ui.route === "notifications") return renderNotifications(data);
    if (ui.route === "help") return renderHelp(data);
    if (ui.route === "review") return renderReview(data);
    if (ui.route === "profile") return renderProfile(data);
    return renderHome(data);
  }

  function bind() {
    root.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", () => route(button.dataset.route));
    });
    root.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.category = button.dataset.category;
        route("search");
      });
    });
    root.querySelector("[data-client-search]")?.addEventListener("input", (event) => {
      ui.query = event.target.value;
      ui.route = "search";
      render();
      window.requestAnimationFrame(() => {
        const search = root.querySelector("[data-client-search]");
        if (search) {
          search.focus();
          search.setSelectionRange(search.value.length, search.value.length);
        }
      });
    });
    root.querySelector("[data-sort]")?.addEventListener("change", (event) => {
      ui.sort = event.target.value;
      render();
    });
    root.querySelectorAll("[data-product]").forEach((button) => {
      button.addEventListener("click", () => {
        ui.detailQty = 1;
        ui.detailNote = "";
        route("product", { productId: button.dataset.product });
      });
    });
    root.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.add, 1, "")));
    root.querySelector("[data-detail-minus]")?.addEventListener("click", () => {
      ui.detailQty = Math.max(1, ui.detailQty - 1);
      render();
    });
    root.querySelector("[data-detail-plus]")?.addEventListener("click", () => {
      ui.detailQty += 1;
      render();
    });
    root.querySelector("[data-detail-note]")?.addEventListener("input", (event) => {
      ui.detailNote = event.target.value;
    });
    root.querySelector("[data-add-detail]")?.addEventListener("click", (event) => addToCart(event.currentTarget.dataset.addDetail, ui.detailQty, ui.detailNote));
    root.querySelectorAll("[data-favorite]").forEach((button) => {
      button.addEventListener("click", () => {
        const added = Store.toggleFavorite(button.dataset.favorite);
        toast(added ? "Produto favoritado." : "Favorito removido.");
      });
    });
    root.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", () => { ui.drawerOpen = true; render(); }));
    root.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", () => { ui.drawerOpen = false; render(); }));
    root.querySelectorAll("[data-qty]").forEach((button) => button.addEventListener("click", () => updateQty(button.dataset.qty, Number(button.dataset.delta))));
    root.querySelectorAll("[data-note]").forEach((input) => input.addEventListener("change", () => updateCartNote(input.dataset.note, input.value)));
    root.querySelectorAll("[data-order-note]").forEach((textarea) => textarea.addEventListener("change", () => { ui.checkout.note = textarea.value; }));
    root.querySelectorAll("[data-apply-coupon]").forEach((button) => {
      button.addEventListener("click", () => {
        const scope = button.closest(".client-cart, .drawer-panel, .panel, section") || root;
        ui.coupon = (scope.querySelector("[data-coupon-input]")?.value || "").trim().toUpperCase();
        render();
      });
    });
    root.querySelectorAll("[data-use-coupon]").forEach((button) => button.addEventListener("click", () => {
      ui.coupon = button.dataset.useCoupon;
      toast(`Cupom ${ui.coupon} aplicado ao carrinho.`);
    }));
    root.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      finishOrder(event.currentTarget);
    });
    root.querySelector("[data-fulfillment-select]")?.addEventListener("change", (event) => {
      ui.checkout.fulfillment = event.target.value;
      render();
    });
    root.querySelectorAll("[data-track]").forEach((button) => button.addEventListener("click", () => route("tracking", { orderId: button.dataset.track })));
    root.querySelectorAll("[data-chat-order]").forEach((button) => button.addEventListener("click", () => route("chat", { orderId: button.dataset.chatOrder })));
    root.querySelectorAll("[data-help-order]").forEach((button) => button.addEventListener("click", () => route("help", { orderId: button.dataset.helpOrder })));
    root.querySelectorAll("[data-review-order]").forEach((button) => button.addEventListener("click", () => route("review", { orderId: button.dataset.reviewOrder })));
    root.querySelectorAll("[data-reorder]").forEach((button) => {
      button.addEventListener("click", () => {
        const result = Store.reorder(button.dataset.reorder);
        route("cart");
        toast(result.missing.length ? `Alguns itens indisponiveis: ${result.missing.join(", ")}.` : "Carrinho recriado.");
      });
    });
    root.querySelectorAll("[data-order-tab]").forEach((button) => button.addEventListener("click", () => { ui.orderTab = button.dataset.orderTab; render(); }));
    root.querySelectorAll("[data-cancel-order]").forEach((button) => button.addEventListener("click", () => {
      Store.cancelOrder(button.dataset.cancelOrder, "Cancelamento solicitado pelo cliente");
      toast("Solicitacao registrada.");
    }));
    root.querySelector("[data-chat-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector("[name='message']");
      sendChat(input.value);
    });
    root.querySelectorAll("[data-quick-chat]").forEach((button) => button.addEventListener("click", () => sendChat(button.dataset.quickChat)));
    root.querySelectorAll("[data-help-topic]").forEach((button) => button.addEventListener("click", () => route("help")));
    root.querySelector("[data-profile-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      saveProfileFromForm(event.currentTarget);
      toast("Perfil salvo.");
    });
    root.querySelector("[data-address-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      Store.saveAddress({
        label: form.querySelector("[name='label']").value,
        zipcode: form.querySelector("[name='zipcode']").value,
        street: form.querySelector("[name='street']").value,
        number: form.querySelector("[name='number']").value,
        complement: form.querySelector("[name='complement']").value,
        neighborhood: form.querySelector("[name='neighborhood']").value,
        city: form.querySelector("[name='city']").value,
        state: form.querySelector("[name='state']").value,
        reference: form.querySelector("[name='reference']").value,
        isDefault: form.querySelector("[name='isDefault']").value === "true"
      });
      toast("Endereco salvo.");
    });
    root.querySelectorAll("[data-default-address]").forEach((button) => button.addEventListener("click", () => {
      const data = Store.read();
      const address = data.addresses.find((item) => item.id === button.dataset.defaultAddress);
      if (address) Store.saveAddress(Object.assign({}, address, { isDefault: true }));
      toast("Endereco padrao atualizado.");
    }));
    root.querySelectorAll("[data-remove-address]").forEach((button) => button.addEventListener("click", () => {
      Store.removeAddress(button.dataset.removeAddress);
      toast("Endereco removido.");
    }));
    root.querySelector("[data-review-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      Store.addReview({
        orderId: ui.orderId,
        rating: Number(form.querySelector("[name='rating']").value),
        productRating: Number(form.querySelector("[name='productRating']").value),
        deliveryRating: Number(form.querySelector("[name='deliveryRating']").value),
        serviceRating: Number(form.querySelector("[name='serviceRating']").value),
        comment: form.querySelector("[name='comment']").value
      });
      route("orders");
      toast("Avaliacao enviada.");
    });
  }

  function render() {
    const data = Store.read();
    root.innerHTML = `
      <div class="client-shell">
        <aside class="client-sidebar">
          <div class="brand">
            <img src="assets/husky/logo.png" alt="Husky Confeitaria">
            <div><strong>${esc(data.settings.brandName)}</strong><span>${esc(data.settings.city)}</span></div>
          </div>
          <nav class="nav-list">${renderNav()}</nav>
          <div class="side-block"><small>Funcionamento</small><strong>${data.settings.storeOpen ? "Aberta" : "Fechada"}</strong><span class="product-desc">${esc(data.settings.announcement)}</span></div>
          <div class="side-block"><small>Instagram</small><strong>@${esc(data.settings.instagramHandle)}</strong><a class="btn light full" style="margin-top:12px" href="${esc(data.settings.instagramUrl)}" target="_blank" rel="noreferrer">${icon("instagram")} Abrir perfil</a></div>
        </aside>
        <main class="client-main">
          ${renderHeader(data)}
          <div class="client-content">${renderRoute(data)}</div>
        </main>
        <aside class="client-cart">${renderCart(data, "side")}</aside>
      </div>
      ${renderMobileNav()}
      ${renderCartFab(data)}
      <div class="drawer ${ui.drawerOpen ? "open" : ""}"><div class="drawer-panel">${renderCart(data, "drawer")}</div></div>
      ${ui.toast ? `<div class="notice success" style="position:fixed;right:16px;bottom:16px;z-index:90;box-shadow:var(--shadow)">${esc(ui.toast)}</div>` : ""}
    `;
    bind();
    if (window.lucide) window.lucide.createIcons();
  }

  window.addEventListener("husky:data", render);
  window.addEventListener("husky:cart", render);
  render();
})();
