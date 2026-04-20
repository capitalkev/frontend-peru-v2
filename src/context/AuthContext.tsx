import { createContext } from "react";

export interface AuthUser {
  email: string;
  nombre: string;
  rol: string;
}

export interface AuthContextType {
  user: any | null;
  authUser: AuthUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);