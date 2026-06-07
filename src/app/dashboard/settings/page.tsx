"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Bell, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Preferences</h1>
        <p className="text-muted-foreground">Customize your Fileigo experience</p>
      </div>

      <div className="space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-secondary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how Fileigo looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <div className="flex bg-muted rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTheme("light")}
                  className={cn(theme === "light" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
                >
                  Light
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTheme("dark")}
                  className={cn(theme === "dark" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
                >
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your email and push notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <button 
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors duration-200",
                  emailNotifications ? "bg-secondary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200",
                  emailNotifications ? "right-1" : "left-1"
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Security Alerts</Label>
              <button 
                onClick={() => setSecurityAlerts(!securityAlerts)}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors duration-200",
                  securityAlerts ? "bg-secondary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200",
                  securityAlerts ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-secondary/5 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-foreground text-lg">Looking for account settings?</p>
              <p className="text-sm text-muted-foreground">Manage your profile, email, and password in one place.</p>
            </div>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold">
              <Link href="/dashboard/profile">
                Go to Profile
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
