import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthChange } from '../firebase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires authentication, false = requires no authentication
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Show loading spinner while checking auth
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <span className="text-cyan-400 font-bold text-xl tracking-wider">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // User needs to be authenticated but isn't
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    // User shouldn't be authenticated but is (e.g., trying to access login page while logged in)
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
}
