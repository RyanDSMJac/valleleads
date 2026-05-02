import { createContext, useState, ReactNode } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type UserRole = "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// ─── Mock de usuário local ─────────────────────────────────────────────────────
// Para testar diferentes visões, troque o valor de `role` localmente:
//   "ATTENDANT"       → Visão do atendente
//   "MANAGER"         → Visão do gerente de equipe
//   "GENERAL_MANAGER" → Visão do gerente geral
// Não altere este valor antes de commitar.

const MOCK_USER: AuthUser = {
  id: "mock-user-id-001",
  name: "Dev Local",
  email: "dev@vallemultimarcas.com.br",
  role: "ATTENDANT", // ← altere aqui apenas para testes locais
  team_id: "mock-team-id-001",
};

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  login: () => {},
  logout: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER);
  const [accessToken, setAccessToken] = useState<string | null>("mock-token");

  function login(newUser: AuthUser, token: string, refreshToken: string) {
    setUser(newUser);
    setAccessToken(token);
    localStorage.setItem("refreshToken", refreshToken);
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("refreshToken");
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
