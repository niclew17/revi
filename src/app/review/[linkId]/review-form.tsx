"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Star, CheckCircle } from "lucide-react";
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
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setPlatforms([...platforms, platform]);
    } else {
      setPlatforms(platforms.filter((p) => p !== platform));
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
        reviewText: reviewText.trim(),
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

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>
          Share your experience with {employeeName} to help us improve our
          services
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

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <Select
              value={rating.toString()}
              onValueChange={(value) => setRating(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span>5 - Excellent</span>
                  </div>
                </SelectItem>
                <SelectItem value="4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <span>4 - Very Good</span>
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      {[4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                    <span>3 - Good</span>
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      {[3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                    <span>2 - Fair</span>
                  </div>
                </SelectItem>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {[2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                    <span>1 - Poor</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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
