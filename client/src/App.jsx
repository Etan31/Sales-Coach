import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RouteSkeleton } from './components/Skeleton/Skeleton.jsx';
import router from './router.jsx';

/** App root: error boundary -> auth context -> suspense-wrapped router. */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<RouteSkeleton />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
