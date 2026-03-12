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
    const { content, user_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Call AI to check content
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a content moderation AI. Analyze the given text and determine if it contains hateful, abusive, threatening, or severely inappropriate content.
            
Respond ONLY with a JSON object (no markdown):
{
  "is_hateful": boolean,
  "severity": "none" | "mild" | "moderate" | "severe",
  "reason": "brief explanation"
}

- "none": clean content
- "mild": slightly rude but acceptable
- "moderate": hateful/abusive language that warrants a warning or suspension
- "severe": extreme hate speech, threats of violence, or highly dangerous content that warrants a ban`,
          },
          { role: "user", content: `Analyze this comment: "${content}"` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI gateway error:", aiResponse.status);
      // On AI failure, allow content through (fail-open for availability)
      return new Response(JSON.stringify({ allowed: true, severity: "none" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.choices?.[0]?.message?.content || "";
    
    // Parse AI response
    let moderation = { is_hateful: false, severity: "none", reason: "" };
    try {
      const cleaned = aiText.replace(/```json\n?|\n?```/g, "").trim();
      moderation = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", aiText);
      return new Response(JSON.stringify({ allowed: true, severity: "none" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If content is moderate or severe and we have a user_id, apply suspension/ban
    if (user_id && (moderation.severity === "moderate" || moderation.severity === "severe")) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (moderation.severity === "severe") {
        // Ban the user
        await supabaseAdmin.from("user_suspensions").insert({
          user_id,
          type: "banned",
          reason: `Automated: ${moderation.reason}`,
        });
      } else {
        // Suspend for 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await supabaseAdmin.from("user_suspensions").insert({
          user_id,
          type: "suspended",
          reason: `Automated: ${moderation.reason}`,
          expires_at: expiresAt.toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({
        allowed: moderation.severity === "none" || moderation.severity === "mild",
        severity: moderation.severity,
        reason: moderation.reason,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Moderation error:", e);
    return new Response(
      JSON.stringify({ allowed: true, severity: "none", error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
