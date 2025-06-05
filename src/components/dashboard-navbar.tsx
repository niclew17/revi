"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { UserCircle, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import DashboardSidebar from "./dashboard-sidebar";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle - Only show on dashboard pages */}
          {pathname.startsWith("/dashboard") && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <DashboardSidebar
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}

          <Link href="/" prefetch className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          {!pathname.startsWith("/dashboard") && (
            <div className="hidden md:flex items-center space-x-4 ml-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-custom-blue"
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!pathname.startsWith("/dashboard") && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
