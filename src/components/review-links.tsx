"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link, Copy, CheckCircle, User, ExternalLink } from "lucide-react";
import { useToast } from "./ui/use-toast";

export type Employee = {
  id: string;
  name: string;
  position?: string;
  user_id: string;
  created_at: string;
  unique_link_id: string;
};

interface ReviewLinksProps {
  employees: Employee[];
}

export default function ReviewLinks({ employees }: ReviewLinksProps) {
  const { toast } = useToast();
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const copyToClipboard = (linkId: string) => {
    const baseUrl = window.location.origin;
    const fullLink = `${baseUrl}/review/${linkId}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
    toast({
      title: "Link copied",
      description: "Review link copied to clipboard",
    });
  };

  const openLink = (linkId: string) => {
    const baseUrl = window.location.origin;
    const fullLink = `${baseUrl}/review/${linkId}`;
    window.open(fullLink, "_blank");
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Employee Review Links</CardTitle>
        <CardDescription>
          Share these unique links with customers to collect reviews for
          specific employees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No review links available</p>
            <p className="text-sm">
              Add employees first to generate review links
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => {
              const reviewUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/review/${employee.unique_link_id}`;

              return (
                <div
                  key={employee.id}
                  className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        {employee.position && (
                          <div className="text-sm text-muted-foreground mb-2">
                            {employee.position}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono break-all">
                          {reviewUrl}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(employee.unique_link_id)}
                        className="flex items-center gap-1"
                      >
                        {copiedLinkId === employee.unique_link_id ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openLink(employee.unique_link_id)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden sm:inline">Open</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
