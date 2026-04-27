// Exemplo de Supabase Edge Function: create-pix-payment
// Cole no Dashboard do Supabase > Edge Functions > create-pix-payment.
// Configure secrets: MERCADO_PAGO_ACCESS_TOKEN e SUPABASE_SERVICE_ROLE_KEY.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData.user) throw new Error("Usuário não autenticado.");

    const body = await req.json();
    const total = Number(body.total || 0);
    if (!total || total <= 0) throw new Error("Total inválido.");

    const paymentRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpToken}`,
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        transaction_amount: total,
        description: "Pedido Husky Confeiteiro",
        payment_method_id: "pix",
        payer: { email: userData.user.email },
        metadata: {
          user_id: userData.user.id,
          cart: body.cart,
          coupon_code: body.couponCode,
          fulfillment: body.fulfillment,
        },
      }),
    });

    const payment = await paymentRes.json();
    if (!paymentRes.ok) throw new Error(payment.message || "Erro ao criar pagamento Pix.");

    await supabase.from("payments").insert({
      user_id: userData.user.id,
      gateway: "mercado_pago",
      gateway_payment_id: String(payment.id),
      status: payment.status || "pending",
      payment_method: "Pix",
      amount: total,
      pix_qr_code: payment.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      pix_copy_paste: payment.point_of_interaction?.transaction_data?.qr_code || null,
      raw_response: payment,
    });

    return new Response(JSON.stringify({
      paymentId: String(payment.id),
      status: payment.status,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code_base64
        ? `data:image/png;base64,${payment.point_of_interaction.transaction_data.qr_code_base64}`
        : null,
      pixCopyPaste: payment.point_of_interaction?.transaction_data?.qr_code || null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
