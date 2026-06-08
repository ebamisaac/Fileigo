"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  User,
  Settings,
  LogOut,
  Users,
  ShieldCheck,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export function Sidebar({ className, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();

  const role = userProfile?.role || "student";

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Resolve navigation items dynamically based on the role
  const getNavItems = () => {
    switch (role) {
      case "admin":
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "User Management", href: "/dashboard/admin/users", icon: Users },
          { name: "Audit Logs", href: "/dashboard/admin/logs", icon: ShieldCheck },
          { name: "Create Verifier", href: "/dashboard/admin/create-verifier", icon: Users },
        ];
      case "verifier":
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ];
      case "student":
      default:
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Documents", href: "/dashboard/documents", icon: FolderOpen },
          { name: "Upload", href: "/dashboard/upload", icon: UploadCloud },
          { name: "Submissions", href: "/dashboard/submissions", icon: FileCheck },
        ];
    }
  };

  const navItems = getNavItems();

  const secondaryNavItems = [
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className={cn(
      "w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 h-full",
      className
    )}>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center mb-8">
          <Image src="/logos/combination-mark.png" alt="Fileigo Logo" width={140} height={40} className="object-contain h-8 w-auto" />
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-6 border-t border-border">
        <nav className="space-y-1 mb-4">
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
