import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user, loading } = useAuth(); const location = useLocation();
  if (loading) return <div className="route-loading"><LoaderCircle className="spin" /> Validando sua sessão...</div>;
  if (!user) return <Navigate to={`/entrar?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/conta" replace />;
  return <Outlet />;
}
