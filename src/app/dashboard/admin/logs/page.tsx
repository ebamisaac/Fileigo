"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuditLogs } from "@/services/documents";
import { 
  ArrowLeft, 
  Loader2, 
  ShieldAlert, 
  Search,
  Filter,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    fetchLogs();
  };

  // Compile list of unique action names for filter select option
  const uniqueActions = ["all", ...Array.from(new Set(logs.map((log) => log.action)))];

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (log.user?.name || "").toLowerCase().includes(q) ||
      (log.user?.email || "").toLowerCase().includes(q) ||
      (log.details || "").toLowerCase().includes(q) ||
      (log.action || "").toLowerCase().includes(q);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesAction;
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
            <h1 className="text-2xl font-bold text-foreground">Compliance Audit Logs</h1>
            <p className="text-sm text-muted-foreground">Monitor platform access, document operations, and role authorization changes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading} title="Refresh timeline">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filter Options bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search audit trail by user, action, details..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border focus:ring-2 focus:ring-ring text-sm outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none cursor-pointer focus:ring-2 focus:ring-ring"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action === "all" ? "All Actions" : action}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="bg-card shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Compliance Events Trail</CardTitle>
          <CardDescription>Cryptographically tied security event log files</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading security logs database...
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/20">
                    <th className="p-4 font-bold text-foreground w-[22%]">Timestamp</th>
                    <th className="p-4 font-bold text-foreground w-[20%]">User Profile</th>
                    <th className="p-4 font-bold text-foreground w-[18%]">Action Category</th>
                    <th className="p-4 font-bold text-foreground">Transaction Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const actionColors: Record<string, string> = {
                      UPLOAD: "bg-green-100 text-green-800 border-green-200",
                      DELETE: "bg-red-100 text-red-800 border-red-200",
                      SUBMIT: "bg-amber-100 text-amber-800 border-amber-200",
                      ROLE_CHANGE: "bg-rose-100 text-rose-800 border-rose-200",
                      VERIFY_APPROVED: "bg-green-100 text-green-800 border-green-200",
                      VERIFY_REJECTED: "bg-red-100 text-red-800 border-red-200",
                      VERIFY_INCOMPLETE: "bg-sky-100 text-sky-800 border-sky-200",
                    };
                    const color = actionColors[log.action] || "bg-muted text-muted-foreground border-border";

                    return (
                      <tr 
                        key={log.id} 
                        className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4 text-muted-foreground font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-foreground">{log.user?.name || "System"}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{log.user?.email || "System Transaction"}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${color}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-foreground break-all max-w-[400px]">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-bold text-foreground">No Logs Found</p>
              <p className="text-sm mt-1">Audit log is clear for the current selection.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
