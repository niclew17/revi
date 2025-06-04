import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import CompanyForm from "@/components/company-form";
import EmployeeForm from "@/components/employee-form";
import ReviewLinks from "@/components/review-links";

import Link from "next/link";
import { checkUserSubscription } from "../actions";
import { InfoIcon, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Fetch employees
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>

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

          {/* Management Tabs */}
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="company">Company Info</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="review-links">Review Links</TabsTrigger>
            </TabsList>
            <TabsContent value="company" className="mt-6">
              <CompanyForm companyInfo={companyData || null} userId={user.id} />
            </TabsContent>
            <TabsContent value="employees" className="mt-6">
              <EmployeeForm employees={employees || []} userId={user.id} />
            </TabsContent>
            <TabsContent value="review-links" className="mt-6">
              <ReviewLinks employees={employees || []} />
            </TabsContent>
          </Tabs>

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm mt-4">
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
    </SubscriptionCheck>
  );
}
