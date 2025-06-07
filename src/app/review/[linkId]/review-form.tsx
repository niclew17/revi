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
import { Star, CheckCircle, ArrowLeft } from "lucide-react";
import { submitReview } from "../../actions";
import { useToast } from "../../../components/ui/use-toast";

interface ReviewFormProps {
  employeeId: string;
  employeeName: string;
  companyName: string;
}

export default function ReviewForm({
  employeeId,
  employeeName,
  companyName,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const attributes = [
    "Professional",
    "Timely",
    "Kind",
    "Precise",
    "Considerate",
  ];

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setPlatforms([...platforms, platform]);
    } else {
      setPlatforms(platforms.filter((p) => p !== platform));
    }
  };

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
    setCurrentStep(2);
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

  const handleNextToFinalStep = () => {
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

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      toast({
        title: "Error",
        description: "Please write a review before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReview({
        employeeId,
        customerName: customerName.trim() || undefined,
        reviewText: `${reviewText.trim()}\n\nAttributes: ${selectedAttributes.join(", ")}`,
        rating,
        platforms,
      });

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Thank you!",
          description: "Your review has been submitted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description:
            result.error || "Failed to submit review. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
              Your review for {employeeName} at {companyName} has been submitted
              successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              We appreciate your feedback and will use it to improve our
              services.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Rating Selection
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
          <div className="flex justify-center space-x-2 py-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingSelect(star)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Click a star to rate your experience
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
              onClick={handleNextToFinalStep}
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

  // Step 3: Review Details
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
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Tell us more about your experience with {employeeName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Your Name (Optional)</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="reviewText">Your Review *</Label>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience with our service..."
              rows={4}
              required
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label>Where would you like to share this review? (Optional)</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="google"
                  checked={platforms.includes("google")}
                  onCheckedChange={(checked) =>
                    handlePlatformChange("google", checked as boolean)
                  }
                />
                <Label htmlFor="google" className="text-sm font-normal">
                  Google Reviews
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="facebook"
                  checked={platforms.includes("facebook")}
                  onCheckedChange={(checked) =>
                    handlePlatformChange("facebook", checked as boolean)
                  }
                />
                <Label htmlFor="facebook" className="text-sm font-normal">
                  Facebook
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instagram"
                  checked={platforms.includes("instagram")}
                  onCheckedChange={(checked) =>
                    handlePlatformChange("instagram", checked as boolean)
                  }
                />
                <Label htmlFor="instagram" className="text-sm font-normal">
                  Instagram
                </Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Select the platforms where you'd like to share your review. We'll
              help you post it there.
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
