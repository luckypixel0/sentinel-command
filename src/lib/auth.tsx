import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS } from "@/services/mock";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "sentinelai.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw) as User); } catch { /* noop */ }
    }
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error("Invalid credentials. Try any listed email with password: sentinel");
    const { password: _pw, ...safe } = found;
    void _pw;
    setUser(safe);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const resetPassword = async (email: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const exists = MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) throw new Error("No account found for that email.");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
