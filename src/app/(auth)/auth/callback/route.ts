import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      // Use the request URL's origin for error redirects too
      const baseUrl = new URL(request.url).origin;
      return NextResponse.redirect(
        new URL(
          "/sign-in?error=" +
            encodeURIComponent("Verification failed. Please try again."),
          baseUrl,
        ),
      );
    }

    // Log successful verification
    console.log("Verification successful:", {
      type,
      userId: data?.user?.id,
      email: data?.user?.email,
      emailConfirmed: data?.user?.email_confirmed_at,
    });
  }

  // URL to redirect to after sign in process completes
  // Always redirect to dashboard after successful verification
  const redirectTo = redirect_to || "/dashboard";

  // Use the request URL's origin for redirects to ensure proper domain
  const baseUrl = new URL(request.url).origin;
  console.log("Redirecting to:", redirectTo, "with base URL:", baseUrl);
  return NextResponse.redirect(new URL(redirectTo, baseUrl));
}
