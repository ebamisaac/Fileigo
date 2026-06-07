"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DocumentPreviewModal } from "@/components/dashboard/document-preview-modal";
import { Eye, FileText, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getDocuments } from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";
import { useSearchParams } from "next/navigation";

export default function DocumentsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Sync search query with URL param
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      try {
        const docs = await getDocuments(user.id);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  const handleLocalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Update URL so Header search bar stays in sync
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const filteredDocuments = documents.filter(doc => {
    const query = searchQuery.toLowerCase();
    const nameMatch = doc.name.toLowerCase().includes(query);
    const categoryMatch = doc.category?.toLowerCase().includes(query);
    const dateString = doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "";
    const dateMatch = dateString.toLowerCase().includes(query);

    return nameMatch || categoryMatch || dateMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Library</h1>
          <p className="text-sm text-muted-foreground">Manage all your secured files in one place</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10"
            value={searchQuery}
            onChange={handleLocalSearch}
          />
        </div>
      </div>

      <Card className="bg-card shadow-sm border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading documents...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleView(doc)}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-secondary" />
                    {doc.name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary/10 text-secondary text-xs font-semibold">
                      {doc.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{doc.file_size}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Pending"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="hover:text-secondary" onClick={(e) => { e.stopPropagation(); handleView(doc); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No documents found. Start by uploading one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DocumentPreviewModal
        document={selectedDoc}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
