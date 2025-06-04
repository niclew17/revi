import { createClient } from "../../../../supabase/server";
import { notFound } from "next/navigation";

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

        <div className="bg-card rounded-xl p-6 shadow-lg border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Record Your Voice Review
            </h2>
            <p className="text-muted-foreground">
              This feature is coming soon! You'll be able to record a voice
              review that will be automatically transcribed and shared on your
              preferred platforms.
            </p>
          </div>

          <div className="flex justify-center py-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
                  🎤
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Thank you for your interest in providing feedback for{" "}
              {employeeName} at {companyName}. Voice recording functionality
              will be available soon!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
