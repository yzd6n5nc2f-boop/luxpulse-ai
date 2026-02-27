import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type AuthSession = {
  email: string;
  displayName: string;
};

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => void;
  logout: () => void;
};

const STORAGE_KEY = 'luxlight-auth-session';
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function deriveDisplayName(email: string) {
  const localPart = email.split('@')[0] ?? email;
  return localPart
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login: ({ email, password }) => {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email and password are required');
        }

        const nextSession = {
          email: email.trim().toLowerCase(),
          displayName: deriveDisplayName(email.trim()),
        };

        setSession(nextSession);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      },
      logout: () => {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
