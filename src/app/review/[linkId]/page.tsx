import { createClient } from "../../../../supabase/server";
import { notFound } from "next/navigation";
import ReviewForm from "./review-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface ReviewPageProps {
  params: {
    linkId: string;
  };
}

// Loading component with logo
function ReviewPageLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              {/* Company Logo */}
              <div className="mb-6">
                <img
                  src="/images/logo.svg"
                  alt="Company Logo"
                  className="w-16 h-16 mx-auto"
                  style={{ display: "block" }}
                />
              </div>
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                Loading Review Form
              </h2>
              <p className="text-muted-foreground">
                Preparing your review experience...
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Async component that handles data fetching
async function ReviewPageContent({ linkId }: { linkId: string }) {
  let supabase;
  let employee = null;
  let companyInfo = null;
  let userInfo = null;

  try {
    supabase = await createClient();
  } catch (error) {
    return notFound();
  }

  // Fetch employee data based on the unique link ID with error handling
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("unique_link_id", linkId)
      .maybeSingle();

    if (error) {
      return notFound();
    }

    if (!data) {
      return notFound();
    }

    employee = data;
  } catch (error) {
    return notFound();
  }

  // Fetch company info with comprehensive error handling
  try {
    const { data, error } = await supabase
      .from("company_info")
      .select("company_name, website, business_description, google_reviews_url")
      .eq("user_id", employee.user_id)
      .maybeSingle();

    if (error) {
      // Continue without company info - use defaults
    } else {
      companyInfo = data;
    }
  } catch (error) {
    // Continue without company info - use defaults
  }

  // Fetch user info with comprehensive error handling
  try {
    const { data, error } = await supabase
      .from("users")
      .select("name, email")
      .eq("user_id", employee.user_id)
      .maybeSingle();

    if (error) {
      // Continue without user info - use defaults
    } else {
      userInfo = data;
    }
  } catch (error) {
    // Continue without user info - use defaults
  }

  // Generate dynamic attributes from company website with enhanced error handling
  let dynamicAttributes: string[] = [];
  let dynamicAdditionalAttributes: string[] = [];

  if (companyInfo?.website) {
    try {
      const { data: attributesData, error: attributesError } =
        await supabase.functions.invoke(
          "supabase-functions-generate-attributes",
          {
            body: {
              url: companyInfo.website,
            },
          },
        );

      if (attributesError) {
        // Continue with empty arrays - defaults will be used in the form
      } else if (
        attributesData?.attributeSet1 &&
        attributesData?.attributeSet2
      ) {
        dynamicAttributes = attributesData.attributeSet1;
        dynamicAdditionalAttributes = attributesData.attributeSet2;
      }
    } catch (error) {
      // Continue with empty arrays - defaults will be used in the form
    }
  }

  // Provide safe fallback values with proper null handling
  const companyName = companyInfo?.company_name || "Company";
  const employeeName = employee.name || userInfo?.name || "Technician";
  const businessDescription = companyInfo?.business_description || "";
  const googleReviewLink = companyInfo?.google_reviews_url || "";

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
          <p className="text-xl text-muted-foreground">
            Share your experience with {companyName}
          </p>
        </div>

        <ReviewForm
          employeeId={employee.id}
          employeeName={employeeName}
          companyName={companyName}
          businessDescription={businessDescription}
          dynamicAttributes={dynamicAttributes}
          dynamicAdditionalAttributes={dynamicAdditionalAttributes}
          googleReviewLink={googleReviewLink}
        />
      </div>
    </main>
  );
}

export default function ReviewPage({ params }: ReviewPageProps) {
  return (
    <Suspense fallback={<ReviewPageLoading />}>
      <ReviewPageContent linkId={params.linkId} />
    </Suspense>
  );
}
