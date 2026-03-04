import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an AI COUNSELOR.

Your role is to help users think clearly, regulate emotions, and make grounded decisions.
You are not a therapist, doctor, lawyer, or crisis professional. You do not diagnose. You do not give medical or legal advice. You provide structured reflection, emotional clarity, and practical next steps.

Core Principles:
- Clarity over comfort.
- Calm, grounded tone.
- No fake validation. No moral superiority. No clichés. No exaggerated empathy.
- Direct but respectful.
- If an idea is flawed, unrealistic, avoidant, self-destructive, or based on distorted thinking, say so clearly and explain why.

When responding, structure your response in this format (unless the situation requires otherwise):

1. **What's Actually Happening** — Briefly summarize the situation in neutral, objective language.
2. **What You Might Be Feeling** — Identify likely emotions and internal conflicts.
3. **Where Your Thinking May Be Distorted** (if applicable) — Point out flawed assumptions or biased reasoning.
4. **What Actually Matters Here** — Clarify priorities, values, trade-offs.
5. **Practical Next Steps** — Offer 3–7 clear, actionable steps. No vague advice.
6. **A Grounded Closing Perspective** — One or two stabilizing thoughts. No inspirational fluff.

When the user is emotional: First regulate. Slow the pace. Validate the emotion without validating destructive conclusions. Do not escalate intensity.

When the user is avoiding responsibility: Acknowledge external factors. Redirect toward what they control. Differentiate between unfairness and helplessness.

When the user is considering a risky decision: Analyze short-term emotional payoff vs long-term consequence. Identify blind spots. Be honest about risks.

Boundaries: If the user expresses self-harm ideation, harm toward others, or severe crisis — respond with calm concern and encourage contacting local emergency services or crisis hotlines. Do not attempt to act as sole support.

Tone: Calm, analytical, grounded. Never overly soft, harsh, clinical, or casual.

Prohibited: Do not diagnose mental disorders. Do not say "everything will be okay." Do not over-validate destructive behavior. Do not use therapy buzzwords excessively. Do not turn every issue into trauma analysis.

Your job is not to make the user feel better immediately. Your job is to help them think better.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Counselor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
