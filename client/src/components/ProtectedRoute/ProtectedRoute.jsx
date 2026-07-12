import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Spinner from "../Spinner/Spinner.jsx";

/** Route guard: shows a spinner while auth resolves, redirects unauthenticated users to /login, else renders. */
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <Spinner label="Checking your session..." />;
  if (!session) return <Navigate to="/login" replace />;

  return children ?? <Outlet />;
}

export default ProtectedRoute;
