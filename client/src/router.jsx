import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout/AppLayout.jsx';
import { NotFound } from './components/ErrorPage/ErrorPage.jsx';

// Lazy-loaded page components (Wave 2 creates these files at the exact paths below).
const Login = lazy(() => import('./pages/Login/Login.jsx'));
const Register = lazy(() => import('./pages/Register/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const PracticeSetup = lazy(() => import('./pages/PracticeSetup/PracticeSetup.jsx'));
const Conversation = lazy(() => import('./pages/Conversation/Conversation.jsx'));
const Evaluation = lazy(() => import('./pages/Evaluation/Evaluation.jsx'));

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/practice/new', element: <PracticeSetup /> },
          { path: '/session/:id', element: <Conversation /> },
          { path: '/session/:id/evaluation', element: <Evaluation /> }
        ]
      }
    ]
  },
  { path: '*', element: <NotFound /> }
]);

export default router;
