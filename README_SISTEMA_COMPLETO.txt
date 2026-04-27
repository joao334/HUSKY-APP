HUSKY CONFEITEIRO — SISTEMA SEM NODE

ARQUIVOS PRINCIPAIS
- index.html: app do cliente.
- gestao.html: app da gestão.
- config.js: configuração única do Supabase para cliente e gestão.
- SUPABASE_SQL_COMPLETO.sql: banco completo para cliente + gestão.
- assets/husky: imagens, mascotes, logos e produtos.

IMPORTANTE SOBRE O ERRO DO CÓDIGO POR E-MAIL
Se aparece "Supabase ainda não está configurado", é porque o arquivo config.js está sem Project URL e anon public key.
Abra config.js e preencha:

window.HUSKY_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseAnonKey: "SUA_ANON_PUBLIC_KEY",
  pixFunction: "create-pix-payment",
  checkFunction: "check-payment-status",
  whatsapp: "5511...",
  storeName: "Husky Confeiteiro",
  pixKey: "4aff227c-332e-4c32-8034-f8605805ba76"
};

NÃO coloque service_role no config.js.

PASSO A PASSO
1. Entre no Supabase e crie o projeto.
2. Vá em Project Settings > API e copie:
   - Project URL
   - anon public key
3. Cole esses dados no config.js.
4. Vá em SQL Editor e rode o arquivo SUPABASE_SQL_COMPLETO.sql.
5. Abra gestao.html e faça login com seu e-mail.
6. Volte no SQL Editor e rode o bloco CRIAR ADMIN no final do SQL, trocando pelo seu e-mail.
7. Abra gestao.html novamente.
8. Tudo que alterar na gestão em produtos/cupons/pedidos/configurações usa as mesmas tabelas do app do cliente.

LOGIN POR CÓDIGO NO E-MAIL
No Supabase:
Authentication > Email Templates > Magic Link
Use {{ .Token }} no template para enviar código.

APP DA GESTÃO
Inclui os módulos solicitados:
Dashboard, Pedidos, Produção, Entregas, Cardápio, Categorias, Adicionais, Estoque, Loja/Horários, Financeiro, Cupons, Clientes, Avaliações, Chat/Suporte, Cancelamentos, Reembolsos, Chamados, Relatórios, Despesas, Fornecedores, Produção do dia, Pedidos manuais, Canais, Banners, Notificações, Auditoria, Usuários, Área de entrega, Pedidos agendados, Fidelidade, Exportação e Configurações.

PAGAMENTO REAL
O pedido só deve aparecer na gestão quando o gateway confirmar pagamento via Supabase Edge Function/webhook.
Os exemplos estão na pasta edge-functions.


ATUALIZAÇÃO DE INTEGRAÇÃO:
1. Rode PATCH_INTEGRACAO_CLIENTE_GESTAO.sql no Supabase.
2. Em Authentication > Email Templates > Magic Link, use {{ .Token }} para o cliente receber código.
3. O chat do cliente agora grava em chat_messages e aparece no Gestor > Chat/Suporte.
4. Perfil do cliente agora permite atualizar nome, WhatsApp, aniversário e endereço.
5. Alterações de produto, cupom, banner e configurações na gestão são salvas no Supabase quando o gestor está conectado.
