# Husky Confeitaria V2

Base completa em HTML/CSS/JS para validar o produto antes de migrar para Next.js + Supabase.

## Entradas

- `index.html`: app do cliente.
- `gestao.html`: app da gestao, caixa e operacao.

Os dois apps usam os mesmos dados locais em `localStorage`, entao pedido, chat, estoque, cupom e status conversam entre cliente e gestao no mesmo navegador.

## App do cliente

Inclui:

- Home com status da loja, endereco, busca, banner, categorias, destaques, promocoes e Instagram.
- Buscar/categorias com filtro, ordenacao por popularidade/preco/novidade e itens indisponiveis.
- Detalhe do produto com foto, descricao, peso, tamanho, ingredientes, alergicos, preparo, quantidade e observacao.
- Carrinho com itens, quantidade, observacao por item, observacao geral, cupom, subtotal, taxa, desconto, total e pedido minimo.
- Checkout com identificacao, endereco salvo, entrega, retirada, agendamento, Pix, cartao, dinheiro e saldo Husky.
- Sucesso do pedido, acompanhamento por timeline, chat vinculado ao pedido e central de ajuda.
- Historico de pedidos com abas, repetir pedido, ajuda e avaliacao.
- Favoritos, cupons, enderecos, notificacoes e perfil/fidelidade.

## App da gestao

Inclui:

- Dashboard com indicadores, alertas, mensagens, estoque baixo e pedidos pendentes.
- Pedidos com abas, aceitar, recusar, avancar status, detalhe completo e comanda de impressao.
- Modo cozinha com fila simplificada.
- Caixa/POS para venda manual.
- Chat com cliente, respostas rapidas e pedido vinculado.
- Produtos/cardapio com preco, promocao, estoque, foto, ingredientes, alergicos e disponibilidade.
- Estoque de produtos, ingredientes, embalagens e movimentacoes.
- Clientes, cupons, financeiro, despesas, relatorios, entregas, avaliacoes, marketing, usuarios/permissoes e auditoria.

## Status internos

```txt
pending
accepted
preparing
ready
waiting_pickup
out_for_delivery
delivered
completed
cancelled
refused
payment_pending
payment_failed
refund_requested
refunded
```

## Supabase

O SQL completo esta em:

```txt
sql/husky-v2-schema.sql
```

Ele cria tabelas para:

```txt
users, addresses, products, categories, carts, cart_items, orders, order_items,
order_status_history, payments, coupons, coupon_usages, favorites, reviews,
chat_messages, notifications, store_settings, admin_users, roles, permissions,
role_permissions, inventory_items, inventory_movements, expenses, cash_movements,
delivery_zones, couriers, order_assignments, printer_settings, marketing_banners,
instagram_posts, audit_logs, store_hours e special_hours.
```

Realtime recomendado:

```txt
orders
order_status_history
chat_messages
notifications
products
inventory_items
```

## Proximo passo tecnico

Quando for transformar em projeto real:

- Cliente: Next.js, React, TypeScript, Tailwind CSS, Supabase Auth e PWA.
- Gestao: Next.js separado ou mesma aplicacao com rotas admin protegidas.
- Pagamento: Edge Functions para Pix/cartao com Mercado Pago, Pagar.me, Asaas, Stripe ou InfinitePay.
- Instagram: Edge Function usando Instagram Graph API gravando em `instagram_posts`.
- Notificacoes: Firebase Cloud Messaging, e-mail e WhatsApp futuramente.

## Estrutura recomendada para migracao

```txt
husky-suite/
  apps/
    cliente/
      src/app/
      src/components/
      src/hooks/
      src/lib/
      src/store/
      src/types/
    gestao/
      src/app/
      src/components/
      src/hooks/
      src/lib/
      src/store/
      src/types/
  packages/
    database/
    ui/
    shared/
```

## Login com Google via Supabase

Esta versao ja esta com o botao "Entrar com Google" apontando para o Supabase Auth.

Arquivos alterados:
- `index.html`: adiciona a biblioteca `@supabase/supabase-js`.
- `gestao.html`: adiciona a biblioteca `@supabase/supabase-js`.
- `js/client.js`: usa `supabase.auth.signInWithOAuth({ provider: "google" })` e salva o perfil Google no app.
- `config.js`: mantem `supabaseUrl` e `supabaseAnonKey` como fonte da conexao.

No Supabase, confira:
1. `Authentication > Providers > Google` ativado.
2. `Authentication > URL Configuration > Site URL` com o link do seu site.
3. `Redirect URLs` contendo o dominio do Vercel, por exemplo: `https://seu-site.vercel.app/**`.

Depois de publicar no Vercel, clique em "Entrar com Google" na tela do cliente/perfil.


## Correção de entrega por bairro

Nesta versão, bairros sem zona de entrega cadastrada não bloqueiam mais o checkout automaticamente. O sistema usa a taxa padrão configurada em `config.js`:

```js
allowUnlistedNeighborhoods: true,
deliveryFee: 6.99
```

Se quiser bloquear bairros fora da área cadastrada, altere para:

```js
allowUnlistedNeighborhoods: false
```

Com `true`, o pedido pode ser finalizado mesmo que o bairro ainda não exista em `deliveryZones`.
