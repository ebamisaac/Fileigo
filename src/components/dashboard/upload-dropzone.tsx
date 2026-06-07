"use client";

import React, { useState, useCallback } from "react";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function UploadDropzone({ onFileSelect, selectedFile }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative group cursor-pointer border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4",
        isDragging 
          ? "border-secondary bg-secondary/5 scale-[0.99]" 
          : "border-border hover:border-secondary/50 hover:bg-muted/50",
        selectedFile && "border-secondary/50 bg-secondary/5"
      )}
      onClick={() => !selectedFile && document.getElementById("file-upload")?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in duration-300">
          <div className="p-4 rounded-full bg-secondary/10 text-secondary">
            <File className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground truncate max-w-[250px]">
              {selectedFile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={clearFile}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-full bg-muted text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary transition-colors duration-300">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              Click or drag file to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOCX, JPG or PNG (max. 10MB)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
