import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function moneyFromCents(value: unknown) {
  const n = Number(value || 0);
  return Math.round(n) / 100;
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const payload = await req.json();
    const orderNsu = String(payload.order_nsu || payload.orderNsu || "");
    if (!orderNsu) throw new Error("order_nsu não recebido.");

    const { data: session, error: sessionError } = await supabase
      .from("checkout_sessions")
      .select("*")
      .eq("order_nsu", orderNsu)
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session) throw new Error(`checkout_session não encontrada para ${orderNsu}.`);

    const transactionId = String(payload.transaction_nsu || payload.invoice_slug || payload.slug || orderNsu);

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("gateway_payment_id", transactionId)
      .maybeSingle();

    let payment = existingPayment;
    if (!payment) {
      const { data: insertedPayment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: session.user_id,
          gateway: "infinitepay",
          gateway_payment_id: transactionId,
          status: "approved",
          payment_method: payload.capture_method || "infinitepay",
          amount: moneyFromCents(payload.amount || session.total * 100),
          fee: Math.max(0, moneyFromCents((payload.paid_amount || payload.amount || 0)) - moneyFromCents(payload.amount || 0)),
          net_amount: moneyFromCents(payload.amount || session.total * 100),
          raw_response: payload,
          approved_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      payment = insertedPayment;
    } else {
      await supabase
        .from("payments")
        .update({
          status: "approved",
          raw_response: payload,
          approved_at: existingPayment.approved_at || new Date().toISOString(),
        })
        .eq("id", existingPayment.id);
    }

    const { data: existingOrder } = await supabase
      .from("customer_orders")
      .select("id")
      .eq("payment_id", payment.id)
      .maybeSingle();

    if (!existingOrder) {
      const orderItems = safeArray(session.items);
      const { data: order, error: orderError } = await supabase
        .from("customer_orders")
        .insert({
          order_number: session.order_nsu,
          user_id: session.user_id,
          payment_id: payment.id,
          status: "paid",
          payment_status: "approved",
          fulfillment: session.fulfillment || "delivery",
          channel: "app",
          subtotal: session.subtotal || session.total,
          delivery_fee: session.delivery_fee || 0,
          discount: session.discount || 0,
          total: session.total,
          coupon_code: session.coupon_code,
          customer_name: session.customer_name,
          customer_email: session.customer_email,
          customer_phone: session.customer_phone,
          address_snapshot: session.address_snapshot || {},
          customer_notes: "Pedido criado automaticamente após confirmação InfinitePay.",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      for (const item of orderItems) {
        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: item.id || item.product_id || null,
          product_name: item.name || item.product_name || item.description || "Item Husky",
          product_image: item.image_url || item.product_image || null,
          quantity: Number(item.qty || item.quantity || 1),
          unit_price: Number(item.unitTotal || item.unit_price || item.price || 0),
          addons: item.addOns || item.addons || [],
          observation: item.observation || "",
          total: Number(item.unitTotal || item.unit_price || item.price || 0) * Number(item.qty || item.quantity || 1),
        });

        const productId = item.id || item.product_id;
        const qty = Number(item.qty || item.quantity || 1);
        if (productId && qty > 0) {
          const { data: product } = await supabase.from("products").select("stock").eq("id", productId).maybeSingle();
          if (product && typeof product.stock === "number") {
            const newStock = Math.max(0, product.stock - qty);
            await supabase.from("products").update({
              stock: newStock,
              available: newStock > 0,
            }).eq("id", productId);
          }
        }
      }

      await supabase.from("order_history").insert({
        order_id: order.id,
        status: "paid",
        note: "Pagamento InfinitePay aprovado. Pedido enviado para a gestão.",
        created_by: session.user_id,
      });

      await supabase.from("notifications").insert({
        type: "order",
        title: "Novo pedido pago",
        message: `Pedido ${session.order_nsu} confirmado pela InfinitePay.`,
        read: false,
        metadata: { order_id: order.id, order_nsu: session.order_nsu },
      });
    }

    await supabase
      .from("checkout_sessions")
      .update({
        status: "paid",
        transaction_nsu: payload.transaction_nsu || null,
        gateway_slug: payload.invoice_slug || payload.slug || null,
        capture_method: payload.capture_method || null,
        receipt_url: payload.receipt_url || null,
        paid_amount: payload.paid_amount ? moneyFromCents(payload.paid_amount) : null,
        raw_webhook: payload,
        paid_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message || String(error) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
