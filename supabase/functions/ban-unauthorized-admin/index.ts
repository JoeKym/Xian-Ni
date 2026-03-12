import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user is already admin (don't ban admins)
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user_id, _role: "admin" });
    if (isAdmin) {
      return new Response(JSON.stringify({ ok: true, message: "User is admin" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already banned
    const { data: suspData } = await supabaseAdmin.rpc("is_user_suspended", { _user_id: user_id });
    if (suspData && (suspData as any).is_suspended) {
      return new Response(JSON.stringify({ ok: true, message: "Already suspended" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ban the user for unauthorized admin access
    await supabaseAdmin.from("user_suspensions").insert({
      user_id,
      type: "banned",
      reason: "Unauthorized admin dashboard access attempt",
    });

    return new Response(JSON.stringify({ ok: true, banned: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Ban error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
