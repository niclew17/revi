import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect_to = requestUrl.searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  const redirectTo = redirect_to || "/dashboard";

  // Use production URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.getrevio.io";
  return NextResponse.redirect(new URL(redirectTo, baseUrl));
}
