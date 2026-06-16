import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

interface Props {
  roles?: string[];
}

export function ProtectedRoute({ roles }: Props) {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;

  return <Outlet />;
}
