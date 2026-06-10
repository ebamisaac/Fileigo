"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Users, 
  ShieldAlert, 
  FileText, 
  Activity, 
  Settings,
  ClipboardList,
  UserCheck,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { getAuditLogs, getSubmissions, getUsers } from "@/services/documents";

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [userData, subData, logData] = await Promise.all([
          getUsers(),
          getSubmissions("admin"),
          getAuditLogs(),
        ]);
        setUsers(userData);
        setSubmissions(subData);
        setLogs(logData);
      } catch (error) {
        console.error("Error loading admin dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();

    // Re-fetch whenever the user returns to this tab (e.g. after changing a role
    // on the Users page and navigating back) so counts stay fresh.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAdminData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);


  // Compute platform metrics
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalVerifiers = users.filter((u) => u.role === "verifier").length;
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter((s) => s.status === "pending").length;

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="grid gap-6 md:gap-8">
      {/* Dynamic welcome header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-heading">
          Institutional Administration
        </h1>
        <p className="text-muted-foreground">
          Platform control center. Monitor system activities, manage role authorizations, and audit compliance logs.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalUsers}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Total Users</CardDescription>
            </div>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-secondary">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalVerifiers}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Active Verifiers</CardDescription>
            </div>
            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalSubmissions}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Total Clearances</CardDescription>
            </div>
            <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-amber-500">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : pendingSubmissions}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Pending Review</CardDescription>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Admin Quick Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card shadow-sm border-border/50 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">User Access & Authorizations</CardTitle>
            <CardDescription>Grant verifier credentials, manage student accounts, and change user access levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="h-11 w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold">
              <Link href="/dashboard/admin/users">
                <Users className="mr-2 w-5 h-5" />
                Manage User Access
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/50 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Security compliance logs</CardTitle>
            <CardDescription>Check chronological records of logins, document deletions, and approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="h-11 w-full font-semibold border-secondary text-secondary hover:bg-secondary/10">
              <Link href="/dashboard/admin/logs">
                <ShieldAlert className="mr-2 w-5 h-5" />
                Audit System Logs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Chronological Activity Feed */}
      <Card className="bg-card shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Security Activity timeline</CardTitle>
            <CardDescription>Real-time audit activities log</CardDescription>
          </div>
          <Link href="/dashboard/admin/logs" className="text-sm font-semibold text-secondary hover:underline flex items-center">
            View All Logs
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading timeline...
            </div>
          ) : recentLogs.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-border/60 space-y-6">
              {recentLogs.map((log) => {
                const actionColors: Record<string, string> = {
                  UPLOAD: "bg-green-500",
                  DELETE: "bg-red-500",
                  SUBMIT: "bg-amber-500",
                  VERIFY_APPROVED: "bg-green-600",
                  VERIFY_REJECTED: "bg-red-600",
                  VERIFY_INCOMPLETE: "bg-sky-500",
                };
                const color = actionColors[log.action] || "bg-secondary";

                return (
                  <div key={log.id} className="relative">
                    {/* Circle marker */}
                    <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-background ${color}`} />
                    
                    <div className="bg-muted/30 border border-border/10 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                        <p className="font-bold text-foreground text-sm">
                          {log.user?.name || "System"} <span className="font-medium text-xs text-muted-foreground">({log.user?.role || "user"})</span>
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">{log.action}</p>
                      <p className="text-sm text-foreground">{log.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No recent audit transactions.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
