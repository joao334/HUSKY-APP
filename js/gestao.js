(function () {
  const root = document.getElementById("admin-root");
  const Store = window.HuskyStore;

  const ui = {
    route: "dashboard",
    search: "",
    statusTab: "pending",
    selectedOrderId: "",
    selectedThread: "",
    editingProductId: "",
    posCart: [],
    toast: ""
  };

  const routes = [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", group: "Operacao" },
    { id: "pedidos", label: "Pedidos", icon: "clipboard-list", group: "Operacao" },
    { id: "cozinha", label: "Cozinha", icon: "chef-hat", group: "Operacao" },
    { id: "caixa", label: "Caixa", icon: "monitor-dot", group: "Operacao" },
    { id: "chat", label: "Chat", icon: "messages-square", group: "Atendimento" },
    { id: "produtos", label: "Produtos", icon: "utensils", group: "Catalogo" },
    { id: "estoque", label: "Estoque", icon: "boxes", group: "Catalogo" },
    { id: "clientes", label: "Clientes", icon: "users", group: "Atendimento" },
    { id: "cupons", label: "Cupons", icon: "ticket", group: "Marketing" },
    { id: "marketing", label: "Marketing", icon: "megaphone", group: "Marketing" },
    { id: "entregas", label: "Entregas", icon: "bike", group: "Operacao" },
    { id: "financeiro", label: "Financeiro", icon: "chart-no-axes-combined", group: "Analise" },
    { id: "relatorios", label: "Relatorios", icon: "file-spreadsheet", group: "Analise" },
    { id: "avaliacoes", label: "Avaliacoes", icon: "star", group: "Analise" },
    { id: "config", label: "Configuracoes", icon: "settings", group: "Sistema" }
  ];

  const flow = ["pending", "accepted", "preparing", "ready", "waiting_pickup", "out_for_delivery", "delivered", "completed"];
  const nextStatus = {
    pending: "accepted",
    accepted: "preparing",
    preparing: "ready",
    ready: "out_for_delivery",
    waiting_pickup: "completed",
    out_for_delivery: "delivered",
    delivered: "completed"
  };

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

  function setRoute(route) {
    ui.route = route;
    ui.selectedOrderId = route === "pedido" ? ui.selectedOrderId : "";
    render();
  }

  function todayOrders(data) {
    const today = new Date().toDateString();
    return data.orders.filter((order) => new Date(order.createdAt).toDateString() === today);
  }

  function revenue(data) {
    return todayOrders(data).filter((order) => !["cancelled", "refused"].includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0);
  }

  function totalCost(data) {
    return data.orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => {
      const product = data.products.find((candidate) => candidate.id === item.productId);
      return itemSum + Number(product?.cost || 0) * Number(item.qty || 0);
    }, 0), 0);
  }

  function lowProductStock(data) {
    return data.products.filter((product) => Number(product.stock || 0) <= Number(product.minStock || 0));
  }

  function lowInventory(data) {
    return data.inventoryItems.filter((item) => Number(item.quantity || 0) <= Number(item.minimumQuantity || 0));
  }

  function renderSidebar(data) {
    let lastGroup = "";
    return `
      <aside class="admin-sidebar">
        <div class="brand">
          <img src="assets/husky/logo.png" alt="Husky Confeitaria">
          <div><strong>Gestao Husky</strong><span>Parceiro delivery</span></div>
        </div>
        <nav class="admin-nav">
          ${routes.map((route) => {
            const group = route.group !== lastGroup ? `<div class="admin-group">${esc(route.group)}</div>` : "";
            lastGroup = route.group;
            return `${group}<button class="${ui.route === route.id ? "active" : ""}" data-route="${route.id}">${icon(route.icon)}<span>${esc(route.label)}</span></button>`;
          }).join("")}
        </nav>
        <div class="side-block">
          <small>Status da loja</small>
          <strong>${data.settings.storeOpen ? "Aberta" : "Fechada"}</strong>
          <button class="btn light full" data-toggle-store style="margin-top:12px">${icon("power")} Alternar</button>
        </div>
      </aside>
    `;
  }

  function renderTopbar(data) {
    const route = routes.find((item) => item.id === ui.route);
    const unread = data.chatThreads.reduce((sum, thread) => sum + Number(thread.unread || 0), 0);
    return `
      <header class="admin-topbar">
        <div class="header-main">
          <strong>${esc(route?.label || "Detalhe do pedido")}</strong>
          <span>${esc(data.settings.storeName)} · ${data.settings.storeOpen ? "loja aberta" : "loja fechada"} · ${unread} mensagens</span>
        </div>
        <div class="toolbar">
          <label class="searchbar">${icon("search")}<input type="search" data-admin-search value="${esc(ui.search)}" placeholder="Buscar pedido, cliente, produto..."></label>
          <a class="btn light" href="index.html" target="_blank">${icon("external-link")} Cliente</a>
        </div>
      </header>
    `;
  }

  function renderMetrics(data) {
    const orders = todayOrders(data);
    const open = data.orders.filter((order) => !["delivered", "completed", "cancelled", "refused"].includes(order.status));
    const cancelled = data.orders.filter((order) => ["cancelled", "refused"].includes(order.status));
    const avg = orders.length ? revenue(data) / orders.length : 0;
    return `
      <div class="metric-grid">
        <div class="metric"><span>Faturamento hoje</span><strong>${Store.money(revenue(data))}</strong><span>${orders.length} pedidos</span></div>
        <div class="metric"><span>Ticket medio</span><strong>${Store.money(avg)}</strong><span>app, caixa e retirada</span></div>
        <div class="metric"><span>Pedidos em andamento</span><strong>${open.length}</strong><span>precisam de acao</span></div>
        <div class="metric"><span>Cancelados</span><strong>${cancelled.length}</strong><span>monitorar motivos</span></div>
      </div>
    `;
  }

  function renderDashboard(data) {
    return `
      ${renderMetrics(data)}
      <div class="admin-grid" style="margin-top:14px">
        <section class="panel">
          <div class="section-head" style="margin-top:0"><div><h2>Pedidos agora</h2><p>Fluxo rapido da loja.</p></div><button class="btn brand" data-route="pedidos">${icon("arrow-right")} Ver pedidos</button></div>
          ${renderKanban(data, ["pending", "accepted", "preparing", "ready"])}
        </section>
        <aside class="panel">
          <h3>Alertas importantes</h3>
          <div class="stack">
            ${data.orders.filter((order) => order.status === "pending").map((order) => `<div class="cart-item"><div><strong>${esc(order.number)} aguardando</strong><span>${esc(order.customerName)} · ${Store.money(order.total)}</span></div><button class="btn light" data-open-order="${order.id}">${icon("eye")} Abrir</button></div>`).join("")}
            ${lowProductStock(data).map((product) => `<div class="cart-item"><div><strong>${esc(product.name)}</strong><span>Produto com estoque ${product.stock}</span></div><span class="status low">baixo</span></div>`).join("")}
            ${lowInventory(data).map((item) => `<div class="cart-item"><div><strong>${esc(item.name)}</strong><span>Insumo com ${item.quantity} ${esc(item.unit)}</span></div><span class="status low">baixo</span></div>`).join("")}
            ${data.chatThreads.filter((thread) => thread.unread).map((thread) => `<div class="cart-item"><div><strong>Mensagem de ${esc(thread.customerName)}</strong><span>${thread.unread} nao lida</span></div><button class="btn light" data-route="chat">${icon("message-circle")} Chat</button></div>`).join("")}
          </div>
        </aside>
      </div>
    `;
  }

  function renderStatusTabs(data) {
    const tabs = ["pending", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "cancelled", "all"];
    return `<div class="tabs">${tabs.map((status) => {
      const meta = status === "all" ? { label: "Todos" } : Store.statusMeta(data, status);
      return `<button class="${ui.statusTab === status ? "active" : ""}" data-status-tab="${status}">${esc(meta.label)}</button>`;
    }).join("")}</div>`;
  }

  function filteredOrders(data) {
    const query = ui.search.toLowerCase();
    return data.orders.filter((order) => {
      const queryOk = !query || [order.number, order.customerName, order.phone, order.channel, order.status].join(" ").toLowerCase().includes(query);
      const statusOk = ui.statusTab === "all" || order.status === ui.statusTab || (ui.statusTab === "cancelled" && ["cancelled", "refused"].includes(order.status));
      return queryOk && statusOk;
    });
  }

  function renderOrderActions(order) {
    const next = nextStatus[order.status];
    return `
      <div class="toolbar">
        <button class="btn light" data-open-order="${order.id}">${icon("eye")} Detalhes</button>
        ${order.status === "pending" ? `<button class="btn brand" data-order-status="${order.id}" data-status="accepted">${icon("check")} Aceitar</button><button class="danger-btn" data-order-status="${order.id}" data-status="refused">${icon("x")} Recusar</button>` : ""}
        ${next && order.status !== "pending" ? `<button class="btn brand" data-order-status="${order.id}" data-status="${next}">${icon("arrow-right")} Avancar</button>` : ""}
        <button class="btn light" data-print-order="${order.id}">${icon("printer")} Comanda</button>
      </div>
    `;
  }

  function renderPedidos(data) {
    const orders = filteredOrders(data);
    return `
      <section>
        <div class="section-head" style="margin-top:0"><div><h2>Pedidos</h2><p>Aceite, recuse, acompanhe pagamento, entrega e historico.</p></div></div>
        ${renderStatusTabs(data)}
        <div class="order-list">
          ${orders.map((order) => {
            const meta = Store.statusMeta(data, order.status);
            return `
              <article class="order-card">
                <div class="order-head">
                  <div><h3>${esc(order.number)} · ${esc(order.customerName)}</h3><p class="product-desc">${Store.dateTime(order.createdAt)} · ${order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</p></div>
                  <span class="status ${esc(meta.tone)}">${esc(meta.label)}</span>
                </div>
                <div class="order-meta">
                  <span class="pill">${icon("credit-card")} ${esc(order.paymentMethod)} · ${esc(order.paymentStatus)}</span>
                  <span class="pill">${icon(order.fulfillment === "pickup" ? "store" : "bike")} ${order.fulfillment === "pickup" ? "Retirada" : "Entrega"}</span>
                  <span class="pill success">${icon("banknote")} ${Store.money(order.total)}</span>
                </div>
                ${renderOrderActions(order)}
              </article>
            `;
          }).join("") || `<div class="cart-empty"><div><strong>Nenhum pedido nesse filtro.</strong></div></div>`}
        </div>
      </section>
    `;
  }

  function renderPedidoDetalhe(data) {
    const order = data.orders.find((item) => item.id === ui.selectedOrderId) || data.orders[0];
    const meta = Store.statusMeta(data, order.status);
    return `
      <section>
        <div class="section-head" style="margin-top:0"><div><h2>Detalhe ${esc(order.number)}</h2><p>${esc(meta.label)} · ${esc(order.customerName)}</p></div><button class="btn light" data-route="pedidos">${icon("arrow-left")} Voltar</button></div>
        <div class="profile-grid">
          <div class="panel">
            <h3>Pedido</h3>
            <div class="stack">
              ${order.items.map((item) => `<div class="cart-item"><div><strong>${item.qty}x ${esc(item.name)}</strong><span>${esc(item.note || "Sem observacao")}</span></div><strong>${Store.money(item.price * item.qty)}</strong></div>`).join("")}
            </div>
            <div class="summary-lines">
              <div class="summary-line"><span>Subtotal</span><strong>${Store.money(order.subtotal)}</strong></div>
              <div class="summary-line"><span>Entrega</span><strong>${Store.money(order.deliveryFee)}</strong></div>
              <div class="summary-line"><span>Desconto</span><strong>${Store.money(order.discount)}</strong></div>
              <div class="summary-total"><span>Total</span><strong>${Store.money(order.total)}</strong></div>
            </div>
            ${renderOrderActions(order)}
          </div>
          <aside class="panel">
            <h3>Cliente e entrega</h3>
            <p><strong>${esc(order.customerName)}</strong><br>${esc(order.phone || "")}</p>
            <p class="notice">${order.fulfillment === "pickup" ? "Retirada na loja" : esc(order.address)}</p>
            <p><strong>Observacao:</strong> ${esc(order.note || "Sem observacao geral")}</p>
            <h3>Historico</h3>
            <div class="timeline">${(order.history || []).map((item) => `<div class="timeline-item done"><span class="timeline-dot"></span><span>${esc(item.text || item)} · ${item.at ? Store.dateTime(item.at) : ""}</span></div>`).join("")}</div>
            <button class="btn light full" data-chat-order="${order.id}">${icon("message-circle")} Chat do pedido</button>
          </aside>
        </div>
        <div class="panel print-preview" style="margin-top:14px">${renderComanda(order)}</div>
      </section>
    `;
  }

  function renderComanda(order) {
    return `
      <div class="ticket">
        <h3>HUSKY CONFEITEIRO</h3>
        <p>Pedido ${esc(order.number)} · ${Store.dateTime(order.createdAt)}</p>
        <p>Cliente: ${esc(order.customerName)}</p>
        <hr>
        ${order.items.map((item) => `<p>${item.qty}x ${esc(item.name)}<br><small>${esc(item.note || "")}</small></p>`).join("")}
        <hr>
        <p>Pagamento: ${esc(order.paymentMethod)} · ${esc(order.paymentStatus)}</p>
        <p>${order.fulfillment === "pickup" ? "Retirada" : `Entrega: ${esc(order.address)}`}</p>
        <strong>Total: ${Store.money(order.total)}</strong>
      </div>
    `;
  }

  function renderKanban(data, statuses) {
    const list = statuses || ["pending", "accepted", "preparing", "ready", "out_for_delivery", "delivered"];
    return `
      <div class="kanban">
        ${list.map((status) => {
          const meta = Store.statusMeta(data, status);
          const orders = data.orders.filter((order) => order.status === status);
          return `<div class="kanban-column"><h3>${esc(meta.label)} · ${orders.length}</h3>${orders.map((order) => `<article class="mini-order"><strong>${esc(order.number)} · ${esc(order.customerName)}</strong><span>${order.items.map((item) => `${item.qty}x ${item.name}`).join(", ")}</span><span>${Store.money(order.total)} · ${esc(order.paymentStatus)}</span>${renderOrderActions(order)}</article>`).join("") || `<div class="notice">Sem pedidos.</div>`}</div>`;
        }).join("")}
      </div>
    `;
  }

  function renderCozinha(data) {
    const kitchenStatuses = ["pending", "accepted", "preparing", "ready"];
    return `
      <section>
        <div class="section-head" style="margin-top:0"><div><h2>Modo cozinha</h2><p>Tela simplificada, botoes grandes e ordem por horario.</p></div></div>
        <div class="kanban kitchen">
          ${kitchenStatuses.map((status) => {
            const meta = Store.statusMeta(data, status);
            const orders = data.orders.filter((order) => order.status === status);
            return `<div class="kanban-column"><h3>${esc(meta.label)}</h3>${orders.map((order) => `<article class="mini-order kitchen-card"><strong>${esc(order.number)}</strong><span>${order.items.map((item) => `${item.qty}x ${item.name}`).join("<br>")}</span><p class="notice">${esc(order.note || "Sem observacao")}</p>${renderOrderActions(order)}</article>`).join("") || `<div class="notice">Nada aqui.</div>`}</div>`;
          }).join("")}
        </div>
      </section>
    `;
  }

  function addPosProduct(productId) {
    const data = Store.read();
    const product = data.products.find((item) => item.id === productId);
    if (!Store.productIsAvailable(product)) return;
    const current = ui.posCart.find((item) => item.productId === productId);
    if (current) current.qty += 1;
    else ui.posCart.push({ productId, name: product.name, price: Store.productPrice(product), qty: 1 });
    render();
  }

  function renderCaixa(data) {
    const query = ui.search.toLowerCase();
    const products = data.products.filter((product) => product.active && product.name.toLowerCase().includes(query));
    const subtotal = ui.posCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    return `
      <div class="pos-layout">
        <section class="panel">
          <div class="section-head" style="margin-top:0"><div><h2>Caixa rapido</h2><p>Pedido manual, retirada, entrega e pagamento no balcao.</p></div></div>
          <div class="pos-products">${products.map((product) => `<button class="pos-product" data-pos-add="${product.id}" ${Store.productIsAvailable(product) ? "" : "disabled"}><img src="${esc(product.image)}" alt="${esc(product.name)}"><strong>${esc(product.name)}</strong><span class="price">${Store.money(Store.productPrice(product))}</span><small>Estoque ${product.stock}</small></button>`).join("")}</div>
        </section>
        <aside class="panel pos-cart">
          <h3>Comanda</h3>
          <div class="cart-list">${ui.posCart.map((item) => `<div class="cart-item"><div><strong>${item.qty}x ${esc(item.name)}</strong><span>${Store.money(item.price * item.qty)}</span></div><div class="qty"><button data-pos-qty="${item.productId}" data-delta="-1">-</button><strong>${item.qty}</strong><button data-pos-qty="${item.productId}" data-delta="1">+</button></div></div>`).join("") || `<div class="cart-empty"><div><strong>Nenhum item</strong></div></div>`}</div>
          <div class="summary-total" style="margin:14px 0"><span>Total</span><strong>${Store.money(subtotal)}</strong></div>
          <form class="stack" data-pos-form>
            <label class="field"><span>Cliente</span><input name="customerName" value="Cliente balcão"></label>
            <label class="field"><span>WhatsApp</span><input name="phone"></label>
            <label class="field"><span>Entrega</span><select name="fulfillment"><option value="pickup">Retirada</option><option value="delivery">Entrega</option></select></label>
            <label class="field"><span>Pagamento</span><select name="payment"><option>Pix</option><option>Cartao</option><option>Dinheiro</option></select></label>
            <button class="btn brand full" type="submit">${icon("check-circle-2")} Finalizar venda</button>
          </form>
        </aside>
      </div>
    `;
  }

  function renderProductForm(data) {
    const product = data.products.find((item) => item.id === ui.editingProductId) || {
      name: "", category: "bolos", price: 18, promotionalPrice: "", cost: 6, stock: 0, minStock: 4, prepTime: 20,
      tag: "", weight: "250g", size: "250 ml", image: "assets/husky/logo.png", description: "", ingredients: "", allergens: "",
      active: true, isAvailable: true, featured: false
    };
    return `
      <form class="panel form-grid" data-product-form>
        <h3 class="field full">${ui.editingProductId ? "Editar produto" : "Novo produto"}</h3>
        <label class="field"><span>Nome</span><input name="name" value="${esc(product.name)}" required></label>
        <label class="field"><span>Categoria</span><select name="category">${data.categories.filter((item) => item.id !== "todos").map((cat) => `<option value="${cat.id}" ${product.category === cat.id ? "selected" : ""}>${esc(cat.name)}</option>`).join("")}</select></label>
        <label class="field"><span>Preco</span><input name="price" type="number" step="0.01" value="${esc(product.price)}"></label>
        <label class="field"><span>Preco promocional</span><input name="promotionalPrice" type="number" step="0.01" value="${esc(product.promotionalPrice || "")}"></label>
        <label class="field"><span>Custo</span><input name="cost" type="number" step="0.01" value="${esc(product.cost)}"></label>
        <label class="field"><span>Estoque</span><input name="stock" type="number" value="${esc(product.stock)}"></label>
        <label class="field"><span>Minimo</span><input name="minStock" type="number" value="${esc(product.minStock)}"></label>
        <label class="field"><span>Preparo</span><input name="prepTime" type="number" value="${esc(product.prepTime)}"></label>
        <label class="field"><span>Peso</span><input name="weight" value="${esc(product.weight)}"></label>
        <label class="field"><span>Tamanho</span><input name="size" value="${esc(product.size)}"></label>
        <label class="field"><span>Selo</span><input name="tag" value="${esc(product.tag)}"></label>
        <label class="field"><span>Disponivel</span><select name="isAvailable"><option value="true" ${product.isAvailable !== false ? "selected" : ""}>Sim</option><option value="false" ${product.isAvailable === false ? "selected" : ""}>Nao</option></select></label>
        <label class="field"><span>Ativo</span><select name="active"><option value="true" ${product.active ? "selected" : ""}>Sim</option><option value="false" ${!product.active ? "selected" : ""}>Nao</option></select></label>
        <label class="field"><span>Destaque</span><select name="featured"><option value="true" ${product.featured ? "selected" : ""}>Sim</option><option value="false" ${!product.featured ? "selected" : ""}>Nao</option></select></label>
        <label class="field full"><span>Imagem</span><input name="image" value="${esc(product.image)}"></label>
        <label class="field full"><span>Descricao</span><textarea name="description">${esc(product.description)}</textarea></label>
        <label class="field full"><span>Ingredientes</span><textarea name="ingredients">${esc(product.ingredients)}</textarea></label>
        <label class="field full"><span>Alergenicos</span><textarea name="allergens">${esc(product.allergens)}</textarea></label>
        <button class="btn brand" type="submit">${icon("save")} Salvar produto</button>
        <button class="btn light" type="button" data-new-product>${icon("plus")} Limpar</button>
      </form>
    `;
  }

  function renderProdutos(data) {
    const query = ui.search.toLowerCase();
    const products = data.products.filter((product) => [product.name, product.category, product.tag].join(" ").toLowerCase().includes(query));
    return `
      <div class="admin-grid">
        <section>
          <div class="section-head" style="margin-top:0"><div><h2>Produtos e cardapio</h2><p>Fotos, precos, estoque, disponibilidade, destaque e alergicos.</p></div><button class="btn brand" data-new-product>${icon("plus")} Novo</button></div>
          <div class="product-admin-grid">${products.map((product) => `<article class="admin-card product-admin"><img src="${esc(product.image)}" alt="${esc(product.name)}"><strong>${esc(product.name)}</strong><p class="product-desc">${esc(product.description)}</p><div class="summary-line"><span>${Store.money(Store.productPrice(product))}</span><span class="status ${Store.productIsAvailable(product) ? "open" : "low"}">${Store.productIsAvailable(product) ? `Estoque ${product.stock}` : "Indisponivel"}</span></div><div class="toolbar"><button class="btn light" data-edit-product="${product.id}">${icon("pencil")} Editar</button><button class="btn light" data-toggle-product="${product.id}">${icon(product.active ? "eye-off" : "eye")} ${product.active ? "Ocultar" : "Mostrar"}</button></div></article>`).join("")}</div>
        </section>
        ${renderProductForm(data)}
      </div>
    `;
  }

  function renderEstoque(data) {
    return `
      <div class="split">
        <section class="panel">
          <h3>Produtos prontos</h3>
          <div class="table-wrap"><table class="data-table"><thead><tr><th>Produto</th><th>Estoque</th><th>Minimo</th><th>Status</th></tr></thead><tbody>${data.products.map((product) => `<tr><td>${esc(product.name)}</td><td>${product.stock}</td><td>${product.minStock}</td><td><span class="status ${product.stock <= product.minStock ? "low" : "open"}">${product.stock <= product.minStock ? "baixo" : "ok"}</span></td></tr>`).join("")}</tbody></table></div>
        </section>
        <section class="panel">
          <h3>Ingredientes e embalagens</h3>
          <div class="stack">${data.inventoryItems.map((item) => `<div class="cart-item"><div><strong>${esc(item.name)}</strong><span>${item.quantity} ${esc(item.unit)} · minimo ${item.minimumQuantity}</span><span>${esc(item.supplier || "")} ${item.expirationDate ? `· validade ${esc(item.expirationDate)}` : ""}</span></div><span class="status ${item.quantity <= item.minimumQuantity ? "low" : "open"}">${item.quantity <= item.minimumQuantity ? "baixo" : "ok"}</span></div>`).join("")}</div>
          <form class="form-grid" data-stock-form style="margin-top:14px">
            <label class="field"><span>Item</span><select name="inventoryItemId">${data.inventoryItems.map((item) => `<option value="${item.id}">${esc(item.name)}</option>`).join("")}</select></label>
            <label class="field"><span>Tipo</span><select name="type"><option value="entrada">Entrada</option><option value="saida">Saida</option><option value="perda">Perda</option></select></label>
            <label class="field"><span>Quantidade</span><input name="quantity" type="number" step="0.01" value="1"></label>
            <label class="field"><span>Motivo</span><input name="reason" value="Ajuste manual"></label>
            <button class="btn brand full" type="submit">${icon("save")} Registrar movimento</button>
          </form>
        </section>
      </div>
    `;
  }

  function renderClientes(data) {
    const query = ui.search.toLowerCase();
    const customers = data.customers.filter((customer) => [customer.name, customer.phone, customer.email, customer.neighborhood].join(" ").toLowerCase().includes(query));
    return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Cliente</th><th>Contato</th><th>Bairro</th><th>Pedidos</th><th>Total</th><th>Preferencia</th><th>Acoes</th></tr></thead><tbody>${customers.map((customer) => `<tr><td><strong>${esc(customer.name)}</strong><br><small>${esc(customer.notes || "")}</small></td><td>${esc(customer.phone || "")}<br><small>${esc(customer.email || "")}</small></td><td>${esc(customer.neighborhood || "")}</td><td>${customer.orders}</td><td>${Store.money(customer.totalSpent)}</td><td>${esc(customer.favorite || "")}</td><td><a class="btn light" href="https://wa.me/55${esc(customer.phone || "")}" target="_blank">${icon("phone")} WhatsApp</a></td></tr>`).join("")}</tbody></table></div>`;
  }

  function renderCupons(data) {
    return `
      <div class="split">
        <section>
          <div class="coupon-grid">${data.coupons.map((coupon) => `<article class="panel coupon-card"><span class="mini-pill">${esc(coupon.code)}</span><h3>${esc(coupon.title)}</h3><p class="product-desc">${esc(coupon.description)}</p><div class="summary-line"><span>Minimo</span><strong>${Store.money(coupon.minSubtotal)}</strong></div><div class="summary-line"><span>Uso</span><strong>${coupon.used}/${coupon.limit}</strong></div></article>`).join("")}</div>
        </section>
        <form class="panel form-grid" data-coupon-form>
          <h3 class="field full">Criar cupom</h3>
          <label class="field"><span>Codigo</span><input name="code" required></label>
          <label class="field"><span>Titulo</span><input name="title"></label>
          <label class="field full"><span>Descricao</span><input name="description"></label>
          <label class="field"><span>Tipo</span><select name="type"><option value="value">Valor fixo</option><option value="percent">Percentual</option><option value="free_delivery">Frete gratis</option></select></label>
          <label class="field"><span>Valor</span><input name="value" type="number" step="0.01" value="10"></label>
          <label class="field"><span>Pedido minimo</span><input name="minSubtotal" type="number" step="0.01" value="35"></label>
          <label class="field"><span>Limite</span><input name="limit" type="number" value="100"></label>
          <button class="btn brand full" type="submit">${icon("save")} Salvar cupom</button>
        </form>
      </div>
    `;
  }

  function renderChat(data) {
    const thread = data.chatThreads.find((item) => item.id === ui.selectedThread) || data.chatThreads[0];
    return `
      <div class="admin-chat">
        <aside class="thread-list">${data.chatThreads.map((item) => `<button class="thread-btn ${thread?.id === item.id ? "active" : ""}" data-thread="${item.id}"><strong>${esc(item.customerName)} ${item.unread ? `<span class="mini-pill">${item.unread}</span>` : ""}</strong><span>${esc(item.messages[item.messages.length - 1]?.text || "")}</span></button>`).join("")}</aside>
        <section class="message-panel" style="border:0;box-shadow:none;border-radius:0">
          ${thread ? `<div class="message-head"><div><strong>${esc(thread.customerName)}</strong><br><small>${esc(thread.phone || "")}</small></div><span class="status open">${esc(thread.status)}</span></div><div class="message-body">${thread.messages.map((msg) => `<div class="bubble ${msg.from === "customer" ? "store" : "customer"}">${esc(msg.text)}<small>${Store.dateTime(msg.createdAt)}</small></div>`).join("")}</div><div class="quick-row" style="padding:12px 12px 0">${["Seu pedido ja esta em preparo.", "Pode retirar hoje sim.", "Tivemos um pequeno atraso, mas ja estamos finalizando.", "Pode confirmar o endereco?"].map((text) => `<button data-admin-quick="${esc(text)}">${esc(text)}</button>`).join("")}</div><form class="message-compose" data-admin-chat-form><input name="message" placeholder="Responder cliente" autocomplete="off"><button class="icon-btn brand">${icon("send")}</button></form>` : `<div class="cart-empty"><strong>Sem conversas</strong></div>`}
        </section>
      </div>
    `;
  }

  function renderFinanceiro(data) {
    const payments = data.cash.payments || [];
    const expenses = data.expenses || [];
    const income = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const out = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const discounts = data.orders.reduce((sum, order) => sum + Number(order.discount || 0), 0);
    return `
      <div class="metric-grid">
        <div class="metric"><span>Faturamento bruto</span><strong>${Store.money(income)}</strong><span>${payments.length} pagamentos</span></div>
        <div class="metric"><span>Despesas</span><strong>${Store.money(out)}</strong><span>${expenses.length} lancamentos</span></div>
        <div class="metric"><span>Cupons concedidos</span><strong>${Store.money(discounts)}</strong><span>descontos</span></div>
        <div class="metric"><span>Lucro estimado</span><strong>${Store.money(income - out - totalCost(data))}</strong><span>vendas - despesas - custo</span></div>
      </div>
      <div class="split" style="margin-top:14px">
        <section class="panel"><h3>Pagamentos</h3><div class="stack">${payments.map((payment) => `<div class="cart-item"><div><strong>${esc(payment.method)} · ${esc(payment.orderNumber)}</strong><span>${esc(payment.status)} · ${Store.dateTime(payment.createdAt)}</span></div><strong>${Store.money(payment.amount)}</strong></div>`).join("")}</div></section>
        <form class="panel form-grid" data-expense-form><h3 class="field full">Nova despesa</h3><label class="field full"><span>Descricao</span><input name="description" required></label><label class="field"><span>Categoria</span><select name="category"><option>Ingredientes</option><option>Embalagens</option><option>Entrega</option><option>Marketing</option><option>Outros</option></select></label><label class="field"><span>Valor</span><input name="amount" type="number" step="0.01" required></label><label class="field"><span>Quantidade</span><input name="quantity" type="number" value="1"></label><label class="field"><span>Pagamento</span><select name="paymentMethod"><option>Pix</option><option>Cartao</option><option>Dinheiro</option></select></label><button class="btn brand full" type="submit">${icon("save")} Lancar despesa</button></form>
      </div>
    `;
  }

  function renderRelatorios(data) {
    const byProduct = data.products.map((product) => {
      const qty = data.orders.reduce((sum, order) => sum + order.items.filter((item) => item.productId === product.id).reduce((itemSum, item) => itemSum + item.qty, 0), 0);
      return { product, qty };
    }).sort((a, b) => b.qty - a.qty);
    return `
      <div class="metric-grid">${["Vendas", "Pedidos", "Produtos", "Clientes"].map((title, index) => `<div class="metric"><span>Relatorio</span><strong>${title}</strong><span>${["exportavel em CSV/PDF", "status e cancelamentos", "ranking e estoque", "recorrencia e bairros"][index]}</span></div>`).join("")}</div>
      <div class="split" style="margin-top:14px">
        <section class="panel"><h3>Produtos mais vendidos</h3><div class="stack">${byProduct.map((row) => `<div class="summary-line"><span>${esc(row.product.name)}</span><strong>${row.qty} un</strong></div>`).join("")}</div></section>
        <section class="panel"><h3>Pedidos por status</h3><div class="stack">${data.orderStatuses.slice(0, 8).map((status) => `<div class="summary-line"><span>${esc(status.label)}</span><strong>${data.orders.filter((order) => order.status === status.id).length}</strong></div>`).join("")}</div><div class="toolbar" style="margin-top:14px"><button class="btn light">${icon("file-down")} PDF</button><button class="btn light">${icon("file-spreadsheet")} Excel</button><button class="btn light">${icon("printer")} Imprimir</button></div></section>
      </div>
    `;
  }

  function renderEntregas(data) {
    const deliveryOrders = data.orders.filter((order) => ["ready", "out_for_delivery"].includes(order.status) && order.fulfillment !== "pickup");
    return `
      <div class="split">
        <section class="panel"><h3>Pedidos para entrega</h3><div class="stack">${deliveryOrders.map((order) => `<div class="cart-item"><div><strong>${esc(order.number)} · ${esc(order.customerName)}</strong><span>${esc(order.address)}</span></div><button class="btn brand" data-order-status="${order.id}" data-status="out_for_delivery">${icon("bike")} Saiu</button></div>`).join("") || `<div class="notice">Nenhum pedido aguardando rota.</div>`}</div></section>
        <section class="panel"><h3>Entregadores e areas</h3><div class="stack">${data.couriers.map((courier) => `<div class="cart-item"><div><strong>${esc(courier.name)}</strong><span>${esc(courier.vehicleType)} · ${esc(courier.status)} · pagar ${Store.money(courier.payout)}</span></div><span class="status open">${courier.delivered}</span></div>`).join("")}${data.deliveryZones.map((zone) => `<div class="cart-item"><div><strong>${esc(zone.name)}</strong><span>${Store.money(zone.deliveryFee)} · ${zone.estimatedMin}-${zone.estimatedMax} min · minimo ${Store.money(zone.minOrder)}</span></div><span class="status ${zone.active ? "open" : "closed"}">${zone.active ? "ativo" : "bloqueado"}</span></div>`).join("")}</div></section>
      </div>
    `;
  }

  function renderAvaliacoes(data) {
    const avg = data.reviews.length ? data.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / data.reviews.length : 0;
    return `<section><div class="metric-grid"><div class="metric"><span>Nota media</span><strong>${avg.toFixed(1)}</strong><span>${data.reviews.length} avaliacoes</span></div><div class="metric"><span>Positivas</span><strong>${data.reviews.filter((r) => r.rating >= 4).length}</strong><span>4 ou 5 estrelas</span></div><div class="metric"><span>Reclamacoes</span><strong>${data.reviews.filter((r) => r.rating <= 3).length}</strong><span>acompanhar</span></div><div class="metric"><span>Sem resposta</span><strong>${data.reviews.filter((r) => !r.answered).length}</strong><span>pendentes</span></div></div><div class="coupon-grid" style="margin-top:14px">${data.reviews.map((review) => `<article class="panel"><span class="mini-pill">${review.rating} estrelas</span><h3>${esc(review.customerName)}</h3><p class="product-desc">${esc(review.comment)}</p><p>Produto ${review.productRating} · Entrega ${review.deliveryRating} · Atendimento ${review.serviceRating}</p><button class="btn light full">${icon("reply")} Responder</button></article>`).join("")}</div></section>`;
  }

  function renderMarketing(data) {
    return `<div class="split"><section class="panel"><h3>Banners e feed</h3><div class="stack">${data.marketingBanners.map((banner) => `<div class="cart-item"><div><strong>${esc(banner.title)}</strong><span>${esc(banner.subtitle)}</span></div><span class="status ${banner.active ? "open" : "closed"}">${banner.active ? "ativo" : "pausado"}</span></div>`).join("")}</div></section><section class="panel"><h3>Instagram</h3><div class="stack">${data.instagramPosts.map((post) => `<div class="cart-item"><div><strong>${esc(post.title)}</strong><span>${esc(post.type)} · ${esc(post.status)} · alcance ${post.reach}</span></div><img src="${esc(post.image)}" alt="${esc(post.title)}" style="width:64px;height:64px;object-fit:cover;border-radius:var(--radius)"></div>`).join("")}</div><p class="notice">Integracao real: conectar Instagram Graph API em uma Edge Function e salvar em instagram_posts.</p></section></div>`;
  }

  function renderConfig(data) {
    return `
      <div class="split">
        <form class="panel form-grid" data-settings-form>
          <h3 class="field full">Loja e operacao</h3>
          <label class="field"><span>Marca</span><input name="brandName" value="${esc(data.settings.brandName)}"></label>
          <label class="field"><span>Loja</span><input name="storeName" value="${esc(data.settings.storeName)}"></label>
          <label class="field"><span>WhatsApp</span><input name="whatsapp" value="${esc(data.settings.whatsapp)}"></label>
          <label class="field"><span>Instagram</span><input name="instagramHandle" value="${esc(data.settings.instagramHandle)}"></label>
          <label class="field"><span>Pedido minimo</span><input name="minOrder" type="number" step="0.01" value="${esc(data.settings.minOrder)}"></label>
          <label class="field"><span>Taxa padrao</span><input name="deliveryFee" type="number" step="0.01" value="${esc(data.settings.deliveryFee)}"></label>
          <label class="field"><span>Loja aberta</span><select name="storeOpen"><option value="true" ${data.settings.storeOpen ? "selected" : ""}>Sim</option><option value="false" ${!data.settings.storeOpen ? "selected" : ""}>Nao</option></select></label>
          <label class="field full"><span>Aviso</span><input name="announcement" value="${esc(data.settings.announcement)}"></label>
          <button class="btn brand" type="submit">${icon("save")} Salvar</button>
          <button class="danger-btn" type="button" data-reset-demo>${icon("rotate-ccw")} Resetar demo</button>
        </form>
        <section class="panel">
          <h3>Equipe e permissoes</h3>
          <div class="stack">${data.adminUsers.map((user) => `<div class="cart-item"><div><strong>${esc(user.name)}</strong><span>${esc(user.email)} · ${esc(data.roles.find((role) => role.id === user.roleId)?.name || "")}</span></div><span class="status ${user.active ? "open" : "closed"}">${user.active ? "ativo" : "inativo"}</span></div>`).join("")}</div>
          <h3 style="margin-top:18px">Auditoria</h3>
          <div class="stack">${data.auditLogs.slice(0, 6).map((log) => `<div class="cart-item"><div><strong>${esc(log.action)}</strong><span>${esc(log.user)} · ${esc(log.module)} · ${Store.dateTime(log.createdAt)}</span></div></div>`).join("")}</div>
        </section>
      </div>
    `;
  }

  function renderRoute(data) {
    if (ui.route === "pedido") return renderPedidoDetalhe(data);
    if (ui.route === "pedidos") return renderPedidos(data);
    if (ui.route === "cozinha") return renderCozinha(data);
    if (ui.route === "caixa") return renderCaixa(data);
    if (ui.route === "chat") return renderChat(data);
    if (ui.route === "produtos") return renderProdutos(data);
    if (ui.route === "estoque") return renderEstoque(data);
    if (ui.route === "clientes") return renderClientes(data);
    if (ui.route === "cupons") return renderCupons(data);
    if (ui.route === "financeiro") return renderFinanceiro(data);
    if (ui.route === "relatorios") return renderRelatorios(data);
    if (ui.route === "entregas") return renderEntregas(data);
    if (ui.route === "avaliacoes") return renderAvaliacoes(data);
    if (ui.route === "marketing") return renderMarketing(data);
    if (ui.route === "config") return renderConfig(data);
    return renderDashboard(data);
  }

  function renderMobileNav() {
    const mobile = ["dashboard", "pedidos", "cozinha", "caixa", "chat"].map((id) => routes.find((route) => route.id === id));
    return `<nav class="mobile-tabbar" aria-label="Navegacao da gestao">${mobile.map((item) => `<button class="${ui.route === item.id ? "active" : ""}" data-route="${item.id}">${icon(item.icon)}<span>${esc(item.label)}</span></button>`).join("")}</nav>`;
  }

  function bind() {
    root.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => setRoute(button.dataset.route)));
    root.querySelector("[data-admin-search]")?.addEventListener("input", (event) => {
      ui.search = event.target.value;
      render();
      window.requestAnimationFrame(() => {
        const input = root.querySelector("[data-admin-search]");
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      });
    });
    root.querySelector("[data-toggle-store]")?.addEventListener("click", () => {
      const data = Store.read();
      Store.updateSettings({ storeOpen: !data.settings.storeOpen });
      toast("Status da loja atualizado.");
    });
    root.querySelectorAll("[data-status-tab]").forEach((button) => button.addEventListener("click", () => { ui.statusTab = button.dataset.statusTab; render(); }));
    root.querySelectorAll("[data-open-order]").forEach((button) => button.addEventListener("click", () => { ui.selectedOrderId = button.dataset.openOrder; ui.route = "pedido"; render(); }));
    root.querySelectorAll("[data-order-status]").forEach((button) => button.addEventListener("click", () => {
      Store.updateOrderStatus(button.dataset.orderStatus, button.dataset.status, "Gestao");
      toast("Status atualizado.");
    }));
    root.querySelectorAll("[data-print-order]").forEach((button) => button.addEventListener("click", () => {
      ui.selectedOrderId = button.dataset.printOrder;
      ui.route = "pedido";
      render();
      window.setTimeout(() => window.print(), 120);
    }));
    root.querySelectorAll("[data-chat-order]").forEach((button) => button.addEventListener("click", () => {
      const data = Store.read();
      const thread = data.chatThreads.find((item) => item.orderId === button.dataset.chatOrder);
      ui.selectedThread = thread?.id || "";
      ui.route = "chat";
      render();
    }));
    root.querySelectorAll("[data-pos-add]").forEach((button) => button.addEventListener("click", () => addPosProduct(button.dataset.posAdd)));
    root.querySelectorAll("[data-pos-qty]").forEach((button) => button.addEventListener("click", () => {
      ui.posCart = ui.posCart.map((item) => item.productId === button.dataset.posQty ? Object.assign({}, item, { qty: item.qty + Number(button.dataset.delta) }) : item).filter((item) => item.qty > 0);
      render();
    }));
    root.querySelector("[data-pos-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const subtotal = ui.posCart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const order = Store.addOrder({
        customerId: "balcao",
        customerName: form.querySelector("[name='customerName']").value || "Cliente balcão",
        phone: form.querySelector("[name='phone']").value,
        fulfillment: form.querySelector("[name='fulfillment']").value,
        address: "",
        paymentMethod: form.querySelector("[name='payment']").value,
        paymentStatus: "approved",
        status: "accepted",
        channel: "Caixa",
        subtotal,
        deliveryFee: 0,
        discount: 0,
        total: subtotal,
        items: ui.posCart.map((item) => ({ productId: item.productId, name: item.name, qty: item.qty, price: item.price, note: "" }))
      });
      ui.posCart = [];
      toast(`Venda ${order.number} criada.`);
    });
    root.querySelectorAll("[data-edit-product]").forEach((button) => button.addEventListener("click", () => { ui.editingProductId = button.dataset.editProduct; render(); }));
    root.querySelectorAll("[data-new-product]").forEach((button) => button.addEventListener("click", () => { ui.editingProductId = ""; render(); }));
    root.querySelectorAll("[data-toggle-product]").forEach((button) => button.addEventListener("click", () => {
      const data = Store.read();
      const product = data.products.find((item) => item.id === button.dataset.toggleProduct);
      if (product) {
        product.active = !product.active;
        Store.write(data);
        toast(product.active ? "Produto visivel." : "Produto oculto.");
      }
    }));
    root.querySelector("[data-product-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = {
        id: ui.editingProductId || undefined,
        name: form.querySelector("[name='name']").value,
        category: form.querySelector("[name='category']").value,
        price: Number(form.querySelector("[name='price']").value || 0),
        promotionalPrice: form.querySelector("[name='promotionalPrice']").value,
        cost: Number(form.querySelector("[name='cost']").value || 0),
        stock: Number(form.querySelector("[name='stock']").value || 0),
        minStock: Number(form.querySelector("[name='minStock']").value || 0),
        prepTime: Number(form.querySelector("[name='prepTime']").value || 0),
        weight: form.querySelector("[name='weight']").value,
        size: form.querySelector("[name='size']").value,
        tag: form.querySelector("[name='tag']").value,
        image: form.querySelector("[name='image']").value,
        description: form.querySelector("[name='description']").value,
        ingredients: form.querySelector("[name='ingredients']").value,
        allergens: form.querySelector("[name='allergens']").value,
        active: form.querySelector("[name='active']").value === "true",
        isAvailable: form.querySelector("[name='isAvailable']").value === "true",
        featured: form.querySelector("[name='featured']").value === "true"
      };
      const saved = Store.saveProduct(payload);
      ui.editingProductId = saved.id;
      toast("Produto salvo.");
    });
    root.querySelector("[data-stock-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      Store.addInventoryMovement({
        inventoryItemId: form.querySelector("[name='inventoryItemId']").value,
        type: form.querySelector("[name='type']").value,
        quantity: Number(form.querySelector("[name='quantity']").value || 0),
        reason: form.querySelector("[name='reason']").value
      });
      toast("Movimento registrado.");
    });
    root.querySelector("[data-coupon-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      Store.saveCoupon({
        code: form.querySelector("[name='code']").value,
        title: form.querySelector("[name='title']").value || form.querySelector("[name='code']").value,
        description: form.querySelector("[name='description']").value,
        type: form.querySelector("[name='type']").value,
        value: Number(form.querySelector("[name='value']").value || 0),
        minSubtotal: Number(form.querySelector("[name='minSubtotal']").value || 0),
        limit: Number(form.querySelector("[name='limit']").value || 0)
      });
      toast("Cupom salvo.");
    });
    root.querySelector("[data-thread]")?.addEventListener("click", () => {});
    root.querySelectorAll("[data-thread]").forEach((button) => button.addEventListener("click", () => {
      ui.selectedThread = button.dataset.thread;
      Store.markThreadRead(ui.selectedThread);
      render();
    }));
    root.querySelector("[data-admin-chat-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.currentTarget.querySelector("[name='message']");
      Store.addChatMessage(ui.selectedThread, "store", input.value);
      input.value = "";
      toast("Mensagem enviada.");
    });
    root.querySelectorAll("[data-admin-quick]").forEach((button) => button.addEventListener("click", () => Store.addChatMessage(ui.selectedThread, "store", button.dataset.adminQuick)));
    root.querySelector("[data-expense-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      Store.addExpense({
        description: form.querySelector("[name='description']").value,
        category: form.querySelector("[name='category']").value,
        amount: Number(form.querySelector("[name='amount']").value || 0),
        quantity: Number(form.querySelector("[name='quantity']").value || 1),
        paymentMethod: form.querySelector("[name='paymentMethod']").value
      });
      toast("Despesa lancada.");
    });
    root.querySelector("[data-settings-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      Store.updateSettings({
        brandName: form.querySelector("[name='brandName']").value,
        storeName: form.querySelector("[name='storeName']").value,
        whatsapp: form.querySelector("[name='whatsapp']").value,
        instagramHandle: form.querySelector("[name='instagramHandle']").value,
        minOrder: Number(form.querySelector("[name='minOrder']").value || 0),
        deliveryFee: Number(form.querySelector("[name='deliveryFee']").value || 0),
        storeOpen: form.querySelector("[name='storeOpen']").value === "true",
        announcement: form.querySelector("[name='announcement']").value
      });
      toast("Configuracoes salvas.");
    });
    root.querySelector("[data-reset-demo]")?.addEventListener("click", () => {
      Store.reset();
      ui.posCart = [];
      toast("Demo resetada.");
    });
  }

  function render() {
    const data = Store.read();
    if (!ui.selectedThread && data.chatThreads[0]) ui.selectedThread = data.chatThreads[0].id;
    root.innerHTML = `
      <div class="admin-shell">
        ${renderSidebar(data)}
        <main class="admin-main">
          ${renderTopbar(data)}
          <div class="admin-content">${renderRoute(data)}</div>
        </main>
      </div>
      ${renderMobileNav()}
      ${ui.toast ? `<div class="notice success" style="position:fixed;right:16px;bottom:16px;z-index:90;box-shadow:var(--shadow)">${esc(ui.toast)}</div>` : ""}
    `;
    bind();
    if (window.lucide) window.lucide.createIcons();
  }

  window.addEventListener("husky:data", render);
  render();
})();
