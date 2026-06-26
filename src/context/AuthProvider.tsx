import React, { createContext, useContext } from "react";
import { getCurrentDemoUser } from "@/data/mockGymData";

type AuthContextType = {
  user: {
    id: string;
    email: string;
    full_name: string;
  } | null;
  session: null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const demoUser = getCurrentDemoUser();

  const value: AuthContextType = {
    user: {
      id: demoUser.id,
      email: demoUser.email,
      full_name: demoUser.full_name,
    },
    session: null,
    loading: false,
    signOut: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};