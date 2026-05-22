import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface RoleRouteProps {
  children: ReactNode;
  allow: UserRole[];
}

/** Gate a route by role. Unauthenticated → /, wrong role → /dashboard. */
const RoleRoute = ({ children, allow }: RoleRouteProps) => {
  const { isAuthenticated, role, authReady, loading } = useAuth();

  if (!authReady || loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!role || !allow.includes(role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default RoleRoute;
