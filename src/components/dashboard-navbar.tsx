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
import { UserCircle, Home, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden md:flex items-center space-x-4 ml-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium ${pathname === "/dashboard" ? "text-custom-blue" : "text-muted-foreground hover:text-custom-blue"}`}
            >
              Dashboard
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
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
