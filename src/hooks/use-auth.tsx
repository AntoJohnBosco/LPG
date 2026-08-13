import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type AuthSession } from "@/services/auth-service";

interface AuthContextValue {
  session: AuthSession | null;
  ready: boolean;
  refresh: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  ready: false,
  refresh: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(authService.getSession());
    setReady(true);
  }, []);

  const refresh = useCallback(() => setSession(authService.getSession()), []);
  const signOut = useCallback(() => {
    authService.signOut();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, ready, refresh, signOut }),
    [session, ready, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
