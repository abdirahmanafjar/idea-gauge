import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ImageFile {
  name: string;
  type: string;
  base64: string;
}

// Extract text from images using vision model
async function extractTextFromImages(images: ImageFile[], apiKey: string): Promise<string> {
  if (!images || images.length === 0) return "";

  console.log(`Extracting text from ${images.length} images using OCR...`);

  const imageContents = images.map(img => ({
    type: "image_url" as const,
    image_url: {
      url: `data:${img.type};base64,${img.base64}`
    }
  }));

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text visible in these images. Include any business-related information, diagrams with labels, handwritten notes, or any relevant content. Format the extracted text clearly. If there's no readable text, describe any business-relevant visual content (charts, diagrams, logos, etc.)."
            },
            ...imageContents
          ]
        }
      ],
    }),
  });

  if (!response.ok) {
    console.error("OCR extraction failed:", response.status);
    return "";
  }

  const data = await response.json();
  const extractedText = data.choices?.[0]?.message?.content || "";
  console.log("Extracted text from images:", extractedText.substring(0, 200) + "...");
  return extractedText;
}

// Single idea analysis
async function analyzeSingleIdea(businessIdea: string, images: ImageFile[], apiKey: string) {
  // Extract text from images if any
  let imageContext = "";
  if (images && images.length > 0) {
    const extractedText = await extractTextFromImages(images, apiKey);
    if (extractedText) {
      imageContext = `\n\nAdditional context from attached images:\n${extractedText}`;
    }
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
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this business idea: "${businessIdea}"${imageContext}` }
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

  return response;
}

// Compare two ideas
async function compareIdeas(idea1: string, idea2: string, images1: ImageFile[], images2: ImageFile[], apiKey: string) {
  // Extract text from images for both ideas
  let imageContext1 = "";
  let imageContext2 = "";
  
  if (images1 && images1.length > 0) {
    const extractedText = await extractTextFromImages(images1, apiKey);
    if (extractedText) {
      imageContext1 = `\n\nAdditional context from attached images:\n${extractedText}`;
    }
  }
  
  if (images2 && images2.length > 0) {
    const extractedText = await extractTextFromImages(images2, apiKey);
    if (extractedText) {
      imageContext2 = `\n\nAdditional context from attached images:\n${extractedText}`;
    }
  }

  const systemPrompt = `You are a seasoned business analyst and venture capital expert. Compare two business ideas and provide structured ratings for both.

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

Provide a brief explanation (2-3 sentences) for each rating. Then determine which idea is the winner based on overall potential.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Compare these two business ideas:\n\nIdea 1: "${idea1}"${imageContext1}\n\nIdea 2: "${idea2}"${imageContext2}` }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "provide_comparison",
            description: "Provide structured comparison of two business ideas with grades and explanations",
            parameters: {
              type: "object",
              properties: {
                idea1: {
                  type: "object",
                  properties: {
                    overallScore: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    marketOpportunity: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    riskLevel: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    timeToProfitability: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    competitionIntensity: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    scalability: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    resourceRequirements: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    summary: { type: "string" }
                  },
                  required: ["overallScore", "marketOpportunity", "riskLevel", "timeToProfitability", "competitionIntensity", "scalability", "resourceRequirements", "summary"]
                },
                idea2: {
                  type: "object",
                  properties: {
                    overallScore: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    marketOpportunity: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    riskLevel: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    timeToProfitability: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    competitionIntensity: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    scalability: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    resourceRequirements: { type: "object", properties: { grade: { type: "string", enum: ["A", "B", "C", "D", "E", "F"] }, explanation: { type: "string" } }, required: ["grade", "explanation"] },
                    summary: { type: "string" }
                  },
                  required: ["overallScore", "marketOpportunity", "riskLevel", "timeToProfitability", "competitionIntensity", "scalability", "resourceRequirements", "summary"]
                },
                winner: { type: "string", enum: ["idea1", "idea2", "tie"], description: "Which idea is better overall" },
                comparisonSummary: { type: "string", description: "A summary comparing both ideas and explaining why one wins (3-4 sentences)" }
              },
              required: ["idea1", "idea2", "winner", "comparisonSummary"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "provide_comparison" } }
    }),
  });

  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { businessIdea, analysisMode, images, idea1, idea2, images1, images2 } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle comparison mode
    if (analysisMode === "compare" && idea1 && idea2) {
      console.log("Comparing two ideas...");
      
      const response = await compareIdeas(idea1, idea2, images1 || [], images2 || [], LOVABLE_API_KEY);

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
          JSON.stringify({ error: "Failed to compare ideas" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      console.log("AI comparison response:", JSON.stringify(data));

      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== "provide_comparison") {
        console.error("Unexpected response format:", data);
        return new Response(
          JSON.stringify({ error: "Failed to parse comparison" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const comparison = JSON.parse(toolCall.function.arguments);

      return new Response(
        JSON.stringify({ comparison }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle single idea analysis
    if (!businessIdea || typeof businessIdea !== 'string' || businessIdea.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Business idea is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Analyzing single idea...");
    const response = await analyzeSingleIdea(businessIdea, images || [], LOVABLE_API_KEY);

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
