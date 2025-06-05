import DashboardNavbar from "@/components/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import ReviewLinks from "@/components/review-links";

import Link from "next/link";
import { checkUserSubscription } from "../../actions";
import { InfoIcon } from "lucide-react";

export default async function ReviewLinksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check subscription status but don't redirect
  const isSubscribed = await checkUserSubscription(user?.id!);

  // Fetch employees
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header Section */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Review Links</h1>

              {!isSubscribed && (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg flex items-center gap-3">
                  <InfoIcon size="18" />
                  <div>
                    <p className="font-medium">Free Plan</p>
                    <p className="text-sm">
                      You're currently on the free plan with limited features.
                      <Link
                        href="/pricing"
                        className="text-primary underline ml-1"
                      >
                        Upgrade now
                      </Link>{" "}
                      to unlock all features.
                    </p>
                  </div>
                </div>
              )}
            </header>

            {/* Review Links */}
            <ReviewLinks employees={employees || []} />
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
