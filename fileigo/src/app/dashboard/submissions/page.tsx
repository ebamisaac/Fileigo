"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  getDocuments, 
  submitDocumentForVerification, 
  getSubmissions, 
  getVerificationRecords, 
  getVerifiers, 
} from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";
import { 
  FileCheck, 
  Loader2, 
  ArrowLeft, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import Link from "next/link";

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [verificationType, setVerificationType] = useState("Academic Clearance");
  const [error, setError] = useState("");
  const [verifiers, setVerifiers] = useState<any[]>([]);
  const [selectedVerifierId, setSelectedVerifierId] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedReviewNotes, setSelectedReviewNotes] = useState<string | null>(null);

  const fetchSubmissionsData = async () => {
    if (!user) return;
    try {
      const [docs, subs] = await Promise.all([
        getDocuments(user.id),
        getSubmissions("student", user.id),
      ]);
      setDocuments(docs);
      setSubmissions(subs);
      
      // Auto-select first document if any
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionsData();
  }, [user]);

  // Fetch verifier list on mount
  useEffect(() => {
    const fetchVerifiers = async () => {
      try {
        const data = await getVerifiers();
        setVerifiers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVerifiers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDocId) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await submitDocumentForVerification(user.id, selectedDocId, verificationType, selectedVerifierId);
      setSuccess("Your document has been successfully submitted for clearance review!");
      setSelectedDocId(documents[0]?.id || "");
      
      // Refresh list
      await fetchSubmissionsData();
    } catch (err: any) {
      setError(err.message || "Failed to submit document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowNotes = async (subId: string) => {
    try {
      const records = await getVerificationRecords(subId);
      if (records && records.length > 0) {
        setSelectedReviewNotes(
          `${records[0].verifier?.name || "Verifier"}: "${records[0].verifier_notes || "No details provided"}"`
        );
      } else {
        setSelectedReviewNotes("No verifier comments logged yet.");
      }
    } catch (err) {
      setSelectedReviewNotes("Failed to load evaluation comments.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clearance Submissions</h1>
          <p className="text-sm text-muted-foreground">Submit files for institutional verification and track clearance states</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Submission Form */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 shadow-sm sticky top-24 bg-white/30 backdrop-blur-lg">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">New Verification Request</CardTitle>
              <CardDescription>Initiate formal academic review</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <div className="p-3 mb-4 text-xs bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 mb-4 text-xs bg-green-500/10 text-green-600 rounded-md border border-green-500/20">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-select">Select Secured Document</Label>
                  {loading ? (
                    <div className="h-10 flex items-center justify-center border rounded-md">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : documents.length > 0 ? (
                    <select
                      id="doc-select"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      disabled={isSubmitting}
                      required
                    >
                      {documents.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 text-xs bg-amber-500/10 text-amber-600 rounded-md border border-amber-500/20 text-center font-medium">
                      You haven't uploaded any documents. Please{" "}
                      <Link href="/dashboard/upload" className="underline font-bold">
                        upload files
                      </Link>{" "}
                      first.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clearance-type">Verification Category</Label>
                  <select
                      id="clearance-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={verificationType}
                      onChange={(e) => setVerificationType(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="Academic Clearance">Academic Clearance</option>
                      <option value="Financial Verification">Financial Verification</option>
                      <option value="Admission Check">Admission Check</option>
                      <option value="Identity Validation">Identity Validation</option>
                    </select>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="verifier-select">Select Verifier</Label>
                      <select
                        id="verifier-select"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={selectedVerifierId}
                        onChange={(e) => setSelectedVerifierId(e.target.value)}
                        disabled={isSubmitting || verifiers.length === 0}
                        required
                      >
                        <option value="">Choose verifier</option>
                        {verifiers.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                  disabled={isSubmitting || documents.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-5 h-5 mr-2" />
                      Submit Verification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Submissions History Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
              <CardDescription>Real-time review updates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading submissions log...
                </div>
              ) : submissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/20">
                        <th className="p-4 font-bold text-foreground">Document</th>
                        <th className="p-4 font-bold text-foreground">Type</th>
                        <th className="p-4 font-bold text-foreground">Submitted</th>
                        <th className="p-4 font-bold text-foreground">Status</th>
                        <th className="p-4 font-bold text-right text-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => {
                        const statusConfigs: Record<string, { color: string; icon: React.ReactNode }> = {
                          pending: {
                            color: "bg-amber-100 text-amber-800 border-amber-200",
                            icon: <Clock className="w-3.5 h-3.5 mr-1" />
                          },
                          approved: {
                            color: "bg-green-100 text-green-800 border-green-200",
                            icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          },
                          rejected: {
                            color: "bg-rose-100 text-rose-800 border-rose-200",
                            icon: <XCircle className="w-3.5 h-3.5 mr-1" />
                          },
                          incomplete: {
                            color: "bg-sky-100 text-sky-800 border-sky-200",
                            icon: <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          }
                        };
                        const config = statusConfigs[sub.status] || { color: "bg-muted text-muted-foreground", icon: null };

                        return (
                          <tr key={sub.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-semibold text-foreground">
                              {sub.documents?.name || "Deleted Document"}
                            </td>
                            <td className="p-4">
                              <span className="text-xs bg-muted border border-border px-2 py-0.5 rounded-md font-medium text-muted-foreground">
                                {sub.verification_type}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(sub.submitted_at).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${config.color}`}>
                                {config.icon}
                                {sub.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShowNotes(sub.id)}
                                className="text-secondary hover:text-secondary/80 font-bold"
                              >
                                View Review
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground border-t border-border/20">
                  <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-bold text-foreground">No Submissions Recorded</p>
                  <p className="text-sm mt-1">Select a document on the left to request institutional clearance!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal / Alert for notes */}
          {selectedReviewNotes && (
            <Card className="border-border shadow-md bg-secondary/5 animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  Verifier Decision Feedback
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={() => setSelectedReviewNotes(null)}
                  >
                    Dismiss
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedReviewNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
