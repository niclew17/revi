"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { v4 as uuidv4 } from "uuid";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        user_id: user.id,
        name: fullName,
        email: email,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        // Error handling without console.error
        return encodedRedirect(
          "error",
          "/sign-up",
          "Error updating user. Please try again.",
        );
      }
    } catch (err) {
      // Error handling without console.error
      return encodedRedirect(
        "error",
        "/sign-up",
        "Error updating user. Please try again.",
      );
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
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
};

export const getUserEmployeeLimit = async (userId: string) => {
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

    if (error) throw new Error("Failed to update company information");
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

    if (error) throw new Error("Failed to create company information");
  }

  return { success: true };
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
      throw new Error(
        `You have reached your employee limit of ${employeeLimit}. Please upgrade your plan to add more employees.`,
      );
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
      throw new Error(`Failed to add employee: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in addEmployee:", error);
    throw error;
  }
};

export const deleteEmployee = async (employeeId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", employeeId);

  if (error) throw new Error("Failed to delete employee");

  return { success: true };
};
