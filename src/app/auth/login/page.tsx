"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/services/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-border">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-2xl font-bold font-heading text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground text-base">
          Sign in to access your digital vault
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="font-semibold text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@university.edu"
              className="h-11 bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-semibold text-foreground">Password</Label>
              <Link href="#" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-11 bg-background"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 mt-2 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm transition-all hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-border/50 pt-6 mt-2">
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-secondary hover:underline transition-all">
            Sign up for free
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
