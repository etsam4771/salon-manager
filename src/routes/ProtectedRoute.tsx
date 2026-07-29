import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<User["role"]>;
}

/**
 * Guards a subtree behind authentication (and optionally a role check).
 * Previously nothing gated /admin/* at all — any visitor could open
 * /admin directly with no session.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-light">
        <div className="flex flex-col items-center gap-3 text-ink/50">
          <div className="w-8 h-8 rounded-full border-2 border-forest/30 border-t-forest animate-spin" />
          <span className="text-sm font-mono">Checking your session…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
