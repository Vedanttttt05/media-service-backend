import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usersApi } from "../api/endpoints";
import type { User } from "../api/types";

interface AuthValue {
  user: User | null;
  /** True until the initial session check finishes. */
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (form: FormData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .current()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const { user } = await usersApi.login(identifier, password);
    setUser(user);
  }, []);

  const register = useCallback(
    async (form: FormData) => {
      await usersApi.register(form);
      await login(String(form.get("username")), String(form.get("password")));
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await usersApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** For pages rendered behind RequireAuth, where the user is always present. */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error("useCurrentUser used outside an authenticated route");
  return user;
}
