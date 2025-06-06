"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PlusCircle, Trash2, Link, Copy, CheckCircle } from "lucide-react";
import { updateCompanyInfo, addEmployee, deleteEmployee } from "@/app/actions";
import { useToast } from "./ui/use-toast";

export type Employee = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  unique_link_id: string;
};

export type CompanyInfo = {
  id: string;
  user_id: string;
  company_name: string;
  website: string;
  created_at: string;
};

interface CompanyInfoFormProps {
  companyInfo: CompanyInfo | null;
  userId: string;
}

export function CompanyInfoForm({ companyInfo, userId }: CompanyInfoFormProps) {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState(
    companyInfo?.company_name || "",
  );
  const [website, setWebsite] = useState(companyInfo?.website || "");

  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompanyInfo({
        userId,
        companyName,
        website,
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          Update your company details that will appear on review links
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleCompanyInfoSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
            />
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
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

interface EmployeeFormProps {
  employees: Employee[];
  userId: string;
}

export function EmployeeForm({ employees, userId }: EmployeeFormProps) {
  const { toast } = useToast();
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [employeesList, setEmployeesList] = useState<Employee[]>(employees);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;

    try {
      const response = await addEmployee({
        userId,
        name: newEmployeeName,
      });

      if (response && typeof response === "object" && "success" in response) {
        if (response.success && response.data) {
          setEmployeesList([...employeesList, response.data]);
          setNewEmployeeName("");
          toast({
            title: "Success",
            description: "Employee added successfully",
          });
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to add employee",
            variant: "destructive",
          });
        }
      } else if (response && "id" in response) {
        // Handle case where response is directly an Employee object
        setEmployeesList([...employeesList, response as Employee]);
        setNewEmployeeName("");
        toast({
          title: "Success",
          description: "Employee added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId);
      setEmployeesList(employeesList.filter((emp) => emp.id !== employeeId));
      toast({
        title: "Success",
        description: "Employee removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove employee",
        variant: "destructive",
      });
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Employees</CardTitle>
        <CardDescription>
          Add employees and generate unique review links for each one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddEmployee} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              placeholder="Employee name"
            />
          </div>
          <Button type="submit" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-4">
          {employeesList.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No employees added yet
            </div>
          ) : (
            employeesList.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 border rounded-md bg-card"
              >
                <div className="font-medium">{employee.name}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => copyToClipboard(employee.unique_link_id)}
                  >
                    {copiedLinkId === employee.unique_link_id ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
