"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { updateCompanyInfo } from "@/app/actions";
import { useToast } from "./ui/use-toast";

export type CompanyInfo = {
  id: string;
  user_id: string;
  company_name: string;
  website: string;
  email?: string;
  business_description?: string;
  google_reviews_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  created_at: string;
};

interface CompanyFormProps {
  companyInfo: CompanyInfo | null;
  userId: string;
}

export default function CompanyForm({ companyInfo, userId }: CompanyFormProps) {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState(
    companyInfo?.company_name || "",
  );
  const [website, setWebsite] = useState(companyInfo?.website || "");
  const [email, setEmail] = useState(companyInfo?.email || "");
  const [businessDescription, setBusinessDescription] = useState(
    companyInfo?.business_description || "",
  );
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState(
    companyInfo?.google_reviews_url || "",
  );
  const [facebookUrl, setFacebookUrl] = useState(
    companyInfo?.facebook_url || "",
  );
  const [instagramUrl, setInstagramUrl] = useState(
    companyInfo?.instagram_url || "",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateCompanyInfo({
        userId,
        companyName,
        website,
        email,
        businessDescription,
        googleReviewsUrl,
        facebookUrl,
        instagramUrl,
      });
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          Update your company details that will appear on review links and help
          customers identify your business
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Company Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@yourcompany.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Tell customers about your business and what services you provide..."
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media & Review Links</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="googleReviews">Google Reviews Page</Label>
                <Input
                  id="googleReviews"
                  value={googleReviewsUrl}
                  onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                  placeholder="https://g.page/your-business/review"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook Page</Label>
                <Input
                  id="facebook"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourcompany"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Page</Label>
                <Input
                  id="instagram"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/yourcompany"
                  type="url"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
