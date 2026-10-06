import { createClient, type User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Only the public URL and anon key enter the browser bundle. Never expose
// SUPABASE_SERVICE_ROLE_KEY or any other server-side secret here.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

interface SupabaseAuthState {
  user: User | null;
  ready: boolean;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<SupabaseAuthState>({ user: null, ready: false, passwordRecovery: false, clearPasswordRecovery: () => undefined });

export function SupabaseAuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const clearPasswordRecovery = () => setPasswordRecovery(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setPasswordRecovery(event === "PASSWORD_RECOVERY");
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, ready, passwordRecovery, clearPasswordRecovery }}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  return useContext(AuthContext);
}

export function getSupabaseRedirectUrl(path: string) {
  if (typeof window === "undefined") return path;
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  const configured = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();

  // Reuse the configured redirect host only when it matches the current site;
  // keep auth redirects on-origin and avoid sending users to another domain.
  if (configured) {
    try {
      const configuredUrl = new URL(configured, window.location.origin);
      if (configuredUrl.origin === window.location.origin) {
        return new URL(targetPath, configuredUrl.origin).toString();
      }
    } catch {
      // Fall through to the current site's origin.
    }
  }

  return new URL(targetPath, window.location.origin).toString();
}
