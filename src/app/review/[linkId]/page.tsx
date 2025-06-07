import { createClient } from "../../../../supabase/server";
import { notFound } from "next/navigation";
import ReviewForm from "./review-form";

interface ReviewPageProps {
  params: {
    linkId: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { linkId } = params;
  const supabase = await createClient();

  // Fetch employee data based on the unique link ID
  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("unique_link_id", linkId)
    .maybeSingle();

  if (error) {
    console.error("Employee fetch error:", error);
    return notFound();
  }

  if (!employee) {
    console.error("Employee not found for linkId:", linkId);
    return notFound();
  }

  // Fetch company info separately
  const { data: companyInfo } = await supabase
    .from("company_info")
    .select("company_name, website")
    .eq("user_id", employee.user_id)
    .single();

  // Fetch user info separately
  const { data: userInfo } = await supabase
    .from("users")
    .select("name, email")
    .eq("user_id", employee.user_id)
    .single();

  const companyName = companyInfo?.company_name || "Company";
  const employeeName = employee.name || userInfo?.name || "Technician";

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
          <p className="text-xl text-muted-foreground">
            Share your experience with {employeeName}
          </p>
        </div>

        <ReviewForm
          employeeId={employee.id}
          employeeName={employeeName}
          companyName={companyName}
        />
      </div>
    </main>
  );
}
