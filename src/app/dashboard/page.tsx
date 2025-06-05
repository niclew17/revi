import DashboardNavbar from "@/components/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import CompanyForm from "@/components/company-form";

import Link from "next/link";
import { checkUserSubscription } from "../actions";
import { InfoIcon, UserCircle } from "lucide-react";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check subscription status but don't redirect
  const isSubscribed = await checkUserSubscription(user?.id!);

  // Fetch company information if it exists
  const { data: companyData } = await supabase
    .from("company_info")
    .select("*")
    .eq("user_id", user.id)
    .single();

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
              <h1 className="text-3xl font-bold mb-4">Company Information</h1>

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

            {/* Company Form */}
            <CompanyForm companyInfo={companyData || null} userId={user.id} />

            {/* User Profile Section */}
            <section className="bg-card rounded-xl p-6 border shadow-sm mt-8">
              <div className="flex items-center gap-4 mb-6">
                <UserCircle size={48} className="text-primary" />
                <div>
                  <h2 className="font-semibold text-xl">User Profile</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
                <pre className="text-xs font-mono max-h-48 overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </section>
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
