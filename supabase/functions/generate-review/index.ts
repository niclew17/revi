import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { selectedQualities } = await req.json();

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

    const qualitiesList = selectedQualities.join(", ");
    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that writes positive and coherent reviews based on given qualities. Write a natural, authentic-sounding review that highlights the mentioned qualities without being overly promotional.",
        },
        {
          role: "user",
          content: `Create a positive review highlighting the following qualities: ${qualitiesList}. Make it sound natural and authentic, as if written by a real customer.`,
        },
      ],
      temperature: 0.7,
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
    const generatedReview = data.choices[0]?.message?.content;

    if (!generatedReview) {
      throw new Error("No review content generated");
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
