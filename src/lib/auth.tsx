"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "./supabase";
import { hasSupabase } from "./env";
import { track } from "./novus";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  authEnabled: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAppUser(u: any): AppUser | null {
  if (!u) return null;
  const email = u.email ?? "";
  return {
    id: u.id,
    email,
    displayName: (u.user_metadata?.display_name as string) || email.split("@")[0] || "you",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const authEnabled = hasSupabase();

  useEffect(() => {
    const sb = supabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    let active = true;
    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(toAppUser(data.session?.user));
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(toAppUser(session?.user));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const sb = supabase();
    if (!sb) return { error: "Auth not configured" };
    const { error } = await sb.auth.signUp({ email, password });
    if (error) return { error: error.message };
    track("user_signed_up", {});
    return {};
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = supabase();
    if (!sb) return { error: "Auth not configured" };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    track("user_signed_in", {});
    return {};
  }, []);

  const signOut = useCallback(async () => {
    const sb = supabase();
    if (!sb) return;
    await sb.auth.signOut();
    track("user_signed_out", {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, authEnabled, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
