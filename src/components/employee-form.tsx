"use client";

import { useState } from "react";
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
import { PlusCircle, Trash2, User, InfoIcon } from "lucide-react";
import { addEmployee, deleteEmployee } from "@/app/actions";
import { useToast } from "./ui/use-toast";

export type Employee = {
  id: string;
  name: string;
  position?: string;
  user_id: string;
  created_at: string;
  unique_link_id: string;
};

interface EmployeeFormProps {
  employees: Employee[];
  userId: string;
  employeeLimit: number;
  isSubscribed: boolean;
}

export default function EmployeeForm({
  employees,
  userId,
  employeeLimit,
  isSubscribed,
}: EmployeeFormProps) {
  const { toast } = useToast();
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeePosition, setNewEmployeePosition] = useState("");
  const [employeesList, setEmployeesList] = useState<Employee[]>(employees);
  const [isLoading, setIsLoading] = useState(false);

  const isAtLimit = employeesList.length >= employeeLimit;
  const planName = !isSubscribed
    ? "Free"
    : employeeLimit === 10
      ? "Business"
      : "Enterprise";

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim()) return;

    setIsLoading(true);
    try {
      const newEmployee = await addEmployee({
        userId,
        name: newEmployeeName,
        position: newEmployeePosition || undefined,
      });

      if (newEmployee) {
        setEmployeesList([...employeesList, newEmployee]);
        setNewEmployeeName("");
        setNewEmployeePosition("");
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
    } finally {
      setIsLoading(false);
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
        {/* Add Employee Form */}
        {isAtLimit && (
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
          className={`space-y-4 p-4 border rounded-lg ${isAtLimit ? "bg-muted/30 opacity-60" : "bg-muted/50"}`}
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
                disabled={isAtLimit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeePosition">Position</Label>
              <Input
                id="employeePosition"
                value={newEmployeePosition}
                onChange={(e) => setNewEmployeePosition(e.target.value)}
                placeholder="Service Technician"
                disabled={isAtLimit}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || isAtLimit}
            className="w-full md:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isLoading
              ? "Adding..."
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
