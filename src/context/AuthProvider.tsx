import { useState, useEffect } from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signOut,
  signInWithRedirect,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { jwtDecode } from "jwt-decode";
import { ALLOWED_EMAIL_DOMAINS } from "@/config/constants";
import { AuthContext, type AuthUser } from "./AuthContext";

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
          const loginUrl = `/login?error=domain&domain=${domain}`;
          window.location.href = loginUrl;
          return;
        }

        const groups = decoded["cognito:groups"] || [];
        const validGroups = groups.filter(
          (g: string) => !g.endsWith("_google") && !g.includes("us-east-1"),
        );
        const rol =
          validGroups.length > 0 ? validGroups[0] : "Sin rol asignado";

        const authUserData: AuthUser = {
          email,
          nombre: decoded.name || "",
          rol,
        };

        setAuthUser(authUserData);
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();

    const hubListener = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkUserSession();
          break;
        case "signedOut":
          setUser(null);
          setAuthUser(null);
          break;
      }
    });

    return () => hubListener();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authUser, loading, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}