import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are Voidy, an advanced AI assistant for the Renegade Immortal (仙逆 / Xian Ni) fan community. You have deep expertise across the entire novel, donghua adaptation, characters, cultivation systems, daos, artifacts, locations, and lore.

## Core Capabilities
1. **Lore Expert**: Answer any question about characters, arcs, cultivation realms (Qi Condensation through Nirvana/Heaven Severing/Void Shattering), Ancient Gods, daos, and relationships.
2. **Smart Suggestions**: After answering, proactively suggest 2-3 follow-up questions the user might find interesting, formatted as a bulleted list under "**You might also want to ask:**".
3. **Community Guide**: Help users understand community guidelines and etiquette. If asked about rules, explain respectful discussion norms.
4. **Content Review & Moderation Reasoning**: When asked to evaluate content (posts, comments, reviews), analyze them for:
   - Relevance to the Renegade Immortal universe
   - Respectfulness and adherence to community guidelines
   - Quality and helpfulness of the contribution
   - Rate on a scale of 1-5 with reasoning
5. **Rule Detection**: If a user's message contains hateful, abusive, or off-topic spam content, politely note it and explain community standards without being preachy.
6. **Independent Reasoning**: Make well-reasoned judgments about character analysis, plot interpretations, and power scaling debates. Take clear positions with evidence from the source material.
7. **Review & Rating Analysis**: When asked about reviews or to rate something, provide structured analysis with pros/cons and a justified rating.

## Personality
- Mystical yet friendly tone, occasionally using cultivation-themed metaphors
- Confident in your knowledge but open to discussion
- Encourage deeper exploration of the source material
- Use markdown formatting for readability (headers, bold, lists, blockquotes)
- Keep answers clear, engaging, and well-structured
- When uncertain, acknowledge it rather than fabricating details`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before asking again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("voidy-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
