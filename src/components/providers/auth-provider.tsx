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
  profileError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  profileError: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // True if profile fetch failed — prevents silently demoting to student
  const [profileError, setProfileError] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const subscription = subscribeToAuthChanges(async (supabaseUser) => {
      setUser(supabaseUser);
      setProfileError(false);

      if (supabaseUser) {
        try {
          const profile = await getUserProfile(supabaseUser.id);
          // Only accept the profile if it has a valid role from the DB
          if (profile && profile.role) {
            setUserProfile(profile as UserProfile);
          } else {
            // Profile exists but role is missing — keep waiting, not demoting
            setProfileError(true);
            setUserProfile(null);
          }
        } catch (err) {
          console.error("Error loading user profile in provider:", err);
          setProfileError(true);
          setUserProfile(null);
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
    // Wait until both auth state AND profile are resolved before enforcing routes.
    // This prevents admins being kicked off their own routes during profile fetch.
    if (loading) return;
    // If user is logged in but profile hasn't resolved yet (still fetching or errored),
    // don't redirect — wait for profile to load.
    if (user && !userProfile && !profileError) return;

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
  }, [user, userProfile, profileError, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, profileError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
