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
      features: ["Up to 10 reviews", "1 seat"],
      popular: false,
    };

    // Modify existing plans to add features and mark business tier
    const modifiedPlans = plans.data.map((plan) => {
      // Assuming $10/month plan is the business tier
      if (plan.amount === 1000) {
        return {
          ...plan,
          name: "Business",
          features: ["Up to 500 reviews per month", "10 seats"],
          popular: true,
          price: plan.id, // Store the actual price ID for Stripe checkout
        };
      }
      return {
        ...plan,
        price: plan.id, // Store the actual price ID for all plans
      };
    });

    // Combine free tier with modified plans
    const allPlans = [freeTier, ...modifiedPlans];

    return new Response(JSON.stringify(allPlans), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
