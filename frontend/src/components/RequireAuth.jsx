import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function RequireAuth({ needsOnboarding = true }) {
  const { user, profile, loading } = useAuth();
  const { pathname } = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />;
  const done = profile?.onboardingCompleted;
  if (needsOnboarding && !done) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
