// Exemplo de Supabase Edge Function: check-payment-status
// Consulta o pagamento. Em produção, o ideal é também criar um webhook do Mercado Pago.

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
    const paymentId = String(body.paymentId || "");
    if (!paymentId) throw new Error("paymentId obrigatório.");

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });
    const payment = await mpRes.json();
    if (!mpRes.ok) throw new Error(payment.message || "Erro ao consultar pagamento.");

    const paid = payment.status === "approved";

    const { data: paymentRow } = await supabase
      .from("payments")
      .select("*")
      .eq("gateway_payment_id", paymentId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (paid && paymentRow) {
      await supabase.from("payments").update({ status: "approved", approved_at: new Date().toISOString(), raw_response: payment }).eq("id", paymentRow.id);

      const existing = await supabase.from("customer_orders").select("id").eq("payment_id", paymentRow.id).maybeSingle();
      if (!existing.data) {
        // Para produção, salve carrinho/checkout_session junto do payment para recriar os itens corretamente.
        await supabase.from("customer_orders").insert({
          order_number: `HUS-${Math.floor(1000 + Math.random() * 9000)}`,
          user_id: userData.user.id,
          payment_id: paymentRow.id,
          status: "paid",
          payment_status: "approved",
          fulfillment: "delivery",
          subtotal: paymentRow.amount,
          delivery_fee: 0,
          discount: 0,
          total: paymentRow.amount,
          customer_email: userData.user.email,
          address_snapshot: {},
        });
      }
    }

    return new Response(JSON.stringify({ status: payment.status, paid }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
