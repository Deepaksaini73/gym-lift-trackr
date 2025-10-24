import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 AuthProvider: Initializing...");
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔍 AuthProvider: Getting session...");
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Session timeout")), 10000); // 10 second timeout
        });

        const sessionPromise = supabase.auth.getSession();

        const result = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<typeof sessionPromise>;
        
        const {
          data: { session: currentSession },
          error,
        } = result;
        
        if (error) {
          console.error("❌ AuthProvider: Error getting session:", error);
        }

        if (!mounted) {
          console.log("⚠️ AuthProvider: Component unmounted, skipping state update");
          return;
        }

        console.log("✅ AuthProvider: Session retrieved:", {
          hasSession: !!currentSession,
          userEmail: currentSession?.user?.email,
        });

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          console.log("👤 AuthProvider: User set:", currentSession.user.email);
          
          // Ensure user profile exists (non-blocking)
          ensureUserProfile(currentSession.user).catch(err => 
            console.error("Profile creation error:", err)
          );
        } else {
          console.log("👻 AuthProvider: No session found");
        }
      } catch (error) {
        console.error("❌ AuthProvider: Error initializing auth:", error);
        // Still set loading to false even on error
      } finally {
        if (mounted) {
          console.log("✅ AuthProvider: Loading complete");
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    console.log("👂 AuthProvider: Setting up auth listener...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("🔔 AuthProvider: Auth state changed:", {
          event,
          userEmail: newSession?.user?.email,
          hasSession: !!newSession,
        });
        
        setSession(newSession ?? null);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          ensureUserProfile(newSession.user).catch(err => 
            console.error("Profile creation error:", err)
          );
        }

        if (event === 'SIGNED_OUT') {
          console.log("👋 AuthProvider: User signed out");
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => {
      console.log("🧹 AuthProvider: Cleaning up...");
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const ensureUserProfile = async (currentUser: User) => {
    try {
      console.log("👤 AuthProvider: Ensuring profile for:", currentUser.email);
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("❌ AuthProvider: Error checking profile:", fetchError);
        return;
      }

      // Create profile if it doesn't exist
      if (!existingProfile) {
        console.log("➕ AuthProvider: Creating new profile...");
        
        const newProfile = {
          id: currentUser.id,
          email: currentUser.email ?? null,
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            null,
          weight: null,
          height: null,
          goal: null,
          streak: 0,
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert(newProfile);

        if (insertError) {
          console.error("❌ AuthProvider: Error creating profile:", insertError);
        } else {
          console.log("✅ AuthProvider: Profile created for:", currentUser.email);
        }
      } else {
        console.log("✅ AuthProvider: Profile already exists");
      }
    } catch (error) {
      console.error("❌ AuthProvider: Error in ensureUserProfile:", error);
    }
  };

  const signOut = async () => {
    try {
      console.log("👋 AuthProvider: Signing out...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log("✅ AuthProvider: Sign out complete");
    } catch (error) {
      console.error("❌ AuthProvider: Error signing out:", error);
    }
  };

  console.log("📊 AuthProvider: Render state:", { 
    hasUser: !!user, 
    loading,
    userEmail: user?.email 
  });

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};