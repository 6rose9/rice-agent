"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { Profile } from "@/types";
import { mockProfiles } from "@/lib/mock-data";

interface AuthState {
  isAuthenticated: boolean;
  user: Profile | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (phone: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    phone: string,
    password: string,
    fullName: string,
    email?: string,
    role?: string,
    region?: string,
    township?: string
  ) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
  });

  const signIn = useCallback(
    async (phone: string, _password: string) => {
      // Mock: always succeeds if phone matches a known profile
      setState((s) => ({ ...s, isLoading: true }));
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 600));
      const profile = mockProfiles.find((p) => p.phone === phone);
      if (profile) {
        setState({ isAuthenticated: true, user: profile, isLoading: false });
        return {};
      }
      // If no matching profile, create a minimal one (new user mock)
      const newProfile: Profile = {
        id: `user-${Date.now()}`,
        phone,
        username: phone.replace(/\D/g, ""),
        full_name: phone,
        role: "general_user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setState({
        isAuthenticated: true,
        user: newProfile,
        isLoading: false,
      });
      return {};
    },
    []
  );

  const signUp = useCallback(
    async (
      phone: string,
      _password: string,
      fullName: string,
      email?: string,
      role?: string,
      region?: string,
      township?: string
    ) => {
      setState((s) => ({ ...s, isLoading: true }));
      await new Promise((r) => setTimeout(r, 600));
      // Validate Myanmar phone
      const normalized = phone.replace(/[\s-]/g, "");
      if (!/^(09\d{7,9}|\+?959\d{7,8})$/.test(normalized)) {
        setState((s) => ({ ...s, isLoading: false }));
        return { error: "Please enter a valid Myanmar phone number." };
      }
      // Build location string from region + township
      const location =
        region && township ? `${township}, ${region}` : region || township || undefined;
      // Mock: always succeeds
      const newProfile: Profile = {
        id: `user-${Date.now()}`,
        phone: normalized.startsWith("+") ? normalized : normalized,
        email: email || undefined,
        username: normalized.replace(/\D/g, ""),
        full_name: fullName,
        role: (role as Profile["role"]) || "general_user",
        location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setState({
        isAuthenticated: true,
        user: newProfile,
        isLoading: false,
      });
      return {};
    },
    []
  );

  const signOut = useCallback(() => {
    setState({ isAuthenticated: false, user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
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
