"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { getSubmissions } from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";

export function VerifierDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await getSubmissions("verifier");
        setSubmissions(data);
      } catch (error) {
        console.error("Error loading submissions for verifier:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Compute metric counts
  const pending = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;
  const incomplete = submissions.filter((s) => s.status === "incomplete").length;

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");

  return (
    <div className="grid gap-6 md:gap-8">
      {/* Header welcome banner */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-heading">
          Verification Office
        </h1>
        <p className="text-muted-foreground">
          Welcome back. Review student clearance requests, approve verified academic records, and flag incomplete files.
        </p>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-amber-500">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : pending}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Pending Review</CardDescription>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-green-500">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : approved}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Approved Docs</CardDescription>
            </div>
            <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-rose-500">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : rejected}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Rejected Docs</CardDescription>
            </div>
            <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-sky-500">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : incomplete}
              </CardTitle>
              <CardDescription className="text-sm font-semibold">Incomplete Metadata</CardDescription>
            </div>
            <div className="w-10 h-10 bg-sky-500/10 text-sky-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main Awaiting Table */}
      <Card className="bg-card shadow-sm border-border/50">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Pending Verifications</CardTitle>
            <CardDescription>Academic documents submitted by students requiring validation</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
              {pending} Clearance Tasks
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading submissions database...
            </div>
          ) : pendingSubmissions.length > 0 ? (
            <div className="overflow-x-auto border border-border/20 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/20">
                    <th className="p-4 font-bold text-foreground">Student Details</th>
                    <th className="p-4 font-bold text-foreground">Document Title</th>
                    <th className="p-4 font-bold text-foreground">Request Category</th>
                    <th className="p-4 font-bold text-foreground">Date Submitted</th>
                    <th className="p-4 font-bold text-right text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSubmissions.map((sub) => (
                    <tr 
                      key={sub.id} 
                      className="border-b border-border/10 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-foreground">{sub.student?.name || "Student"}</p>
                          <p className="text-xs text-muted-foreground">{sub.student?.email || "Unknown"}</p>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {sub.documents?.name || "Untitled document"}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/20">
                          {sub.verification_type}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                          <Link href={`/dashboard/verify/${sub.id}`}>
                            Review & Process
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border/50 rounded-xl">
              <FileCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-bold text-foreground">Clearance Workspace Empty</p>
              <p className="text-sm mt-1">There are no pending documents waiting for verification clearance!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
