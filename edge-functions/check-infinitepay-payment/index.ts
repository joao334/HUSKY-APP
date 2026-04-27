import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    const orderNsu = String(body.orderNsu || body.order_nsu || "");
    if (!orderNsu) throw new Error("orderNsu obrigatório.");

    const { data: session, error } = await supabase
      .from("checkout_sessions")
      .select("*")
      .eq("order_nsu", orderNsu)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) throw error;

    const { data: order } = await supabase
      .from("customer_orders")
      .select("id, order_number, status, payment_status")
      .eq("order_number", orderNsu)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    return new Response(JSON.stringify({
      status: session?.status || (order ? "paid" : "pending"),
      paid: session?.status === "paid" || !!order,
      order,
      orderNsu,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
