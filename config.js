// CONFIGURAÇÃO ÚNICA DO SISTEMA HUSKY
// Preencha estes campos antes de usar o app do cliente e o app da gestão.
// A anon key é pública por natureza no Supabase. NÃO coloque service_role aqui.
window.HUSKY_CONFIG = {
  supabaseUrl: "https://wnhmcbozesilmokyemgh.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaG1jYm96ZXNpbG1va3llbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzA5NzEsImV4cCI6MjA5Mjg0Njk3MX0.yGJbHmnK4jIFsy5RRnf8YhUURqDjxwGM8mnLCBQ3H5s",

  // Pagamento InfinitePay via Supabase Edge Functions.
  // O cliente será redirecionado para a InfinitePay e volta para retorno-pagamento.html.
  paymentProvider: "infinitepay",
  infinitePayHandle: "huskybolos",
  checkoutFunction: "create-infinitepay-checkout",
  checkFunction: "check-infinitepay-payment",
  paymentReturnUrl: "https://husky-app.vercel.app/retorno-pagamento.html",

  // Coloque o número real da Husky. Exemplo: 5511999999999
  whatsapp: "5511945198349",

  // Dados da loja usados como fallback visual.
  storeName: "Husky Confeiteiro",
  pixKey: "4aff227c-332e-4c32-8034-f8605805ba76"
};
