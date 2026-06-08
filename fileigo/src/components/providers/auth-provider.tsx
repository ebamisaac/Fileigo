"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { subscribeToAuthChanges, getUserProfile } from "@/services/auth";
import { useRouter, usePathname } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "verifier" | "admin";
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const subscription = subscribeToAuthChanges(async (supabaseUser) => {
      setUser(supabaseUser);

      if (supabaseUser) {
        try {
          const profile = await getUserProfile(supabaseUser.id);
          setUserProfile(profile as UserProfile);
        } catch (err) {
          console.error("Error loading user profile in provider:", err);
          setUserProfile({
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || "User",
            email: supabaseUser.email || "",
            role: "student",
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle route protection
  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith("/auth");
    const isDashboardPage = pathname.startsWith("/dashboard");

    if (user && userProfile) {
      if (isAuthPage) {
        router.push("/dashboard");
      }

      // Enforce route protection based on roles
      if (isDashboardPage) {
        const isAdminRoute = pathname.startsWith("/dashboard/admin");
        const isVerifierRoute = pathname.startsWith("/dashboard/verify") || pathname.includes("/verify/");

        if (isAdminRoute && userProfile.role !== "admin") {
          console.warn("Access denied: Admin role required");
          router.push("/dashboard");
        } else if (isVerifierRoute && userProfile.role !== "verifier" && userProfile.role !== "admin") {
          console.warn("Access denied: Verifier role required");
          router.push("/dashboard");
        }
      }
    } else if (!user && isDashboardPage) {
      router.push("/auth/login");
    }
  }, [user, userProfile, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
