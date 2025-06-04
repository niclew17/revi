"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  CompanyInfoForm,
  EmployeeForm,
  CompanyInfo,
  Employee,
} from "./settings-form";

interface SettingsTabsProps {
  companyInfo: CompanyInfo | null;
  employees: Employee[];
  userId: string;
}

export default function SettingsTabs({
  companyInfo,
  employees,
  userId,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="grid w-full md:w-[400px] grid-cols-2">
        <TabsTrigger value="company">Company Info</TabsTrigger>
        <TabsTrigger value="employees">Employees</TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="mt-6">
        <CompanyInfoForm companyInfo={companyInfo} userId={userId} />
      </TabsContent>

      <TabsContent value="employees" className="mt-6">
        <EmployeeForm employees={employees} userId={userId} />
      </TabsContent>
    </Tabs>
  );
}
