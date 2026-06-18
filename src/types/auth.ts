import type { User } from "@supabase/supabase-js";
import type { Profile } from "./index";

/** Combined auth user with profile. Available from AuthProvider context. */
export interface AuthUser {
  user: User;
  profile: Profile;
}

/** Auth state exposed by AuthProvider */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/** Auth context value including actions */
export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
