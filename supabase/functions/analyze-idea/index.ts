import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { businessIdea } = await req.json();
    
    if (!businessIdea || typeof businessIdea !== 'string' || businessIdea.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Business idea is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a seasoned business analyst and venture capital expert. Analyze business ideas and provide structured ratings.

IMPORTANT: Use a grading scale from A to F where:
- A = Worst (Very Poor - High failure risk, avoid this idea)
- B = Poor (Significant issues, major concerns)
- C = Below Average (Some potential but notable weaknesses)
- D = Average (Decent idea with balanced pros/cons)
- E = Good (Strong potential with minor concerns)
- F = Best (Excellent - Strong fundamentals, high potential)

For each business idea, analyze these categories:
1. Overall Score - The comprehensive grade for the entire idea
2. Market Opportunity - Size of addressable market and growth potential
3. Risk Level - Financial, operational, and market risks (F = low risk, A = high risk)
4. Time to Profitability - How long until the business becomes profitable
5. Competition Intensity - Level of existing competition (F = low competition, A = saturated market)
6. Scalability - Ability to grow without proportional cost increases
7. Resource Requirements - Capital, talent, and infrastructure needed (F = low requirements, A = very high)

Provide a brief explanation (2-3 sentences) for each rating.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this business idea: "${businessIdea}"` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_analysis",
              description: "Provide structured business idea analysis with grades and explanations",
              parameters: {
                type: "object",
                properties: {
                  overallScore: {
                    type: "object",
                    properties: {
                      grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
                      explanation: { type: "string" }
                    },
                    required: ["grade", "explanation"]
                  },
                  marketOpportunity: {
                    type: "object",
                    properties: {
                      grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
                      explanation: { type: "string" }
                    },
                    required: ["grade", "explanation"]
                  },
                  riskLevel: {
                    type: "object",
                    properties: {
                      grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
                      explanation: { type: "string" }
                    },
                    required: ["grade", "explanation"]
                  },
                  timeToProfitability: {
                    type: "object",
                    properties: {
                      grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
                      explanation: { type: "string" }
                    },
                    required: ["grade", "explanation"]
                  },
                  competitionIntensity: {
                    type: "object",
                    properties: {
                      grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
                      explanation: { type: "string" }
                    },
                    required: ["grade", "explanation"]
                  },
                  scalability: {
                    type: "object",
                    properties: {
                      grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
                      explanation: { type: "string" }
                    },
                    required: ["grade", "explanation"]
                  },
                  resourceRequirements: {
                    type: "object",
                    properties: {
                      grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] },
                      explanation: { type: "string" }
                    },
                    required: ["grade", "explanation"]
                  },
                  summary: { type: "string", description: "A brief overall summary of the business idea analysis (2-3 sentences)" }
                },
                required: ["overallScore", "marketOpportunity", "riskLevel", "timeToProfitability", "competitionIntensity", "scalability", "resourceRequirements", "summary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_analysis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze idea" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "provide_analysis") {
      console.error("Unexpected response format:", data);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-idea function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});