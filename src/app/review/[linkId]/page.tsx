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
    .select(
      `
      *,
      users(name, email),
      company_info!inner(company_name, website)
    `,
    )
    .eq("unique_link_id", linkId)
    .single();

  if (error || !employee) {
    return notFound();
  }

  const companyName = employee.company_info?.company_name || "Company";
  const employeeName = employee.name || "Technician";

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
