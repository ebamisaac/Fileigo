"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [hasNotifications, setHasNotifications] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  // Sync local state with URL param
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Update URL to trigger search on Documents page
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    const isDocsPage = window.location.pathname.includes("/dashboard/documents");

    // Only redirect if there is a search term and we're not on the documents page
    if (value.trim() && !isDocsPage) {
      router.push(`/dashboard/documents?${params.toString()}`);
    } else if (isDocsPage) {
      // If we're already on docs page, just update the URL without pushing to history
      window.history.replaceState(null, "", `?${params.toString()}`);
      // Manually trigger a search update
      const event = new PopStateEvent('popstate');
      window.dispatchEvent(event);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <header className="h-20 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4 flex-1">
        <button
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            name="search"
            autoComplete="off"
            placeholder="Search documents, tags, or categories..."
            value={searchValue}
            onChange={handleSearch}
            className="w-full h-11 pl-10 pr-4 rounded-full bg-muted/50 border border-transparent focus:bg-background focus:border-border focus:ring-2 focus:ring-ring focus:ring-opacity-50 text-sm outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={() => setHasNotifications(false)}
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
          )}
        </button>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 border-l border-border pl-4 md:pl-6 ml-2 md:ml-0 hover:bg-muted/50 transition-colors rounded-lg py-1 px-2"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-foreground leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground mt-1">{email}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
