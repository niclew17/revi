import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed, use POST",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 405,
      },
    );
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid "url" in request body',
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    // Crawl only homepage and about page
    const crawledContent = await crawlHomepageAndAbout(url);
    if (!crawledContent.trim()) {
      return new Response(
        JSON.stringify({
          error: "No content could be extracted from the website",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 422,
        },
      );
    }

    // Prepare OpenAI chat completion request body
    const openAIRequestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that extracts exactly ten adjectives describing a company's core values from the provided website content. Return the adjectives as a comma-separated list with no other text or formatting.",
        },
        {
          role: "user",
          content: `Analyze the following company website content and provide ten adjectives describing the company's core values:\n\n${crawledContent}`,
        },
      ],
      temperature: 0.7,
      n: 1,
      max_completion_tokens: 100,
    };

    // Call OpenAI via Pica Passthrough API
    const openAIResponse = await fetch(
      "https://api.picaos.com/v1/passthrough/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_OPENAI_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA",
        },
        body: JSON.stringify(openAIRequestBody),
      },
    );

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      return new Response(
        JSON.stringify({
          error: `OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`,
          details: errorText,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 502,
        },
      );
    }

    const openAIData = await openAIResponse.json();
    const adjectives = openAIData.choices?.[0]?.message?.content?.trim() || "";

    if (!adjectives) {
      return new Response(
        JSON.stringify({ error: "OpenAI response did not contain adjectives" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        },
      );
    }

    // Split the adjectives and create two lists of 5
    const adjectiveArray = adjectives
      .split(",")
      .map((adj) => adj.trim())
      .filter((adj) => adj.length > 0);

    // Ensure we have at least 10 adjectives, pad with generic ones if needed
    while (adjectiveArray.length < 10) {
      const fallbackAdjectives = [
        "Professional",
        "Reliable",
        "Dedicated",
        "Quality-Focused",
        "Results-Driven",
      ];
      const nextFallback =
        fallbackAdjectives[adjectiveArray.length - 5] || "Trustworthy";
      adjectiveArray.push(nextFallback);
    }

    // Take first 10, capitalize them, and split into two groups of 5
    const firstTen = adjectiveArray
      .slice(0, 10)
      .map((adj) => capitalizeWords(adj));
    const attributeSet1 = firstTen.slice(0, 5);
    const attributeSet2 = firstTen.slice(5, 10);

    return new Response(
      JSON.stringify({
        attributeSet1: attributeSet1,
        attributeSet2: attributeSet2,
        allAttributes: firstTen,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      },
    );
  }
});

// Simple function to crawl homepage and about page only
async function crawlHomepageAndAbout(homeUrl: string): Promise<string> {
  let allContent = "";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds total timeout

  try {
    // 1. Crawl Homepage
    try {
      const homeResponse = await fetch(homeUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebCrawler/1.0)",
        },
      });
      if (homeResponse.ok) {
        const homeHtml = await homeResponse.text();
        const homeText = extractTextFromHTML(homeHtml);
        if (homeText.trim()) {
          allContent += `--- Homepage ---\n${homeText}`;
        }
      }
    } catch (error) {
      console.error("Failed to crawl homepage:", error);
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Find and crawl About page
    const aboutUrl = await findAboutPage(homeUrl, controller.signal);
    if (aboutUrl) {
      try {
        const aboutResponse = await fetch(aboutUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; WebCrawler/1.0)",
          },
        });
        if (aboutResponse.ok) {
          const aboutHtml = await aboutResponse.text();
          const aboutText = extractTextFromHTML(aboutHtml);
          if (aboutText.trim()) {
            allContent += `\n\n--- About Page ---\n${aboutText}`;
          }
        }
      } catch (error) {
        console.error("Failed to crawl about page:", error);
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return allContent;
}

// Find the about page by testing common paths
async function findAboutPage(
  homeUrl: string,
  signal: AbortSignal,
): Promise<string | null> {
  const baseUrl = new URL(homeUrl);
  // Common about page paths (in order of preference)
  const aboutPaths = [
    "/about",
    "/about-us",
    "/about/",
    "/about-us/",
    "/company",
    "/company/",
    "/who-we-are",
    "/our-story",
    "/story",
  ];

  for (const path of aboutPaths) {
    try {
      const testUrl = new URL(path, baseUrl).href;
      // Use HEAD request to quickly check if page exists
      const response = await fetch(testUrl, {
        method: "HEAD",
        signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebCrawler/1.0)",
        },
      });
      if (response.ok) {
        return testUrl; // Found the about page!
      }
    } catch (error) {
      continue;
    }
  }
  return null; // No about page found
}

// Clean text extraction function
function extractTextFromHTML(html: string): string {
  // Remove script and style tags and their content
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
  // Remove all HTML tags but preserve some structure
  cleaned = cleaned
    .replace(/<\/?(?:h[1-6]|p|div|section|article)[^>]*>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, " ");
  // Decode HTML entities (basic)
  cleaned = cleaned
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, " ").replace(/\n\s+/g, "\n").trim();
  return cleaned;
}

// Helper function to capitalize the first letter of each word
function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join("-"),
    )
    .join(" ");
}
