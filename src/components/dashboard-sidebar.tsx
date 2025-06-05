"use client";

import { Building2, Users, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    {
      icon: Building2,
      href: "/dashboard",
      label: "Company Info",
    },
    {
      icon: Users,
      href: "/dashboard/employees",
      label: "Employees",
    },
    {
      icon: Link,
      href: "/dashboard/review-links",
      label: "Review Links",
    },
  ];

  const onNavigate = (url: string) => {
    router.push(url);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h2>
        <nav className="space-y-2">
          {routes.map((route) => (
            <div
              key={route.href}
              onClick={() => onNavigate(route.href)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors",
                "hover:bg-custom-blue/10 hover:text-custom-blue",
                pathname === route.href
                  ? "bg-custom-blue/10 text-custom-blue"
                  : "text-gray-600",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
