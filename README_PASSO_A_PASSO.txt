HUSKY CLIENTE - VERSÃO SEM NODE
================================

Este pacote funciona sem instalar Node no computador.
Você abre o arquivo index.html no navegador.

O QUE TEM NO PACOTE
-------------------
1. index.html
   App completo do cliente: catálogo, carrinho, cupons, login por código, chat, pedidos e pagamento.

2. SUPABASE_SQL_COMPLETO.sql
   Banco de dados completo para rodar no Supabase > SQL Editor.

3. edge-functions/
   Exemplos de funções Supabase para criar Pix e consultar pagamento.
   Essas funções são opcionais e devem ser criadas no painel do Supabase.

4. assets/husky/
   Pasta onde você deve colocar as imagens da Husky.

COMO ABRIR
----------
1. Extraia o ZIP.
2. Abra a pasta husky_cliente_sem_node.
3. Clique duas vezes em index.html.

COMO CONFIGURAR O SUPABASE NO APP
---------------------------------
A engrenagem foi removida do aplicativo do cliente.
O cliente não tem acesso à Project URL, anon key, funções de Pix ou WhatsApp.

Para configurar antes de publicar:
1. Abra o arquivo index.html no Bloco de Notas ou VS Code.
2. Procure por: const APP_CONFIG = {
3. Preencha:
   - supabaseUrl
   - supabaseAnonKey
   - pixFunction
   - checkFunction
   - whatsapp
4. Salve o arquivo.

A anon key é pública, mas não fica editável para o cliente dentro do app.

ONDE PEGAR AS CHAVES
--------------------
Supabase > Project Settings > API:
- Project URL
- anon public key

Nunca coloque a service_role no index.html.
A service_role fica apenas nas Edge Functions.

BANCO DE DADOS
--------------
1. Vá no Supabase.
2. Abra SQL Editor.
3. Cole tudo do arquivo SUPABASE_SQL_COMPLETO.sql.
4. Clique em Run.

LOGIN POR CÓDIGO NO EMAIL
-------------------------
No Supabase:
1. Authentication > Email Templates.
2. Edite o template para usar o token:
   {{ .Token }}
3. No app, o cliente digita o e-mail.
4. O Supabase envia o código.
5. O cliente digita o código e entra.

IMAGENS DA HUSKY
----------------
Coloque as imagens dentro de:
assets/husky/

Nomes esperados pelo app:
- IMG_6999.PNG
- IMG_7008.PNG
- IMG_7009.PNG
- IMG_7023.PNG
- IMG_7024.PNG
- IMG_7025.PNG
- IMG_7026.PNG
- IMG_7027.PNG
- IMG_7028.PNG
- Design sem nome(1).png
- HUSKY (2)(1).png
- HUSKY(1).png
- ChatGPT Image 24 de abr. de 2026, 12_30_38(1).png
- WhatsApp Sticker.png
- WhatsApp Sticker 2026-04-27 at 09.26.png
- WhatsApp Sticker 2026-04-27 at 09.26 (2).png
- WhatsApp Sticker 2026-04-27 at 09.26 (3).png
- WhatsApp Sticker 2026-04-27 at 09.26 (4).png
- WhatsApp Sticker 2026-04-27 at 09.26 (5).png
- WhatsApp Sticker 2026-04-27 at 09.26 (7).png

Se alguma imagem não existir, o app mostra fallback com emoji.

PIX REAL
--------
O index.html NÃO confirma pagamento sozinho.
Isso é correto.
O pedido só deve ser criado quando uma Edge Function confirmar que o gateway aprovou o pagamento.

Funções esperadas:
- create-pix-payment
- check-payment-status

No app, o nome dessas funções pode ser configurado na engrenagem ⚙️.

IMPORTANTE
----------
Sem Edge Function de Pix configurada, o app mostra o fluxo visual, mas não cria pedido pago real.
Isso evita o erro de criar pedido falso como se estivesse pago.

ATUALIZAÇÃO DESTA VERSÃO
- A pasta assets/husky agora já vem preenchida com os arquivos enviados da Husky.
- Se alguma imagem não aparecer, confira se o nome do arquivo não foi alterado pelo Windows.
