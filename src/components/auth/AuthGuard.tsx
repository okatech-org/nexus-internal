import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, isPublicRoute } from '@/contexts/AuthContext';
import { hasScope } from '@/lib/auth/scopes';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredScopes?: string[];
  requiredMode?: 'platform_admin' | 'tenant_admin' | 'service' | 'delegated';
  fallbackPath?: string;
}

export function AuthGuard({ 
  children, 
  requiredScopes = [], 
  requiredMode,
  fallbackPath = '/login'
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, payload } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (isLoading) return;
    
    // Skip for public routes
    if (isPublicRoute(location.pathname)) return;
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate(fallbackPath, { 
        replace: true, 
        state: { from: location.pathname } 
      });
      return;
    }
    
    // Check required mode
    if (requiredMode && payload?.mode !== requiredMode) {
      navigate('/forbidden', { replace: true });
      return;
    }
    
    // Check required scopes
    if (requiredScopes.length > 0 && payload?.scopes) {
      const hasAllRequired = requiredScopes.every(scope => 
        hasScope(payload.scopes, scope)
      );
      
      if (!hasAllRequired) {
        navigate('/forbidden', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, payload, location.pathname, navigate, requiredScopes, requiredMode, fallbackPath]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }
  
  // For public routes, always render children
  if (isPublicRoute(location.pathname)) {
    return <>{children}</>;
  }
  
  // For protected routes, only render if authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * Higher-order component for scope protection
 */
export function withScopes<P extends object>(
  Component: React.ComponentType<P>,
  requiredScopes: string[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthGuard requiredScopes={requiredScopes}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
