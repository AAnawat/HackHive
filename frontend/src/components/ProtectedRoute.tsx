import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  message?: string;
}

export default function ProtectedRoute({ children, message }: ProtectedRouteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Store the current location to redirect back after login
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      // Redirect to login
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Show loading or nothing while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-neutral-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

