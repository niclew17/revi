import DashboardNavbar from "@/components/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import EmployeeForm from "@/components/employee-form";

import Link from "next/link";
import { checkUserSubscription, getUserEmployeeLimit } from "../../actions";
import { InfoIcon } from "lucide-react";

export default async function EmployeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check subscription status but don't redirect
  const isSubscribed = await checkUserSubscription(user?.id!);
  const employeeLimit = await getUserEmployeeLimit(user.id);

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
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header Section */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Employees</h1>

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

            {/* Employee Form */}
            <EmployeeForm
              employees={employees || []}
              userId={user.id}
              employeeLimit={employeeLimit}
              isSubscribed={isSubscribed}
            />
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
