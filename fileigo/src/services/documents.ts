import { supabase } from "@/lib/supabase";

export interface DocumentMetadata {
  name: string;
  category: string;
  description: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: string;
}

// ======================================================================
// 1. Core Document Functions
// ======================================================================
export const uploadDocument = async (
  file: File, 
  metadata: Omit<DocumentMetadata, "file_url" | "file_name" | "file_type" | "file_size" | "user_id">,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${userId}/${fileName}`;

  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (storageError) throw storageError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  // Save metadata to Supabase Database (PostgreSQL) and return inserted record
  const { data: dbData, error: dbError } = await supabase
    .from("documents")
    .insert({
      ...metadata,
      user_id: userId,
      file_url: publicUrl,
      file_name: fileName,
      file_type: file.type || "unknown",
      file_size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup storage if database insert fails
    await supabase.storage.from("documents").remove([filePath]);
    throw dbError;
  }

  // Create Audit Log
  await createAuditLog(userId, "UPLOAD", `Uploaded document: ${metadata.name}`);

  return dbData;};

export const getDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Fetch list of verifiers for dropdown
export const getVerifiers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "verifier");

  if (error) throw error;
  return data;
};

export const deleteDocument = async (documentId: string, fileName: string, userId: string) => {
  const filePath = `${userId}/${fileName}`;

  // Delete from Storage
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([filePath]);
  
  if (storageError) throw storageError;

  // Delete from Database
  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (dbError) throw dbError;

  // Create Audit Log
  await createAuditLog(userId, "DELETE", `Deleted document ID: ${documentId}`);
};

// ======================================================================
// 2. Submission & Verification Workflow Functions
// ======================================================================
export const submitDocumentForVerification = async (
  studentId: string,
  documentId: string,
  verificationType: string,
  verifierId?: string
) => {
  // Check if already submitted
  const { data: existing, error: checkError } = await supabase
    .from("submissions")
    .select("id")
    .eq("student_id", studentId)
    .eq("document_id", documentId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) throw new Error("This document is already submitted for verification.");

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      student_id: studentId,
      document_id: documentId,
      verification_type: verificationType,
      status: "pending",
      ...(verifierId ? { verifier_id: verifierId } : {}),
    })
    .select()
    .single();

  if (error) throw error;

  // Log Audit Action
  await createAuditLog(studentId, "SUBMIT", `Submitted document for ${verificationType}`);

  return data;
};

export const getSubmissions = async (role: string, userId?: string) => {
  let query = supabase.from("submissions").select(`
    *,
    documents:document_id (*),
    student:student_id (id, name, email)
  `);

  if (role === "student" && userId) {
    query = query.eq("student_id", userId);
  }

  const { data, error } = await query.order("submitted_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const updateSubmissionStatus = async (
  submissionId: string,
  status: "approved" | "rejected" | "incomplete",
  verifierId: string,
  notes?: string
) => {
  // Update submission status
  const { data: submission, error: subError } = await supabase
    .from("submissions")
    .update({ status, verifier_id: verifierId })
    .eq("id", submissionId)
    .select()
    .single();

  if (subError) throw subError;

  // Insert verification history record
  const { error: recError } = await supabase
    .from("verification_records")
    .insert({
      submission_id: submissionId,
      verifier_notes: notes || "",
      approval_status: status,
      verifier_id: verifierId,
    });

  if (recError) throw recError;

  // Log Audit Action
  await createAuditLog(
    verifierId, 
    `VERIFY_${status.toUpperCase()}`, 
    `Reviewed submission ID: ${submissionId}`
  );

  return submission;
};

export const getVerificationRecords = async (submissionId: string) => {
  const { data, error } = await supabase
    .from("verification_records")
    .select(`
      *,
      verifier:verifier_id (name, email)
    `)
    .eq("submission_id", submissionId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
};

// ======================================================================
// 3. Audit Logging Functions
// ======================================================================
export const createAuditLog = async (userId: string, action: string, details?: string) => {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      details: details || "",
    });
    if (error) {
      console.warn(`Audit logging skipped: ${error.message}`);
    }
  } catch (err) {
    console.warn("Failed to write audit log:", err);
  }
};

export const getAuditLogs = async () => {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *,
      user:user_id (name, email, role)
    `)
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data;
};

// ======================================================================
// 4. Administration User Management
// ======================================================================
export const getUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateUserRole = async (userId: string, role: "student" | "verifier" | "admin") => {
  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
