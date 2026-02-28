import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { ApiError, ApiUserRole, loginRequest, logoutRequest } from "@/lib/api";

export type UserRole = ApiUserRole | null;

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: ApiUserRole;
};

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  userName: string;
  token: string | null;
  login: (email: string, password: string, allowedRoles?: ApiUserRole[]) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  userName: "",
  token: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("auth_session");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { token: string; user: AuthUser };
      if (!parsed?.token || !parsed?.user?.role) return;

      setToken(parsed.token);
      setRole(parsed.user.role);
      setUserName(parsed.user.name);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem("auth_session");
    }
  }, []);

  const persistSession = (authToken: string, user: AuthUser) => {
    localStorage.setItem("auth_session", JSON.stringify({ token: authToken, user }));
  };

  const clearSession = () => {
    localStorage.removeItem("auth_session");
    setToken(null);
    setRole(null);
    setUserName("");
    setIsAuthenticated(false);
  };

  const login = async (email: string, password: string, allowedRoles?: ApiUserRole[]) => {
    const response = await loginRequest(email, password);

    if (allowedRoles && !allowedRoles.includes(response.user.role)) {
      throw {
        message: "This account is not allowed on this login page.",
        status: 403,
      } as ApiError;
    }

    setToken(response.token);
    setRole(response.user.role);
    setUserName(response.user.name);
    setIsAuthenticated(true);
    persistSession(response.token, response.user);
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutRequest(token);
      }
    } finally {
      clearSession();
    }
  };

  const contextValue = useMemo(
    () => ({ isAuthenticated, role, userName, token, login, logout }),
    [isAuthenticated, role, userName, token]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
