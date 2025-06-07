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
          content:
            "You are a customer review generator. CRITICAL RULE: You must ONLY use the exact company name provided. Any deviation from the provided company name will result in system failure. You are FORBIDDEN from using ANY other company names including but not limited to: Precision Carpentry Services, ABC Company, XYZ Services, or any construction/carpentry related names. You must write reviews ONLY about the specific business provided.",
        },
        {
          role: "user",
          content: `MANDATORY REQUIREMENTS - FAILURE TO COMPLY WILL CAUSE SYSTEM ERROR:

1. Company Name: "${businessName}" - THIS IS THE ONLY COMPANY NAME YOU CAN USE
2. Business Type: ${businessDescription}
3. Qualities: ${qualitiesList}

WRITE A CUSTOMER REVIEW ABOUT "${businessName}" ONLY. The review must:
- Mention "${businessName}" by name at least twice
- Reference the business type from the description
- Include the specified qualities: ${qualitiesList}
- Be written as if you are a satisfied customer of "${businessName}"

DO NOT WRITE ABOUT ANY OTHER COMPANY. ONLY "${businessName}".`,
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
