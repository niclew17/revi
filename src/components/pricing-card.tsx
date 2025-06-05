"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { supabase } from "../../supabase/supabase";

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user?.id || null,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user?.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <Card
      className={`w-[350px] relative overflow-hidden ${item.popular ? "border-2 border-custom-blue shadow-xl scale-105" : "border border-gray-200"}`}
    >
      {item.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-custom-blue/10 via-white to-black/10 opacity-30" />
      )}
      <CardHeader className="relative">
        {item.popular && (
          <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-custom-blue to-black rounded-full w-fit mb-4">
            Most Popular
          </div>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-baseline gap-2 mt-2">
          <span className="text-4xl font-bold text-gray-900">
            ${item?.amount / 100}
          </span>
          <span className="text-gray-600">/{item?.interval}</span>
        </CardDescription>
        {item.features && (
          <ul className="mt-4 space-y-2">
            {item.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
      <CardFooter className="relative">
        <Button
          onClick={async () => {
            if (item.id === "free-tier") {
              window.location.href = "/dashboard";
            } else {
              // Check if user is signed in
              if (!user) {
                // Redirect to sign-in page with return URL to pricing page
                window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`;
              } else {
                // Use the price ID from the item object
                await handleCheckout(item.price || item.id);
              }
            }
          }}
          className={`w-full py-6 text-lg font-medium`}
        >
          {item.id === "free-tier" ? "Start Free" : "Get Started"}
        </Button>
      </CardFooter>
    </Card>
  );
}
