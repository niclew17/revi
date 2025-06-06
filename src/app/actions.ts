"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { v4 as uuidv4 } from "uuid";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";

  console.log("Starting signup process for email:", email);

  if (!email || !password) {
    console.log("Missing email or password");
    return redirect(
      `/sign-up?error=${encodeURIComponent("Email and password are required")}`,
    );
  }

  const supabase = await createClient();

  // First check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    console.log("User already exists with this email");
    return redirect(
      `/sign-up?error=${encodeURIComponent("An account with this email already exists. Please sign in instead.")}`,
    );
  }

  // Get site URL from env or use default
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.getrevio.io";
  const redirectUrl = `${siteUrl}/auth/callback`;

  console.log("Using redirect URL:", redirectUrl);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
      emailRedirectTo: redirectUrl,
    },
  });

  console.log("Signup response:", {
    user: data?.user?.id,
    error: error?.message,
  });

  if (error) {
    console.error("Supabase signup error:", error);
    return redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user) {
    console.error("No user returned from signup");
    return redirect(
      `/sign-up?error=${encodeURIComponent("Failed to create account. Please try again.")}`,
    );
  }

  if (!data.user.email_confirmed_at) {
    console.log("Email confirmation needed, redirecting to success page");
    return redirect(
      `/sign-up?success=${encodeURIComponent("Thanks for signing up! Please check your email for a verification link.")}`,
    );
  }

  // If user is immediately confirmed, redirect to dashboard
  console.log("User confirmed immediately, redirecting to dashboard");
  return redirect("/dashboard");
};

export const signInAction = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    return redirect("/dashboard");
  } catch (error) {
    console.error("Error in signInAction:", error);
    return redirect(
      `/sign-in?error=${encodeURIComponent("An unexpected error occurred during sign in")}`,
    );
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString();
    const supabase = await createClient();
    const callbackUrl = formData.get("callbackUrl")?.toString();

    if (!email) {
      return redirect(
        `/forgot-password?error=${encodeURIComponent("Email is required")}`,
      );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {});

    if (error) {
      return redirect(
        `/forgot-password?error=${encodeURIComponent("Could not reset password")}`,
      );
    }

    if (callbackUrl) {
      return redirect(callbackUrl);
    }

    return redirect(
      `/forgot-password?success=${encodeURIComponent("Check your email for a link to reset your password.")}`,
    );
  } catch (error) {
    console.error("Error in forgotPasswordAction:", error);
    return redirect(
      `/forgot-password?error=${encodeURIComponent("An unexpected error occurred")}`,
    );
  }
};

export const resetPasswordAction = async (formData: FormData) => {
  try {
    const supabase = await createClient();

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
      return redirect(
        `/protected/reset-password?error=${encodeURIComponent("Password and confirm password are required")}`,
      );
    }

    if (password !== confirmPassword) {
      return redirect(
        `/dashboard/reset-password?error=${encodeURIComponent("Passwords do not match")}`,
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return redirect(
        `/dashboard/reset-password?error=${encodeURIComponent("Password update failed")}`,
      );
    }

    return redirect(
      `/protected/reset-password?success=${encodeURIComponent("Password updated")}`,
    );
  } catch (error) {
    console.error("Error in resetPasswordAction:", error);
    return redirect(
      `/dashboard/reset-password?error=${encodeURIComponent("An unexpected error occurred")}`,
    );
  }
};

export const signOutAction = async () => {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/sign-in");
  } catch (error) {
    console.error("Error in signOutAction:", error);
    return redirect("/sign-in");
  }
};

export const checkUserSubscription = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error) {
      return false;
    }

    return !!subscription;
  } catch (error) {
    console.error("Error in checkUserSubscription:", error);
    return false;
  }
};

export const getUserEmployeeLimit = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error || !subscription) {
      // Free plan: 1 employee
      return 1;
    }

    // Check subscription amount to determine plan
    if (subscription.amount === 3000) {
      // Business plan: 10 employees
      return 10;
    } else if (subscription.amount >= 10000) {
      // Enterprise plan: 50 employees
      return 50;
    }

    // Default to free plan limit
    return 1;
  } catch (error) {
    console.error("Error in getUserEmployeeLimit:", error);
    return 1;
  }
};

type CompanyInfoInput = {
  userId: string;
  companyName: string;
  website: string;
  email?: string;
  googleReviewsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
};

export const updateCompanyInfo = async (input: CompanyInfoInput) => {
  try {
    const supabase = await createClient();
    const {
      userId,
      companyName,
      website,
      email,
      googleReviewsUrl,
      facebookUrl,
      instagramUrl,
    } = input;

    // Check if company info already exists
    const { data: existingInfo } = await supabase
      .from("company_info")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingInfo) {
      // Update existing record
      const { error } = await supabase
        .from("company_info")
        .update({
          company_name: companyName,
          website,
          email,
          google_reviews_url: googleReviewsUrl,
          facebook_url: facebookUrl,
          instagram_url: instagramUrl,
        })
        .eq("id", existingInfo.id);

      if (error) {
        console.error("Failed to update company information:", error);
        return {
          success: false,
          error: "Failed to update company information",
        };
      }
    } else {
      // Create new record
      const { error } = await supabase.from("company_info").insert({
        user_id: userId,
        company_name: companyName,
        website,
        email,
        google_reviews_url: googleReviewsUrl,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
      });

      if (error) {
        console.error("Failed to create company information:", error);
        return {
          success: false,
          error: "Failed to create company information",
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateCompanyInfo:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

type EmployeeInput = {
  userId: string;
  name: string;
  position?: string;
};

export const addEmployee = async (input: EmployeeInput) => {
  try {
    const supabase = await createClient();
    const { userId, name, position } = input;

    // Check current employee count and limit
    const { data: currentEmployees } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", userId);

    const currentCount = currentEmployees?.length || 0;
    const employeeLimit = await getUserEmployeeLimit(userId);

    if (currentCount >= employeeLimit) {
      return {
        success: false,
        error: `You have reached your employee limit of ${employeeLimit}. Please upgrade your plan to add more employees.`,
      };
    }

    const uniqueLinkId = uuidv4();

    const { data, error } = await supabase
      .from("employees")
      .insert({
        user_id: userId,
        name,
        position,
        unique_link_id: uniqueLinkId,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error adding employee:", error);
      return {
        success: false,
        error: `Failed to add employee: ${error.message}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in addEmployee:", error);
    return {
      success: false,
      error: "An unexpected error occurred while adding employee",
    };
  }
};

export const deleteEmployee = async (employeeId: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (error) {
      console.error("Failed to delete employee:", error);
      return { success: false, error: "Failed to delete employee" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteEmployee:", error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting employee",
    };
  }
};
