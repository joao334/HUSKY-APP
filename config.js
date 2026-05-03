window.HUSKY_CONFIG = {
  brandName: "Husky Confeitaria",
  storeName: "Husky Confeitaria e Caixa",
  city: "Embu das Artes",
  whatsapp: "5511945198349",
  instagramHandle: "huskybolos",
  instagramUrl: "https://www.instagram.com/huskybolos/",

  appName: "Husk iFood",

  // Google Login via Supabase Auth. Se o Google Provider ja foi ativado no Supabase,
  // nao precisa colocar Client ID aqui. Este campo fica apenas como plano B para Google Identity Services.
  googleClientId: "",

  // Integracao iFood opcional. Preencha com os dados oficiais da conta/parceiro.
  ifood: {
    enabled: false,
    merchantId: "",
    clientId: "",
    clientSecret: "",
    autoImportOrders: true,
    autoSyncMenu: true
  },

  // Supabase opcional. O app funciona em modo demonstracao com localStorage.
  // Para publicar com dados reais, preencha abaixo e rode o SQL da pasta sql.
  supabaseUrl: "https://wnhmcbozesilmokyemgh.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaG1jYm96ZXNpbG1va3llbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNzA5NzEsImV4cCI6MjA5Mjg0Njk3MX0.yGJbHmnK4jIFsy5RRnf8YhUURqDjxwGM8mnLCBQ3H5s",

  paymentProvider: "infinitepay",
  infinitePayHandle: "huskybolos",
  checkoutFunction: "create-infinitepay-checkout",
  checkFunction: "check-infinitepay-payment",
  paymentReturnUrl: "https://husky-app.vercel.app/retorno-pagamento.html",

  deliveryFee: 6.99,
  freeDeliveryFrom: 45,
  minOrder: 18,
  serviceArea: ["Centro", "Jardim Vista Alegre", "Parque Pirajussara", "Santo Eduardo"],
  openingHours: {
    monday: "Fechado",
    tuesday: "14:00 as 21:00",
    wednesday: "14:00 as 21:00",
    thursday: "14:00 as 21:00",
    friday: "14:00 as 22:00",
    saturday: "12:00 as 22:00",
    sunday: "12:00 as 20:00"
  }
};
