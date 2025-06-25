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
import {
  Link,
  Copy,
  CheckCircle,
  User,
  ExternalLink,
  QrCode,
  Download,
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

export type Employee = {
  id: string;
  name: string;
  position?: string;
  user_id: string;
  created_at: string;
  unique_link_id: string;
  review_count?: number;
};

interface ReviewLinksProps {
  employees: Employee[];
}

export default function ReviewLinks({ employees }: ReviewLinksProps) {
  const { toast } = useToast();
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  const toggleQRCode = (linkId: string) => {
    setShowQRCode(showQRCode === linkId ? null : linkId);
  };

  const downloadQRCode = async (employee: Employee, reviewUrl: string) => {
    // Create a canvas to generate QR code
    const canvas = document.createElement("canvas");
    const QRCode = await import("qrcode");

    QRCode.default.toCanvas(
      canvas,
      reviewUrl,
      {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (error: any) => {
        if (error) {
          console.error("Error generating QR code:", error);
          return;
        }

        // Convert canvas to image data
        const imgData = canvas.toDataURL("image/png");

        // Create PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        // Page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Title
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        const title = "Review Link QR Code";
        const titleWidth = pdf.getTextWidth(title);
        pdf.text(title, (pageWidth - titleWidth) / 2, 40);

        // Employee info
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        const employeeName = employee.name;
        const nameWidth = pdf.getTextWidth(employeeName);
        pdf.text(employeeName, (pageWidth - nameWidth) / 2, 60);

        if (employee.position) {
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "normal");
          const positionWidth = pdf.getTextWidth(employee.position);
          pdf.text(employee.position, (pageWidth - positionWidth) / 2, 75);
        }

        // QR Code - centered on page
        const qrSize = 80; // 80mm
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = employee.position ? 90 : 80;
        pdf.addImage(imgData, "PNG", qrX, qrY, qrSize, qrSize);

        // Instructions
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const instructions = `Scan this QR code with your phone's camera to leave a review for ${employee.name}.`;
        const maxWidth = 150;
        const instructionsY = qrY + qrSize + 20;

        // Split text to fit within page width
        const splitInstructions = pdf.splitTextToSize(instructions, maxWidth);
        const instructionsHeight = splitInstructions.length * 5;
        const instructionsX = (pageWidth - maxWidth) / 2;

        pdf.text(splitInstructions, instructionsX, instructionsY);

        // Download the PDF
        const fileName = `qr-code-${employee.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;
        pdf.save(fileName);

        toast({
          title: "QR Code Downloaded",
          description: "QR code PDF has been downloaded successfully",
        });
      },
    );
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
              const reviewUrl = `${window.location.origin}/review/${employee.unique_link_id}`;

              return (
                <div
                  key={employee.id}
                  className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-custom-blue/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-custom-blue" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        {employee.position && (
                          <div className="text-sm text-muted-foreground">
                            {employee.position}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mb-2">
                          {employee.review_count || 0} reviews completed
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono break-all">
                          {reviewUrl}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(reviewUrl);
                          setCopiedLinkId(employee.unique_link_id);
                          setTimeout(() => setCopiedLinkId(null), 2000);
                          toast({
                            title: "Link copied",
                            description: "Review link copied to clipboard",
                          });
                        }}
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
                        onClick={() => toggleQRCode(employee.unique_link_id)}
                        className="flex items-center gap-1"
                      >
                        <QrCode className="h-4 w-4" />
                        <span className="hidden sm:inline">QR</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(reviewUrl, "_blank")}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden sm:inline">Open</span>
                      </Button>
                    </div>
                  </div>
                  {showQRCode === employee.unique_link_id && (
                    <div className="mt-4 pt-4 border-t flex flex-col items-center gap-3">
                      <div className="bg-white p-4 rounded-lg border">
                        <QRCodeSVG
                          value={reviewUrl}
                          size={200}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-muted-foreground text-center">
                          Scan this QR code to access the review link
                        </p>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => downloadQRCode(employee, reviewUrl)}
                          className="flex items-center gap-1 bg-custom-blue hover:bg-custom-blue/90"
                        >
                          <Download className="h-4 w-4" />
                          Download QR Code
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
