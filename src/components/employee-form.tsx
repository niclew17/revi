"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  PlusCircle,
  Trash2,
  User,
  InfoIcon,
  AlertTriangle,
} from "lucide-react";
import { addEmployee, deleteEmployee } from "@/app/actions";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type Employee = {
  id: string;
  name: string;
  position?: string;
  user_id: string;
  created_at: string;
  unique_link_id: string;
  review_count?: number;
};

export type CompanyInfo = {
  id: string;
  user_id: string;
  company_name: string;
  website: string | null;
  email: string | null;
  business_description: string | null;
  google_reviews_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  created_at: string | null;
};

interface EmployeeFormProps {
  employees: Employee[];
  userId: string;
  employeeLimit: number;
  isSubscribed: boolean;
  companyInfo: CompanyInfo | null;
}

export default function EmployeeForm({
  employees,
  userId,
  employeeLimit,
  isSubscribed,
  companyInfo,
}: EmployeeFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeePosition, setNewEmployeePosition] = useState("");
  const [employeesList, setEmployeesList] = useState<Employee[]>(employees);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when props change (e.g., after page refresh)
  useEffect(() => {
    setEmployeesList(employees);
  }, [employees]);

  const isAtLimit = employeesList.length >= employeeLimit;
  const planName = !isSubscribed
    ? "Free"
    : employeeLimit === 10
      ? "Business"
      : "Enterprise";

  // Check if company information is complete
  const isCompanyInfoComplete =
    companyInfo && companyInfo.company_name && companyInfo.business_description;

  const canCreateEmployees = isCompanyInfoComplete && !isAtLimit;

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;

    setIsLoading(true);
    try {
      const result = await addEmployee({
        userId,
        name: newEmployeeName,
        position: newEmployeePosition || undefined,
      });

      if (result.success && result.data) {
        setEmployeesList([...employeesList, result.data]);
        setNewEmployeeName("");
        setNewEmployeePosition("");
        toast({
          title: "Success",
          description: "Employee added successfully",
        });
        // Refresh the page data to ensure consistency
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add employee",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const result = await deleteEmployee(employeeId);

      if (result.success) {
        // Update local state immediately
        setEmployeesList(employeesList.filter((emp) => emp.id !== employeeId));
        toast({
          title: "Success",
          description: "Employee removed successfully",
        });
        // Refresh the page data to ensure consistency
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove employee",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to remove employee",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Manage Employees</CardTitle>
        <CardDescription>
          Add employees and their positions to generate unique review links for
          each one. Your {planName} plan allows up to {employeeLimit} employee
          {employeeLimit === 1 ? "" : "s"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Info Warning */}
        {!isCompanyInfoComplete && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle size="18" />
            <div>
              <p className="font-medium">Company Information Required</p>
              <p className="text-sm">
                Please complete your company information (business name and
                description) before creating employees. This information is
                needed for AI review generation.{" "}
                <Link href="/dashboard" className="underline font-medium">
                  Complete company info
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Add Employee Form */}
        {isAtLimit && isCompanyInfoComplete && (
          <div className="bg-orange-100 border border-orange-300 text-orange-800 p-4 rounded-lg flex items-center gap-3">
            <InfoIcon size="18" />
            <div>
              <p className="font-medium">Employee Limit Reached</p>
              <p className="text-sm">
                You've reached your {planName} plan limit of {employeeLimit}{" "}
                employee{employeeLimit === 1 ? "" : "s"}.
                {!isSubscribed && (
                  <>
                    {" "}
                    <a href="/pricing" className="underline">
                      Upgrade your plan
                    </a>{" "}
                    to add more employees.
                  </>
                )}
                {isSubscribed && employeeLimit < 50 && (
                  <>
                    {" "}
                    <a href="/pricing" className="underline">
                      Upgrade to Enterprise
                    </a>{" "}
                    to add more employees.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleAddEmployee}
          className={`space-y-4 p-4 border rounded-lg ${!canCreateEmployees ? "bg-muted/30 opacity-60" : "bg-muted/50"}`}
        >
          <h3 className="font-medium">Add New Employee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name *</Label>
              <Input
                id="employeeName"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={!canCreateEmployees}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeePosition">Position</Label>
              <Input
                id="employeePosition"
                value={newEmployeePosition}
                onChange={(e) => setNewEmployeePosition(e.target.value)}
                placeholder="Service Technician"
                disabled={!canCreateEmployees}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !canCreateEmployees}
            className="w-full md:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isLoading
              ? "Adding..."
              : !isCompanyInfoComplete
                ? "Complete Company Info First"
                : isAtLimit
                  ? `Limit Reached (${employeeLimit})`
                  : "Add Employee"}
          </Button>
        </form>

        {/* Employees List */}
        <div className="space-y-4">
          <h3 className="font-medium">
            Current Employees ({employeesList.length}/{employeeLimit})
          </h3>
          {employeesList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No employees added yet</p>
              <p className="text-sm">
                Add your first employee above to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {employeesList.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-custom-blue/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-custom-blue" />
                    </div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      {employee.position && (
                        <div className="text-sm text-muted-foreground">
                          {employee.position}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {employee.review_count || 0} reviews completed
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
