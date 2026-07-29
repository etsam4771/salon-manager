import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "../api/services/auth.service";
import type { LoginCredentials, RegisterCredentials, User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (creds: LoginCredentials) => Promise<User | undefined>;
  register: (creds: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  // Starts true so protected routes wait for the "who am I" check below
  // instead of bouncing a refreshed page straight to /login.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = localStorage.getItem("token");
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Re-validate the cached session against the server on load so a
      // stale/expired token doesn't leave the UI thinking it's authenticated.
      try {
        const res = await authService.getCurrentUser();
        if (!cancelled && res.data) {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (creds: LoginCredentials) => {
    const res = await authService.login(creds);
    if (res.user) setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (creds: RegisterCredentials) => {
    await authService.register(creds);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
