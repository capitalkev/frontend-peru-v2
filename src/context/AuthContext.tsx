import React, { createContext, useEffect, useState } from "react";
import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { jwtDecode } from "jwt-decode";
import { ALLOWED_EMAIL_DOMAINS } from "@/config/constants";

// 1. TIPOS LIMPIOS (Solo lo que Cognito realmente nos da)
export interface AuthUser {
  email: string;
  nombre: string;
  rol: string; // Ej: 'admin', 'operador', 'gestion'
}

interface AuthContextType {
  user: any | null; // Objeto nativo de Amplify (útil para tokens)
  authUser: AuthUser | null; // Tu usuario limpio y estandarizado
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) throw new Error("No token found");

        const decoded: any = jwtDecode(token);
        const email = decoded.email || "";
        const domain = email.split("@")[1];

        if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
          await signOut();
          // Redirigir con parámetros de error en lugar de usar sessionStorage
          const loginUrl = `/login?error=domain&domain=${domain}`;
          // Forzar recarga para limpiar estado
          window.location.href = loginUrl;
          return;
        }

        // Extracción del Rol desde Cognito Groups
        const groups = decoded["cognito:groups"] || [];
        const validGroups = groups.filter(
          (g: string) => !g.endsWith("_google") && !g.includes("us-east-1"),
        );
        const rol =
          validGroups.length > 0
            ? validGroups[0].toLowerCase()
            : "sin_asignar";

        // Creamos el usuario basado estrictamente en la identidad
        const cleanUser: AuthUser = {
          email: email,
          nombre: decoded.name || email.split("@")[0],
          rol: rol,
        };

        setUser(currentUser);
        setAuthUser(cleanUser);
      } catch (error) {
        console.error("Error checking user session:", error);
        setUser(null);
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          checkUserSession();
          break;
        case "signedOut":
          setUser(null);
          setAuthUser(null);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        loading,
        loginWithGoogle: () => signInWithRedirect({ provider: "Google" }),
        logout: () => signOut(),
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
