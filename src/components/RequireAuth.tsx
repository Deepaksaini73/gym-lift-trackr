import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

const RequireAuth: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("🔒 RequireAuth:", { 
    loading, 
    hasUser: !!user, 
    userEmail: user?.email,
    path: location.pathname 
  });

  if (loading) {
    console.log("⏳ RequireAuth: Still loading...");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("🚫 RequireAuth: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ RequireAuth: User authenticated, rendering outlet");
  return <Outlet />;
};

export default RequireAuth;