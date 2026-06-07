"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer, Trash2, Calendar, HardDrive, FileType, Loader2 } from "lucide-react";
import { deleteDocument } from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";

interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: string;
  created_at: string;
  description?: string;
  file_url: string;
  file_name: string;
}

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!document) return null;

  const handleDownload = () => {
    window.open(document.file_url, "_blank");
  };

  const handlePrint = () => {
    const printWindow = window.open(document.file_url, "_blank");
    if (printWindow) {
      printWindow.print();
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirm(`Are you sure you want to delete ${document.name}? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteDocument(document.id, document.file_name, user.id);
        onClose();
        // Refresh page to show updated list (or use state management)
        window.location.reload();
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="p-6 border-b bg-card flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{document.name}</DialogTitle>
              <DialogDescription className="text-sm">
                Document Preview & Details
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-muted/20">
          {/* Preview Section */}
          <div className="flex-1 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r">
            <div className="w-full h-full max-w-2xl bg-card rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center gap-4 shadow-inner">
              <div className="p-8 rounded-full bg-muted text-muted-foreground/30">
                <FileType className="w-20 h-20" />
              </div>
              <p className="text-muted-foreground font-medium italic">Preview not available for this file type</p>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 p-6 space-y-8 bg-card overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Metadata</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Uploaded on</p>
                    <p className="text-sm font-medium">
                      {document.created_at ? new Date(document.created_at).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HardDrive className="w-4 h-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="text-sm font-medium">{document.file_size}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileType className="w-4 h-4 text-secondary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Format</p>
                    <p className="text-sm font-medium">{document.file_type}</p>
                  </div>
                </div>
              </div>
            </div>

            {document.description && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {document.description}
                </p>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-start text-foreground hover:bg-muted" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
              <Button variant="outline" className="w-full justify-start text-foreground hover:bg-muted" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print Document
              </Button>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <DialogFooter className="p-4 border-t bg-muted/30 flex sm:justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete Document
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
