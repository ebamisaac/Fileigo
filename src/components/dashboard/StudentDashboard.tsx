"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Eye, Loader2, FileCheck, ShieldAlert, BadgeHelp } from "lucide-react";
import Link from "next/link";
import { DocumentPreviewModal } from "@/components/dashboard/document-preview-modal";
import { getDocuments, getSubmissions } from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";

export function StudentDashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [docs, subs] = await Promise.all([
          getDocuments(user.id),
          getSubmissions("student", user.id),
        ]);
        setDocuments(docs);
        setSubmissions(subs);
      } catch (error: any) {
        console.error("Error fetching student dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  const totalFiles = documents.length;
  const totalSize = documents.reduce((acc, doc) => {
    const size = parseFloat(doc.file_size?.split(" ")[0] || "0");
    return acc + size;
  }, 0).toFixed(2);

  const pendingSubmissions = submissions.filter(s => s.status === "pending").length;
  const approvedSubmissions = submissions.filter(s => s.status === "approved").length;

  const recentUploads = documents.slice(0, 3);
  const recentSubmissions = submissions.slice(0, 3);

  return (
    <div className="grid gap-6 md:gap-8">
      {/* Dynamic welcome header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-heading">
          Student Workspace
        </h1>
        <p className="text-muted-foreground">
          Welcome back. Access your digital vault, submit clearances, and manage academic documents securely.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalFiles}
            </CardTitle>
            <CardDescription className="text-sm font-medium">Secured Documents</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${totalSize} MB`}
            </CardTitle>
            <CardDescription className="text-sm font-medium">Storage Allocation</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-amber-500">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : pendingSubmissions}
            </CardTitle>
            <CardDescription className="text-sm font-medium">Awaiting Verification</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-green-500">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : approvedSubmissions}
            </CardTitle>
            <CardDescription className="text-sm font-medium">Verified Submissions</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card shadow-sm border-border/50 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Secure Document Upload</CardTitle>
            <CardDescription>Upload certificate copies, admission letters, or receipts to the cloud.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="h-11 w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold">
              <Link href="/dashboard/upload">
                <UploadCloud className="mr-2 w-5 h-5" />
                Upload New Document
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border/50 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Request Document Verification</CardTitle>
            <CardDescription>Submit your uploaded files to verifiers for formal review and clearance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="h-11 w-full font-semibold border-secondary text-secondary hover:bg-secondary/10">
              <Link href="/dashboard/submissions">
                <FileCheck className="mr-2 w-5 h-5" />
                Request Verification Clearance
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dual Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Vault Uploads</CardTitle>
              <CardDescription>Latest files secured in your library</CardDescription>
            </div>
            <Link href="/dashboard/documents" className="text-sm font-semibold text-secondary hover:underline">
              View Library
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading vault...
              </div>
            ) : recentUploads.length > 0 ? (
              <ul className="space-y-3">
                {recentUploads.map((doc) => (
                  <li 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 border border-border/20 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => handleView(doc)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm line-clamp-1">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.category} • {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Just now"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No documents found. Start by uploading one!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Submissions */}
        <Card className="bg-card shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Clearance Submissions</CardTitle>
              <CardDescription>Track state of submitted verifications</CardDescription>
            </div>
            <Link href="/dashboard/submissions" className="text-sm font-semibold text-secondary hover:underline">
              View History
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading submissions...
              </div>
            ) : recentSubmissions.length > 0 ? (
              <ul className="space-y-3">
                {recentSubmissions.map((sub) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-amber-100 text-amber-800 border-amber-200",
                    approved: "bg-green-100 text-green-800 border-green-200",
                    rejected: "bg-rose-100 text-rose-800 border-rose-200",
                    incomplete: "bg-sky-100 text-sky-800 border-sky-200",
                  };
                  return (
                    <li 
                      key={sub.id} 
                      className="flex items-center justify-between p-3 border border-border/20 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm line-clamp-1">{sub.documents?.name || "Document"}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.verification_type} • {new Date(sub.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold border rounded-full uppercase tracking-wider ${statusColors[sub.status] || "bg-muted text-muted-foreground"}`}>
                        {sub.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No active verification request clearance.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DocumentPreviewModal 
        document={selectedDoc} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </div>
  );
}
