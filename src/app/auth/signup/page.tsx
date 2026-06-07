"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/services/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, name);
      // Optional: Update profile with name if needed
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-border">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-2xl font-bold font-heading text-foreground">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground text-base">
          Start securing your academic documents today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2.5">
            <Label htmlFor="name" className="font-semibold text-foreground">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Isaac Student"
              className="h-11 bg-background"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
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
            <Label htmlFor="password" className="font-semibold text-foreground">Password</Label>
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
            className="w-full h-11 mt-4 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm transition-all hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-border/50 pt-6 mt-2">
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-secondary hover:underline transition-all">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
