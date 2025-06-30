import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const plans = await stripe.plans.list({
      active: true,
    });

    // Add free tier to the plans
    const freeTier = {
      id: "free-tier",
      name: "Free",
      amount: 0,
      interval: "month",
      currency: "usd",
      features: ["1 employee", "10 free reviews"],
      popular: false,
    };

    // Modify existing plans to add features and mark business tier
    const modifiedPlans = plans.data.map((plan) => {
      // Assuming $30/month plan is the business tier
      if (plan.amount === 3000) {
        return {
          ...plan,
          name: "Business",
          features: ["Up to 10 employees", "100 reviews per month"],
          popular: true,
          price: plan.id, // Store the actual price ID for Stripe checkout
        };
      }
      // Check for Enterprise tier (assuming $100/month)
      if (plan.amount >= 10000) {
        return {
          ...plan,
          name: "Enterprise",
          features: [
            "Up to 50 employees",
            "Unlimited reviews",
            "Priority support",
            "Custom integrations",
          ],
          popular: false,
          price: plan.id, // Store the actual price ID for Stripe checkout
        };
      }
      return {
        ...plan,
        price: plan.id, // Store the actual price ID for all plans
      };
    });

    // Sort plans by amount to ensure proper order: Free (0), Business (3000), Enterprise (10000+)
    const sortedPlans = modifiedPlans.sort((a, b) => a.amount - b.amount);

    // Combine free tier with sorted plans
    const allPlans = [freeTier, ...sortedPlans];

    return new Response(JSON.stringify(allPlans), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting products:", error);

    // If Stripe API fails (e.g., expired key), return fallback plans
    if (error.code === "api_key_expired" || error.statusCode === 401) {
      console.log("Stripe API key expired, returning fallback plans");

      const fallbackPlans = [
        {
          id: "free-tier",
          name: "Free",
          amount: 0,
          interval: "month",
          currency: "usd",
          features: ["1 employee", "10 free reviews"],
          popular: false,
        },
        {
          id: "business-tier",
          name: "Business",
          amount: 3000,
          interval: "month",
          currency: "usd",
          features: ["Up to 10 employees", "100 reviews per month"],
          popular: true,
          price: "price_business", // Fallback price ID
        },
        {
          id: "enterprise-tier",
          name: "Enterprise",
          amount: 10000,
          interval: "month",
          currency: "usd",
          features: [
            "Up to 50 employees",
            "Unlimited reviews",
            "Priority support",
            "Custom integrations",
          ],
          popular: false,
          price: "price_enterprise", // Fallback price ID
        },
      ];

      return new Response(JSON.stringify(fallbackPlans), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
