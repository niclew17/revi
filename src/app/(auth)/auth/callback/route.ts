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
      return NextResponse.redirect(
        new URL(
          "/sign-in?error=" +
            encodeURIComponent("Verification failed. Please try again."),
          process.env.NEXT_PUBLIC_SITE_URL || "https://www.getrevio.io",
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
  // For email verification, redirect to sign-in page
  const redirectTo =
    type === "signup" ? "/sign-in" : redirect_to || "/dashboard";

  // Use production URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.getrevio.io";
  return NextResponse.redirect(new URL(redirectTo, baseUrl));
}
