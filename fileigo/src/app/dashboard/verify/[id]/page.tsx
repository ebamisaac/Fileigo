"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getSubmissions, updateSubmissionStatus } from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";
import { 
  ArrowLeft, 
  Loader2, 
  Check, 
  X, 
  AlertCircle, 
  Download, 
  FileText,
  User,
  Calendar,
  Layers
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewDocumentPage({ params }: PageProps) {
  const router = useRouter();
  const { userProfile } = useAuth();
  
  const unwrappedParams = React.use(params);
  const submissionId = unwrappedParams.id;
  
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) return;
      try {
        const subs = await getSubmissions("verifier");
        const match = subs.find((s) => s.id === submissionId);
        if (match) {
          setSubmission(match);
        } else {
          setError("Submission record not found.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch clearance request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const handleAction = async (status: "approved" | "rejected" | "incomplete") => {
    if (!submissionId || !userProfile) return;

    setIsProcessing(true);
    setError("");

    try {
      await updateSubmissionStatus(submissionId, status, userProfile.id, notes);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Failed to mark submission as ${status}.`);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <span className="font-semibold text-sm">Fetching document clearance file...</span>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Review Error</h2>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button asChild className="bg-secondary text-secondary-foreground">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const doc = submission.documents;
  const student = submission.student;

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Submission</h1>
          <p className="text-sm text-muted-foreground">Evaluate academic details and log formal approval clearance</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20 max-w-full">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Document Preview Panel */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px]">
          <Card className="border-border/50 shadow-sm flex flex-col h-full flex-1 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3 flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-secondary" />
                  {doc?.name || "Academic File Preview"}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-1">{doc?.file_name}</CardDescription>
              </div>
              {doc?.file_url && (
                <Button variant="ghost" size="icon" asChild title="Download Document">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-muted/20 min-h-[400px]">
              {doc?.file_url ? (
                doc.file_type.startsWith("image/") ? (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img 
                      src={doc.file_url} 
                      alt={doc.name} 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-md border" 
                    />
                  </div>
                ) : (
                  <iframe 
                    src={`${doc.file_url}#toolbar=0`}
                    className="w-full h-full absolute inset-0 border-0"
                    title="PDF Viewer"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-8">
                  <FileText className="w-12 h-12 text-muted-foreground/30" />
                  <p className="font-semibold text-sm">No preview available for this document format.</p>
                  {doc?.file_url && (
                    <a 
                      href={doc.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-secondary underline font-bold"
                    >
                      Open in standard tab
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Decision & Metadata Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Metadata Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-base">Submission Details</CardTitle>
              <CardDescription>Academic metadata credentials</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Student Name</p>
                  <p className="text-sm font-bold text-foreground">{student?.name || "Student"}</p>
                  <p className="text-xs text-muted-foreground">{student?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Clearance Requested Type</p>
                  <p className="text-sm font-bold text-foreground">{submission.verification_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted Timestamp</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {doc?.description && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Student Comments:</p>
                  <p className="text-xs text-foreground bg-muted p-2 rounded-lg italic border">
                    "{doc.description}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card className="border-border/50 shadow-sm flex-1 flex flex-col justify-between">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-base">Verification Assessment</CardTitle>
              <CardDescription>Record institutional decisions</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="remarks" className="font-semibold text-xs text-muted-foreground">
                  Verification Comments / Remarks (Required if rejecting or flagging incomplete)
                </Label>
                <textarea
                  id="remarks"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter evaluation notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </CardContent>
            <CardFooter className="p-5 border-t bg-muted/10 grid grid-cols-3 gap-2 shrink-0">
              <Button
                variant="outline"
                className="font-bold border-sky-500 text-sky-500 hover:bg-sky-500/10 text-xs px-2 h-10"
                onClick={() => handleAction("incomplete")}
                disabled={isProcessing || !notes.trim()}
                title="Flag incomplete if metadata or files are missing"
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Incomplete
              </Button>

              <Button
                variant="outline"
                className="font-bold border-rose-600 text-rose-600 hover:bg-rose-600/10 text-xs px-2 h-10"
                onClick={() => handleAction("rejected")}
                disabled={isProcessing || !notes.trim()}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>

              <Button
                className="font-bold bg-green-600 hover:bg-green-700 text-white text-xs px-2 h-10"
                onClick={() => handleAction("approved")}
                disabled={isProcessing}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Approve
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
