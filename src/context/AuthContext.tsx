import { createContext } from "react";

export interface AppUser {
  displayName?: string;
  email?: string;
  photoURL?: string;
  [key: string]: unknown;
}

export interface AuthUser {
  email: string;
  nombre: string;
  rol: string;
}

export interface AuthContextType {
  user: AppUser | null;
  authUser: AuthUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);