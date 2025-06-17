"use client";

import { useState } from "react";
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
import { Star, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { submitReview } from "../../actions";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedAdditionalAttributes, setSelectedAdditionalAttributes] =
    useState<string[]>([]);
  const [generatedReview, setGeneratedReview] = useState("");
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

      // Log the data being sent to verify it's correct
      console.log("Sending to edge function:", {
        selectedQualities: allQualities,
        businessName: companyName,
        businessDescription: businessDescription,
      });

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-generate-review",
        {
          body: {
            selectedQualities: allQualities,
            businessName: companyName,
            businessDescription: businessDescription,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data?.review) {
        setGeneratedReview(data.review);
        setReviewText(data.review);
      } else {
        throw new Error("No review generated");
      }
    } catch (error) {
      console.error("Error generating review:", error);
      toast({
        title: "Error",
        description: "Failed to generate review. Please try again.",
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

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      toast({
        title: "Error",
        description: "No review was generated. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Copy the review text to clipboard
      await navigator.clipboard.writeText(reviewText.trim());

      // Save the review to database for tracking
      const allAttributes = [
        ...selectedAttributes,
        ...selectedAdditionalAttributes,
      ];
      const reviewTextToSave = isLowRating
        ? reviewText.trim()
        : `${reviewText.trim()}\n\nAttributes: ${allAttributes.join(", ")}`;

      const result = await submitReview({
        employeeId,
        reviewText: reviewTextToSave,
        rating,
        platforms: ["google"], // Always Google since we're redirecting there
      });

      if (result.success) {
        toast({
          title: "Review copied!",
          description:
            "Your review has been copied to clipboard. You'll be redirected to Google Reviews.",
        });

        // Set submitted state and show success message
        setIsSubmitted(true);
      } else {
        toast({
          title: "Error",
          description:
            result.error || "Failed to submit review. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Review ready!",
        description:
          "Your review is ready. You'll be redirected to Google Reviews.",
      });

      // Set submitted state even if clipboard fails
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your review for {employeeName} at {companyName} has been copied to
              your clipboard.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to open Google Reviews and paste your
              review.
            </p>
            {googleReviewLink ? (
              <Button
                onClick={() => window.open(googleReviewLink, "_blank")}
                className="mt-4"
              >
                Open Google Reviews
              </Button>
            ) : (
              <p className="text-sm text-red-600">
                No Google Review link available. Please contact the business.
              </p>
            )}
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
            How would you rate your experience with {employeeName}?
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
            Select the attributes that best describe {employeeName}
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
            Select additional attributes that describe {employeeName}
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

            {/* Submit Button */}
            <div className="space-y-4">
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={!reviewText.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Copying Review...
                  </>
                ) : (
                  "Copy Review & Go to Google Reviews"
                )}
              </Button>

              {/* Info about what happens next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong> Your review will be copied
                  to your clipboard and Google Reviews will open in a new tab
                  where you can paste and post it.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
