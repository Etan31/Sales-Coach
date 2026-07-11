import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../Spinner/Spinner.jsx';
import { AuthError } from '../ErrorPage/ErrorPage.jsx';

/** Route guard: shows a spinner while auth resolves, an inline 401 when unauthenticated, else renders. */
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <Spinner label="Checking your session..." />;
  if (!session) return <AuthError code={401} />;

  return children ?? <Outlet />;
}

export default ProtectedRoute;
