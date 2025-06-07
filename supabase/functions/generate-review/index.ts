import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { selectedQualities, businessName, businessDescription } =
      await req.json();

    if (
      !selectedQualities ||
      !Array.isArray(selectedQualities) ||
      selectedQualities.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "Selected qualities are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    if (!businessName || !businessDescription) {
      return new Response(
        JSON.stringify({ error: "Business name and description are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const qualitiesList = selectedQualities.join(", ");

    // Log the data being sent to verify it's correct
    console.log("Generating review with data:", {
      businessName,
      businessDescription,
      selectedQualities,
    });

    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a customer review generator. ABSOLUTE CRITICAL RULES:

1. COMPANY NAME: You must ONLY use the exact company name: "${businessName}"
2. BUSINESS DESCRIPTION: The company does: ${businessDescription}
3. FORBIDDEN: You are COMPLETELY FORBIDDEN from using ANY other company names
4. VALIDATION: Every review MUST mention "${businessName}" at least twice
5. CONTEXT: Write as a satisfied customer of "${businessName}" specifically

IF YOU USE ANY OTHER COMPANY NAME, THE SYSTEM WILL FAIL.`,
        },
        {
          role: "user",
          content: `GENERATE A CUSTOMER REVIEW FOR:

COMPANY: "${businessName}"
SERVICE: ${businessDescription}
QUALITIES TO HIGHLIGHT: ${qualitiesList}

REQUIREMENTS:
- Use "${businessName}" exactly as written (at least 2 times)
- Reference their service: ${businessDescription}
- Highlight these qualities: ${qualitiesList}
- Write as a genuine customer experience
- Keep it natural and authentic
- EXACTLY 4-5 sentences in ONE paragraph only
- No line breaks or multiple paragraphs
- Keep it concise and impactful

START YOUR REVIEW NOW:`,
        },
      ],
      temperature: 0.1,
      max_completion_tokens: 500,
    };

    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY")!,
          "x-pica-connection-key": Deno.env.get("PICA_OPENAI_CONNECTION_KEY")!,
          "x-pica-action-id":
            "conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `OpenAI API error: ${response.status} ${response.statusText}`,
        errorText,
      );
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Log the full response for debugging
    console.log("OpenAI API Response:", JSON.stringify(data, null, 2));

    const generatedReview = data.choices[0]?.message?.content;

    if (!generatedReview) {
      throw new Error("No review content generated");
    }

    // Verify the review contains the correct business name
    if (!generatedReview.toLowerCase().includes(businessName.toLowerCase())) {
      console.error(
        "CRITICAL ERROR: Generated review does not contain the business name:",
        {
          businessName,
          generatedReview,
        },
      );

      // Return an error instead of the incorrect review
      return new Response(
        JSON.stringify({
          error: `AI failed to use correct company name. Expected: ${businessName}, but review was about a different company.`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Additional validation: Check for common wrong company names
    const forbiddenNames = [
      "precision carpentry",
      "carpentry services",
      "abc company",
      "xyz services",
      "construction",
      "contractor",
      "home services",
      "renovation",
    ];

    const reviewLower = generatedReview.toLowerCase();
    for (const forbidden of forbiddenNames) {
      if (
        reviewLower.includes(forbidden) &&
        !businessName.toLowerCase().includes(forbidden)
      ) {
        console.error(
          "CRITICAL ERROR: Review contains forbidden company reference:",
          {
            businessName,
            forbiddenName: forbidden,
            generatedReview,
          },
        );

        return new Response(
          JSON.stringify({
            error: `AI generated review about wrong company type. Expected review about: ${businessName}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }
    }

    return new Response(JSON.stringify({ review: generatedReview }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating review:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate review" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
