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
import { AVAILABLE_ROLES } from "@/features/iam/types";
import { AuthContext, type AuthUser } from "./AuthContext";

type AmplifyUser = Awaited<ReturnType<typeof getCurrentUser>>;

type IdTokenClaims = {
  email?: string;
  name?: string;
  "cognito:groups"?: string[];
  [key: string]: unknown;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AmplifyUser | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (!token) throw new Error("No token found");

        const decoded = jwtDecode<IdTokenClaims>(token);
        const email = typeof decoded.email === "string" ? decoded.email : "";
        const domain = email.split("@")[1];

        if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
          sessionStorage.setItem("loginErrorDomain", domain);
          await signOut(); 
          return;
        }

        const groupsClaim = decoded["cognito:groups"];
        const groups: string[] = Array.isArray(groupsClaim) ? groupsClaim : [];

        const validGroups = groups
          .filter((g) => !g.endsWith("_google") && !g.includes("us-east-1"))
          .filter((g) => (AVAILABLE_ROLES as readonly string[]).includes(g));

        const roles = validGroups.length > 0 ? validGroups : ["sin_asignar"];

        const authUserData: AuthUser = {
          email,
          nombre: typeof decoded.name === "string" ? decoded.name : "",
          roles,  
        };

        setAuthUser(authUserData);
        setUser(currentUser);
      } catch (error: any) {
        if (error.name !== 'UserUnAuthenticatedException' && error.message !== 'User needs to be authenticated to call this API.') {
            console.error("Error al validar la sesión:", error);
        }
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
