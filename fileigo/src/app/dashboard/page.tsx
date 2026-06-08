"use client";

import React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { VerifierDashboard } from "@/components/dashboard/VerifierDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <span className="font-semibold text-sm">Loading workspace dashboards...</span>
      </div>
    );
  }

  const role = userProfile?.role || "student";

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "verifier":
      return <VerifierDashboard />;
    case "student":
    default:
      return <StudentDashboard />;
  }
}
