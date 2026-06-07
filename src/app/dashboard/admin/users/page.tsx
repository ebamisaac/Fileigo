"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getUsers, 
  updateUserRole, 
  createAuditLog 
} from "@/services/documents";
import { useAuth } from "@/components/providers/auth-provider";
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Search,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function UserManagementPage() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load user directories:", err);
      setErrorMsg("Failed to load user accounts database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "student" | "verifier" | "admin", userName: string) => {
    setUpdatingUserId(userId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await updateUserRole(userId, newRole);
      setSuccessMsg(`Successfully reassigned ${userName} to ${newRole.toUpperCase()} role.`);
      
      // Log Action in Audits
      if (userProfile) {
        await createAuditLog(
          userProfile.id, 
          "ROLE_CHANGE", 
          `Changed user ${userName} role to ${newRole}`
        );
      }
      
      // Refresh list
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update user authorization role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage student and verifier roles, grant authorizations, and audit profiles</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search accounts..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border border-transparent focus:bg-background focus:border-border text-sm outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-sm bg-green-500/10 text-green-600 rounded-md border border-green-500/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      <Card className="bg-card shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Registered User Accounts</CardTitle>
          <CardDescription>Institutional directory database profiles</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading accounts database...
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/20">
                    <th className="p-4 font-bold text-foreground">Full Name</th>
                    <th className="p-4 font-bold text-foreground">Email Address</th>
                    <th className="p-4 font-bold text-foreground">Registration Date</th>
                    <th className="p-4 font-bold text-foreground">Active Role</th>
                    <th className="p-4 font-bold text-right text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => {
                    const roleColors: Record<string, string> = {
                      student: "bg-primary/10 text-primary border-primary/20",
                      verifier: "bg-secondary/10 text-secondary border-secondary/20",
                      admin: "bg-rose-100 text-rose-800 border-rose-200",
                    };
                    const color = roleColors[item.role] || "bg-muted text-muted-foreground";

                    return (
                      <tr 
                        key={item.id} 
                        className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4 font-semibold text-foreground">
                          {item.name || "Academic User"}
                        </td>
                        <td className="p-4 text-muted-foreground">{item.email}</td>
                        <td className="p-4 text-muted-foreground">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "System Profile"}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${color}`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {updatingUserId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-4" />
                            ) : (
                              <select
                                className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-bold ring-offset-background outline-none cursor-pointer focus:ring-2 focus:ring-ring"
                                value={item.role}
                                onChange={(e) => handleRoleChange(
                                  item.id, 
                                  e.target.value as any, 
                                  item.name || item.email
                                )}
                                disabled={updatingUserId !== null || item.id === userProfile?.id}
                                title={item.id === userProfile?.id ? "You cannot modify your own authorization role!" : "Change user role"}
                              >
                                <option value="student">Student</option>
                                <option value="verifier">Verifier</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-bold text-foreground">No Accounts Matches</p>
              <p className="text-sm mt-1">Try modifying your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
