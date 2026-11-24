import type { ReactNode } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth, type AccountRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: AccountRole[];
  children: ReactNode;
}

export function getDashboardPathForRole(role: AccountRole): string {
  if (role === 'ADMIN') return '/dashboard/admin';
  if (role === 'JOURNALIST') return '/dashboard/journalist';
  return '/dashboard/user';
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-20">
        <div className="h-32 bg-[#FBF6E8] border border-[#EADEC8] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-20">
        <div className="bg-[#FFFFFF] border border-[#C92332]/40 rounded-xl p-8 text-center shadow-sm">
          <ShieldAlert className="w-10 h-10 text-[#C92332] mx-auto mb-3" />
          <h1 className="font-serif text-2xl text-[#292522]">Access Restricted</h1>
          <p className="mt-2 text-sm text-[#77716B]">
            Your account role ({user.role}) does not have permission to view this workspace.
          </p>
          <div className="mt-6">
            <Link
              to={getDashboardPathForRole(user.role)}
              className="inline-flex items-center px-5 py-2.5 text-xs font-semibold bg-[#C92332] text-[#FFFFFF] rounded-md hover:bg-[#941D2A]"
            >
              Go to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
