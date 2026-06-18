"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import type { AuthUser, AuthContextValue } from "@/types/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfileById(authUser: User): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error || !data) {
    console.error("Failed to fetch profile:", error?.message);
    return null;
  }
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionReadyRef = useRef(false);

  // Derive authenticated state from user presence
  const isAuthenticated = user !== null;

  // Initialize session and subscribe to auth state changes
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfileById(session.user);
        if (profile) {
          setUser({ user: session.user, profile });
        } else {
          // Profile not yet created — retry once after a short delay (DB trigger race)
          await new Promise((r) => setTimeout(r, 1000));
          const retryProfile = await fetchProfileById(session.user);
          if (retryProfile) {
            setUser({ user: session.user, profile: retryProfile });
          }
        }
      }
      sessionReadyRef.current = true;
      setIsLoading(false);
    });

    // Subscribe to auth changes (handles cross-tab sign-in/sign-out and token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Skip SIGNED_IN/INITIAL_SESSION — getSession() already handles initial load.
        // Only process events after session initialization to avoid blocking on the
        // Supabase client singleton which may still be initializing during getSession().
        if (!sessionReadyRef.current) return;

        if (session?.user) {
          if (event === "TOKEN_REFRESHED") {
            // Token refresh doesn't change profile, just update the user object
            setUser((prev) =>
              prev ? { ...prev, user: session.user } : prev,
            );
            return;
          }

          // For SIGNED_IN from another tab, fetch profile
          const profile = await fetchProfileById(session.user);
          if (profile) {
            setUser({ user: session.user, profile });
          } else {
            await new Promise((r) => setTimeout(r, 1000));
            const retryProfile = await fetchProfileById(session.user);
            if (retryProfile) {
              setUser({ user: session.user, profile: retryProfile });
            }
          }
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Re-fetch the current user's profile (e.g., after editing)
  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    const profile = await fetchProfileById(authUser);
    if (profile) {
      setUser({ user: authUser, profile });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
