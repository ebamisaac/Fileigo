import { supabase } from "@/lib/supabase";

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, name: string, role = "student") => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: role,
      }
    }
  });
  if (error) throw error;

  // Programmatic fallback: if the database trigger is not active, insert profile directly.
  if (data?.user) {
    try {
      await supabase.from("users").upsert({
        id: data.user.id,
        name: name,
        email: email,
        role: role,
      });
    } catch (e: any) {
      console.warn("Direct profile sync skipped or failed (triggers might be handling this):", e?.message || e);
    }
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return subscription;
};

export const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn(`Profile table query returned error (falling back to default): ${error.message}`);
      return { id: userId, role: "student", name: "User", email: "" };
    }
    return data;
  } catch (err: any) {
    console.warn("Fallback triggered: profiles table query failed:", err?.message || err);
    return { id: userId, role: "student", name: "User", email: "" };
  }
};
