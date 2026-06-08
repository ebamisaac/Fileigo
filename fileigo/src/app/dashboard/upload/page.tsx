"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/dashboard/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { uploadDocument } from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    name: "",
    category: "Academic",
    description: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      // Auto-fill name if empty
      setMetadata((prev) => ({
        ...prev,
        name: prev.name || selectedFile.name.split(".").slice(0, -1).join("."),
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      await uploadDocument(
        file,
        {
          name: metadata.name,
          category: metadata.category,
          description: metadata.description,
        },
        user.id,
        (progress) => setUploadProgress(Math.round(progress))
      );
      
      setIsSuccess(true);
      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/documents");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-4 rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Upload Complete!</h2>
          <p className="text-muted-foreground mt-2">Your document has been safely stored.</p>
        </div>
        <p className="text-sm text-muted-foreground italic">Redirecting to library...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Document</h1>
          <p className="text-sm text-muted-foreground">Add a new file to your digital vault</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg">File Details</CardTitle>
            <CardDescription>Select a file and provide some context</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            
            <UploadDropzone onFileSelect={handleFileSelect} selectedFile={file} />

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Document Name</Label>
                  <Input
                    id="doc-name"
                    placeholder="e.g. Graduation Certificate"
                    value={metadata.name}
                    onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                    required
                    disabled={isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={metadata.category}
                    onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                    disabled={isUploading}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Personal">Personal</option>
                    <option value="Finance">Finance</option>
                    <option value="ID/Legal">ID / Legal</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us a bit about this document..."
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading to secure storage...
                    </span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                disabled={!file || isUploading}
              >
                {isUploading ? "Uploading..." : "Securely Upload File"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
