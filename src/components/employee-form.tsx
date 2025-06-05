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
import { PlusCircle, Trash2, User } from "lucide-react";
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
}

export default function EmployeeForm({ employees, userId }: EmployeeFormProps) {
  const { toast } = useToast();
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeePosition, setNewEmployeePosition] = useState("");
  const [employeesList, setEmployeesList] = useState<Employee[]>(employees);
  const [isLoading, setIsLoading] = useState(false);

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
          each one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Employee Form */}
        <form
          onSubmit={handleAddEmployee}
          className="space-y-4 p-4 border rounded-lg bg-muted/50"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeePosition">Position</Label>
              <Input
                id="employeePosition"
                value={newEmployeePosition}
                onChange={(e) => setNewEmployeePosition(e.target.value)}
                placeholder="Service Technician"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isLoading ? "Adding..." : "Add Employee"}
          </Button>
        </form>

        {/* Employees List */}
        <div className="space-y-4">
          <h3 className="font-medium">
            Current Employees ({employeesList.length})
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
