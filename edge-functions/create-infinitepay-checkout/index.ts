import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function cents(value: number) {
  return Math.max(1, Math.round(Number(value || 0) * 100));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) throw new Error("Usuário não autenticado.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Usuário não autenticado.");

    const body = await req.json();
    const total = Number(body.total || 0);
    if (!total || total <= 0) throw new Error("Total inválido.");

    const handle = String(Deno.env.get("INFINITEPAY_HANDLE") || body.handle || "huskybolos").replace("$", "");
    const siteUrl = String(Deno.env.get("SITE_URL") || "https://husky-app.vercel.app").replace(/\/$/, "");
    const redirectUrl = String(body.returnUrl || Deno.env.get("INFINITEPAY_REDIRECT_URL") || `${siteUrl}/retorno-pagamento.html`);
    const webhookUrl = String(Deno.env.get("INFINITEPAY_WEBHOOK_URL") || `${supabaseUrl}/functions/v1/infinitepay-webhook`);

    const orderNsu = `HUS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const checkoutItemDescription = `Pedido ${orderNsu} - Husky Confeiteiro`;

    const payload = {
      handle,
      redirect_url: `${redirectUrl}?order_nsu=${encodeURIComponent(orderNsu)}`,
      webhook_url: webhookUrl,
      order_nsu: orderNsu,
      items: [
        {
          quantity: 1,
          price: cents(total),
          description: checkoutItemDescription,
        },
      ],
    };

    const { data: sessionRow, error: sessionError } = await supabase
      .from("checkout_sessions")
      .insert({
        user_id: userData.user.id,
        order_nsu: orderNsu,
        gateway: "infinitepay",
        status: "pending",
        total,
        subtotal: Number(body.subtotal || 0),
        delivery_fee: Number(body.deliveryFee || 0),
        discount: Number(body.discount || 0),
        coupon_code: body.couponCode || null,
        fulfillment: body.fulfillment || "delivery",
        customer_email: userData.user.email,
        customer_name: body.customer?.name || userData.user.user_metadata?.name || null,
        customer_phone: body.customer?.phone || userData.user.user_metadata?.phone || null,
        address_snapshot: body.address || null,
        items: body.items || [],
        raw_request: payload,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const checkout = await response.json();
    if (!response.ok || !checkout.url) {
      await supabase.from("checkout_sessions").update({
        status: "failed",
        raw_response: checkout,
      }).eq("id", sessionRow.id);
      throw new Error(checkout.message || checkout.error || "Erro ao criar link InfinitePay.");
    }

    await supabase.from("checkout_sessions").update({
      checkout_url: checkout.url,
      gateway_slug: checkout.slug || checkout.invoice_slug || null,
      raw_response: checkout,
    }).eq("id", sessionRow.id);

    return new Response(JSON.stringify({
      url: checkout.url,
      orderNsu,
      checkoutSessionId: sessionRow.id,
      status: "pending",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
