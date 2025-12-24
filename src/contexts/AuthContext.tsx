import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DemoAccount } from '@/types/demo-accounts';
import { JwtPayload, decodeJwt } from '@/lib/auth/jwt';
import { 
  loginDemo, 
  logout as authLogout, 
  getSession, 
  refreshSession,
  revokeCurrentToken,
  getRevocations,
  AuthSession,
} from '@/lib/auth/authService';
import { hasScope, isPlatformAdmin, isTenantAdmin } from '@/lib/auth/scopes';
import demoAccountsData from '@/mocks/demo-accounts.mock.json';

const demoAccounts: DemoAccount[] = demoAccountsData as DemoAccount[];

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  session: AuthSession | null;
  payload: JwtPayload | null;
  activeProfile: DemoAccount | null;
  expiresIn: number | null;
  
  // Auth actions
  loginWithDemo: (profile: DemoAccount) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<boolean>;
  revokeToken: () => Promise<void>;
  
  // Scope checks
  hasScope: (scope: string) => boolean;
  hasAllScopes: (scopes: string[]) => boolean;
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
  
  // Demo accounts
  demoAccounts: DemoAccount[];
  
  // Debug
  getRevocations: () => string[];
  decodedToken: { header: any; payload: any } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/demo-accounts'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [activeProfile, setActiveProfile] = useState<DemoAccount | null>(null);
  
  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const validation = await getSession();
      
      if (validation.valid && validation.session && validation.payload) {
        setIsAuthenticated(true);
        setSession(validation.session);
        setPayload(validation.payload);
        setExpiresIn(validation.expiresIn || null);
        
        // Find matching profile
        const profile = demoAccounts.find(p => p.id === validation.session?.profileId);
        setActiveProfile(profile || null);
      } else {
        setIsAuthenticated(false);
        setSession(null);
        setPayload(null);
        setExpiresIn(null);
        setActiveProfile(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  // Auto-refresh token when close to expiry
  useEffect(() => {
    if (!isAuthenticated || !expiresIn) return;
    
    // Refresh when less than 10 minutes remaining
    if (expiresIn <= 600) {
      refresh();
    }
    
    // Set up refresh timer
    const refreshTime = Math.max((expiresIn - 600) * 1000, 0);
    const timer = setTimeout(() => {
      refresh();
    }, refreshTime);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, expiresIn]);
  
  const loginWithDemo = useCallback(async (profile: DemoAccount): Promise<boolean> => {
    try {
      const result = await loginDemo(profile);
      
      if (result.success && result.session) {
        setIsAuthenticated(true);
        setSession(result.session);
        setPayload(result.session.payload);
        setActiveProfile(profile);
        
        // Calculate expires in
        const now = Math.floor(Date.now() / 1000);
        const exp = result.session.payload.exp;
        setExpiresIn(exp - now);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);
  
  const logout = useCallback(() => {
    authLogout();
    setIsAuthenticated(false);
    setSession(null);
    setPayload(null);
    setExpiresIn(null);
    setActiveProfile(null);
  }, []);
  
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const result = await refreshSession();
      
      if (result.success && result.session) {
        setSession(result.session);
        setPayload(result.session.payload);
        
        const now = Math.floor(Date.now() / 1000);
        const exp = result.session.payload.exp;
        setExpiresIn(exp - now);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh error:', error);
      return false;
    }
  }, []);
  
  const revokeToken = useCallback(async () => {
    await revokeCurrentToken();
    logout();
  }, [logout]);
  
  const checkScope = useCallback((scope: string): boolean => {
    if (!payload?.scopes) return false;
    return hasScope(payload.scopes, scope);
  }, [payload]);
  
  const checkAllScopes = useCallback((scopes: string[]): boolean => {
    if (!payload?.scopes) return false;
    return scopes.every(scope => hasScope(payload.scopes, scope));
  }, [payload]);
  
  const decodedToken = session?.token ? decodeJwt(session.token) : null;
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        session,
        payload,
        activeProfile,
        expiresIn,
        loginWithDemo,
        logout,
        refresh,
        revokeToken,
        hasScope: checkScope,
        hasAllScopes: checkAllScopes,
        isPlatformAdmin: payload?.scopes ? isPlatformAdmin(payload.scopes) : false,
        isTenantAdmin: payload?.scopes ? isTenantAdmin(payload.scopes) : false,
        demoAccounts,
        getRevocations,
        decodedToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Check if route is public
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}
