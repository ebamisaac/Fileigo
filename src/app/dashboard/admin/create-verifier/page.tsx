"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Users,
  ShieldAlert,
  CheckCircle2,
  Search,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  UserX,
  Lock,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { getUsers, updateUserRole, createAuditLog } from "@/services/documents";

export default function CreateVerifierPage() {
  const { user, userProfile } = useAuth();
  
  // Navigation tabs: 'create' or 'directory'
  const [activeTab, setActiveTab] = useState<"create" | "directory">("create");

  // Create Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Directory State
  const [verifiers, setVerifiers] = useState<any[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Revocation State (Dialog)
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedVerifier, setSelectedVerifier] = useState<any | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Load Verifiers
  const loadVerifiers = async () => {
    setLoadingDirectory(true);
    try {
      const data = await getUsers();
      const verifiersList = data.filter((u: any) => u.role === "verifier");
      setVerifiers(verifiersList);
    } catch (err: any) {
      console.error("Failed to load verifiers:", err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  useEffect(() => {
    loadVerifiers();
  }, [refreshKey]);

  // Form Reset
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
  };

  // Password Strength Checker
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: "", color: "bg-muted" };
    if (password.length < 6) return { score: 1, text: "Weak (too short)", color: "bg-destructive" };
    
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (hasNumbers && hasSpecial) {
      return { score: 3, text: "Strong", color: "bg-green-500" };
    }
    return { score: 2, text: "Medium", color: "bg-amber-500" };
  };

  const pwdStrength = getPasswordStrength();

  // Create Submit
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure the user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('You must be logged in to create a verifier.');
      return;
    }

    // Verify admin role from auth context
    if (!userProfile) {
      setError('User profile is still loading. Please try again shortly.');
      return;
    }
    if (userProfile.role !== "admin") {
      setError('Only admin users can create verifiers.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Get current user's session token for server auth
      // Token already obtained above
      const token = session?.access_token;

      if (!token) {
        throw new Error("Authentication token is missing. Please re-login.");
      }

      // 2. Post to the secure API route
      const res = await fetch("/api/admin/create-verifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json().catch(() => null);
      // Optional: log response for debugging
      console.log('Create verifier response', res.status, data);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create verifier.");
      }

      // 3. Log Audit Trail event on frontend (as backup and database record)
      if (userProfile) {
        await createAuditLog(
          userProfile.id,
          "ROLE_CHANGE",
          `Created verifier account for ${name} (${email})`
        );
      }

      setSuccess(`Verifier account for "${name}" created successfully!`);
      resetForm();
      // Reload directory list
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Revoke role submit
  const handleConfirmRevoke = async () => {
    if (!selectedVerifier || !userProfile) return;

    setRevoking(true);
    try {
      // Demote verifier back to a student role
      await updateUserRole(selectedVerifier.id, "student");
      
      // Log Audit Trail event
      await createAuditLog(
        userProfile.id,
        "ROLE_CHANGE",
        `Revoked verifier role from ${selectedVerifier.name || selectedVerifier.email} (demoted to student)`
      );

      // Refresh list
      setRefreshKey(prev => prev + 1);
      setIsRevokeOpen(false);
      setSelectedVerifier(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to revoke verifier credentials.");
    } finally {
      setRevoking(false);
    }
  };

  // Filter list of verifiers based on search query
  const filteredVerifiers = verifiers.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.name || "").toLowerCase().includes(q) ||
      (v.email || "").toLowerCase().includes(q)
    );
  });

  const isDisabled = loading || !email || !password || !name || password.length < 6;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Verifier Management Hub
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                Admin Control
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Create credentialed verifiers and monitor active authorization permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Glassmorphic Tab Controller */}
      <div className="flex border-b border-border/50 bg-card p-1 rounded-xl shadow-sm max-w-md">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "create"
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Create Verifier
        </button>
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "directory"
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="w-4 h-4" />
          Active Directory
          {verifiers.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "directory" ? "bg-white text-secondary" : "bg-muted text-muted-foreground"
            }`}>
              {verifiers.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === "create" ? (
        <Card className="w-full max-w-2xl mx-auto shadow-md border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-indigo-500 to-accent" />
          <CardHeader className="space-y-2 pb-6 pt-8 text-center">
            <CardTitle className="text-2xl font-bold">
              Add Verifier Account
            </CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Register institutional validators. They will be granted system rights to view, evaluate, and clear student documents.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleCreate} className="space-y-5">
              {/* ALERTS WITH ANIMATIONS */}
              {error && (
                <div className="p-4 text-sm rounded-lg border bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 text-sm rounded-lg border bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-semibold">{success}</span>
                </div>
              )}

              {/* FULL NAME */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Verifier's complete name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11 focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Institutional Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="verifier@fileigo.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11 focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Temporary Password
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 pr-11 focus:ring-2 focus:ring-secondary transition-all font-mono"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5 pt-1.5 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Strength:</span>
                      <span className="font-bold capitalize" style={{ color: `var(--${pwdStrength.color})` }}>
                        {pwdStrength.text}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                        style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm transition-all duration-200 mt-2"
                disabled={isDisabled}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Registering Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Verifier Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Active Verifiers Tab Directory */
        <Card className="bg-card shadow-md border-border/50 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Active Verifiers</CardTitle>
                <CardDescription>Directory of administrators and evaluators with validation permissions.</CardDescription>
              </div>

              <div className="flex items-center gap-3 self-stretch sm:self-auto">
                {/* Search box */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search verifiers..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/40 border border-transparent focus:bg-background focus:border-border text-sm outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  disabled={loadingDirectory}
                  title="Reload Directory"
                  className="rounded-lg h-9 w-9 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDirectory ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loadingDirectory ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-secondary mb-3" />
                <p className="font-semibold text-sm">Querying active verifiers directory...</p>
              </div>
            ) : filteredVerifiers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Email Address</TableHead>
                      <TableHead className="font-bold">Added Date</TableHead>
                      <TableHead className="font-bold">Access Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVerifiers.map((v) => (
                      <TableRow key={v.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-extrabold text-sm border border-secondary/20">
                              {(v.name || "V")[0].toUpperCase()}
                            </div>
                            <span>{v.name || "Verifier Profile"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">{v.email}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">
                          {v.created_at ? new Date(v.created_at).toLocaleDateString() : "System Admin"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Authorized
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVerifier(v);
                              setIsRevokeOpen(true);
                            }}
                            className="text-destructive hover:bg-destructive/10 font-bold transition-all px-2.5 py-1"
                          >
                            <UserX className="w-4 h-4 mr-1.5" />
                            Revoke Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-bold text-foreground">No Verifiers Found</p>
                <p className="text-sm mt-1">
                  {searchQuery ? "Try refining your search text." : "No accounts registered with verifier roles."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CONFIRMATION REVOKE DIALOG */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="max-w-md border-border/50 shadow-lg">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto sm:mx-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-center sm:text-left">
              Confirm Role Revocation
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left">
              Are you sure you want to revoke the verifier role from{" "}
              <span className="font-bold text-foreground">
                {selectedVerifier?.name || selectedVerifier?.email}
              </span>
              ?
              <br />
              <br />
              This will demote the account back to a <span className="font-bold text-foreground">Student</span>. The user will lose all rights to review, clear, or view student documents immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="font-semibold">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={revoking}
              className="font-bold"
            >
              {revoking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke & Demote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}