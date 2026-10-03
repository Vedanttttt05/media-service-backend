import { Navigate, Outlet, useLocation } from "react-router";
import { PageLoader } from "../components/ui";
import { useAuth } from "./AuthContext";

/** Every backend route except login/register needs a session, so the whole app sits behind this. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

/** Login/register pages. Once signed in, sends the user back to where RequireAuth stopped them. */
export function GuestOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (loading) return <PageLoader />;
  if (user) return <Navigate to={from} replace />;
  return <Outlet />;
}
