"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Star, ArrowLeft, Loader2, Check, Copy } from "lucide-react";

import { useToast } from "../../../components/ui/use-toast";
import { createClient } from "../../../../supabase/client";

interface ReviewFormProps {
  employeeId: string;
  employeeName: string;
  companyName: string;
  businessDescription: string;
  dynamicAttributes?: string[];
  dynamicAdditionalAttributes?: string[];
  googleReviewLink?: string;
}

export default function ReviewForm({
  employeeId,
  employeeName,
  companyName,
  businessDescription,
  dynamicAttributes = [],
  dynamicAdditionalAttributes = [],
  googleReviewLink = "",
}: ReviewFormProps) {
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedAdditionalAttributes, setSelectedAdditionalAttributes] =
    useState<string[]>([]);
  const [generatedReview, setGeneratedReview] = useState("");
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);

  const [isLowRating, setIsLowRating] = useState(false);

  // Use dynamic attributes if available, otherwise fall back to default ones
  const defaultAttributes = [
    "Professional",
    "Timely",
    "Kind",
    "Precise",
    "Considerate",
  ];

  const defaultAdditionalAttributes = [
    "Cleanliness",
    "Efficiency",
    "Value for Money",
    "Reliability",
    "Friendliness",
  ];

  const attributes =
    dynamicAttributes.length > 0 ? dynamicAttributes : defaultAttributes;

  const additionalAttributes =
    dynamicAdditionalAttributes.length > 0
      ? dynamicAdditionalAttributes
      : defaultAdditionalAttributes;

  // Simulate initial loading to show loading indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500); // Show loading for 1.5 seconds

    return () => clearTimeout(timer);
  }, [
    employeeId,
    employeeName,
    companyName,
    businessDescription,
    dynamicAttributes,
    dynamicAdditionalAttributes,
    googleReviewLink,
  ]);

  const handleExperienceSelect = (experience: string) => {
    setExperienceLevel(experience);
    if (experience === "poor") {
      setIsLowRating(true);
      setRating(2); // Set a low rating for database purposes
      setCurrentStep(4); // Skip to review writing step
    } else {
      setIsLowRating(false);
      // Set rating based on experience level for database purposes
      setRating(experience === "moderate" ? 4 : 5);
      setCurrentStep(2); // Continue with attribute selection
    }
  };

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes((prev) => {
      if (prev.includes(attribute)) {
        return prev.filter((a) => a !== attribute);
      } else {
        return [...prev, attribute];
      }
    });
  };

  const handleAdditionalAttributeToggle = (attribute: string) => {
    setSelectedAdditionalAttributes((prev) => {
      if (prev.includes(attribute)) {
        return prev.filter((a) => a !== attribute);
      } else {
        return [...prev, attribute];
      }
    });
  };

  const handleNextToAdditionalAttributes = () => {
    if (selectedAttributes.length > 0) {
      setCurrentStep(3);
    } else {
      toast({
        title: "Please select at least one attribute",
        description: "Choose what made your experience great.",
        variant: "destructive",
      });
    }
  };

  const handleNextToReviewGeneration = () => {
    if (selectedAdditionalAttributes.length > 0) {
      setCurrentStep(4);
      if (!isLowRating) {
        generateReview();
      }
    } else {
      toast({
        title: "Please select at least one additional attribute",
        description:
          "Choose additional qualities that describe your experience.",
        variant: "destructive",
      });
    }
  };

  const generateReview = async () => {
    setIsGeneratingReview(true);
    try {
      const supabase = createClient();
      const allQualities = [
        ...selectedAttributes,
        ...selectedAdditionalAttributes,
      ];

      const payloadToSend = {
        selectedQualities: allQualities,
        businessName: companyName,
        businessDescription: businessDescription || "",
      };

      // Validate that we have the required data
      if (!allQualities.length) {
        throw new Error("No qualities selected for review generation");
      }

      if (!companyName) {
        throw new Error("Company name is missing");
      }

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-generate-review",
        {
          body: payloadToSend,
        },
      );

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Unknown edge function error");
      }

      if (data?.review) {
        setGeneratedReview(data.review);
        setReviewText(data.review);
      } else {
        console.error("No review in response data:", data);
        throw new Error("No review generated - empty response");
      }
    } catch (error) {
      console.error("Error generating review:", error);

      // More specific error handling
      let errorMessage = "Failed to generate review. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Allow user to continue with manual review
      setReviewText("");
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // If user is on review writing step (step 4) and has a poor experience,
      // go directly back to experience selection (step 1)
      if (currentStep === 4 && isLowRating) {
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = async (silent = false) => {
    if (!reviewText.trim()) {
      if (!silent) {
        toast({
          title: "Error",
          description: "No review text to copy.",
          variant: "destructive",
        });
      }
      return false;
    }

    setIsCopying(true);
    setCopySuccess(false);

    // ROBUST CLIPBOARD COPY - Multiple fallback methods with iOS Safari optimization
    const textToCopy = reviewText.trim();
    let clipboardSuccess = false;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Method 1: Modern Clipboard API (most reliable when available)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        clipboardSuccess = true;
        console.log("✅ Clipboard API successful");
      } catch (error) {
        console.warn("❌ Clipboard API failed:", error);
      }
    }

    // Method 2: execCommand fallback (if Method 1 failed)
    if (!clipboardSuccess) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;

        // Critical: Make it invisible but focusable
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        textArea.style.opacity = "0";
        textArea.style.zIndex = "-1";

        // Add to DOM
        document.body.appendChild(textArea);

        // Focus and select - works on both mobile and desktop
        textArea.focus();
        textArea.select();

        // For mobile devices, ensure full selection
        if (isMobile) {
          textArea.setSelectionRange(0, textArea.value.length);
          // Add a small delay for mobile devices
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Attempt copy
        clipboardSuccess = document.execCommand("copy");

        // Clean up
        document.body.removeChild(textArea);

        if (clipboardSuccess) {
          console.log("✅ execCommand successful");
        } else {
          console.warn("❌ execCommand failed");
        }
      } catch (error) {
        console.warn("❌ execCommand method failed:", error);
      }
    }

    // Method 3: iOS Safari specific fix (if still failed)
    if (!clipboardSuccess && isIOS) {
      try {
        const range = document.createRange();
        const selection = window.getSelection();
        const mark = document.createElement("span");

        mark.textContent = textToCopy;
        // Make it visible for iOS Safari but positioned offscreen
        mark.style.position = "absolute";
        mark.style.left = "-9999px";
        mark.style.top = "0px";
        mark.style.whiteSpace = "pre";

        document.body.appendChild(mark);
        range.selectNodeContents(mark);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }

        // Add a small delay for iOS
        await new Promise((resolve) => setTimeout(resolve, 100));

        clipboardSuccess = document.execCommand("copy");
        document.body.removeChild(mark);

        if (clipboardSuccess) {
          console.log("✅ iOS Safari method successful");
        }
      } catch (error) {
        console.warn("❌ iOS Safari method failed:", error);
      }
    }

    setIsCopying(false);
    setCopySuccess(clipboardSuccess);

    // Show appropriate message if not in silent mode
    if (!silent) {
      const successMessage = clipboardSuccess
        ? "Review copied to clipboard!"
        : "Failed to copy automatically. Please copy the text manually.";

      toast({
        title: clipboardSuccess ? "Success!" : "Copy Failed",
        description: successMessage,
        variant: clipboardSuccess ? "default" : "destructive",
        duration: 3000,
      });
    }

    // Reset success state after 2 seconds
    if (clipboardSuccess) {
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }

    return clipboardSuccess;
  };

  const handleGoToGoogleReviews = async () => {
    if (googleReviewLink && googleReviewLink.trim()) {
      try {
        // First try to copy the review to clipboard
        const copySuccess = await handleCopyToClipboard(true); // Silent mode

        if (copySuccess) {
          toast({
            title: "Review copied!",
            description:
              "Your review has been copied to clipboard. Redirecting to Google Reviews...",
            duration: 2000,
          });

          // Add a small delay to ensure the toast is shown before redirect
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Use different methods based on device type for better compatibility
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
          // Mobile: Use location.href for better app integration
          window.location.href = googleReviewLink;
        } else {
          // Desktop: Use window.open for new tab
          const newWindow = window.open(googleReviewLink, "_blank");
          if (!newWindow) {
            // Popup blocked, fallback to location
            window.location.href = googleReviewLink;
          }
        }
      } catch (error) {
        console.error("Redirect failed:", error);
        toast({
          title: "Redirect failed",
          description:
            "Please manually visit Google Reviews to post your review.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } else {
      toast({
        title: "No Google Review link",
        description: "Please contact the business for the Google Review link.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Show loading indicator when form is initially loading
  if (isInitialLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                Loading Review Form
              </h2>
              <p className="text-muted-foreground">
                Preparing your review experience for {companyName}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Experience Selection
  if (currentStep === 1) {
    return (
      <Card className="bg-white">
        <CardHeader className="text-center">
          <CardTitle>Rate Your Experience</CardTitle>
          <CardDescription>
            How would you rate your experience with {companyName}?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-8">
            {[
              {
                value: "poor",
                label: "Poor",
                color:
                  "bg-red-50 border-red-300 hover:border-red-400 text-red-900 hover:bg-red-100",
              },
              {
                value: "moderate",
                label: "Moderate",
                color:
                  "bg-amber-50 border-amber-300 hover:border-amber-400 text-amber-900 hover:bg-amber-100",
              },
              {
                value: "excellent",
                label: "Excellent",
                color:
                  "bg-emerald-50 border-emerald-300 hover:border-emerald-400 text-emerald-900 hover:bg-emerald-100",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleExperienceSelect(option.value)}
                className={`w-full p-4 border-2 rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  experienceLevel === option.value
                    ? `${option.color} border-opacity-100`
                    : `${option.color} border-opacity-50`
                }`}
              >
                <span className="text-lg font-semibold">{option.label}</span>
              </button>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Select how you would rate your experience
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Attribute Selection
  if (currentStep === 2) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle>What made your experience great?</CardTitle>
          <CardDescription>
            Select the attributes that best describe your experience with{" "}
            {companyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {attributes.map((attribute) => (
              <div
                key={attribute}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAttributes.includes(attribute)
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleAttributeToggle(attribute)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedAttributes.includes(attribute)}
                    onChange={() => handleAttributeToggle(attribute)}
                  />
                  <Label className="text-base font-medium cursor-pointer">
                    {attribute}
                  </Label>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button
              onClick={handleNextToAdditionalAttributes}
              className="w-full"
              disabled={selectedAttributes.length === 0}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Additional Attribute Selection
  if (currentStep === 3) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              {selectedAttributes.join(", ")}
            </span>
          </div>
          <CardTitle>Additional qualities</CardTitle>
          <CardDescription>
            Select additional attributes that describe your experience with{" "}
            {companyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {additionalAttributes.map((attribute) => (
              <div
                key={attribute}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAdditionalAttributes.includes(attribute)
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleAdditionalAttributeToggle(attribute)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedAdditionalAttributes.includes(attribute)}
                    onChange={() => handleAdditionalAttributeToggle(attribute)}
                  />
                  <Label className="text-base font-medium cursor-pointer">
                    {attribute}
                  </Label>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button
              onClick={handleNextToReviewGeneration}
              className="w-full"
              disabled={selectedAdditionalAttributes.length === 0}
            >
              Generate Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 4: Review Generation and Final Details
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            {[...selectedAttributes, ...selectedAdditionalAttributes].join(
              ", ",
            )}
          </span>
        </div>
        <CardTitle>Your Review</CardTitle>
        <CardDescription>
          {isLowRating
            ? "Please write your review below and we'll help you post it to Google Reviews."
            : isGeneratingReview
              ? "We're generating your review based on the selected qualities..."
              : "Review the generated text below and make any changes you'd like, then submit to copy it to your clipboard."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGeneratingReview && !isLowRating ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Generating your review...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Review Text - Editable */}
            <div className="space-y-2">
              <Label htmlFor="reviewText">
                {isLowRating ? "Write Your Review" : "Your Generated Review"}
              </Label>
              <Textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={6}
                placeholder={
                  isLowRating
                    ? "Please share your experience..."
                    : "Your review will appear here..."
                }
              />
              {generatedReview && !isLowRating && (
                <p className="text-xs text-muted-foreground">
                  This review was generated based on your selected qualities.
                  You can edit it before submitting.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => handleCopyToClipboard(false)}
                  className={`w-full transition-all duration-200 ${
                    copySuccess
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  }`}
                  disabled={!reviewText.trim() || isCopying}
                >
                  {isCopying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Copying...
                    </>
                  ) : copySuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Review to Clipboard
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGoToGoogleReviews}
                  variant="secondary"
                  className="w-full"
                  disabled={!googleReviewLink}
                >
                  Go to Google Reviews
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>How to post your review:</strong>
                  <br />
                  1. Copy the review text to your clipboard using the button
                  above
                  <br />
                  2. Click "Go to Google Reviews" to open Google Reviews
                  <br />
                  3. Paste your review on the Google Reviews page
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
