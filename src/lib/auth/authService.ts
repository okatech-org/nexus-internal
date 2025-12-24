/**
 * Authentication Service for Demo Mode
 * Manages JWT sessions with signing, verification, refresh, and revocation
 */

import { signJwtHS256, verifyJwtHS256, decodeJwt, JwtPayload } from './jwt';
import { hasScope, hasAllScopes, getMissingScopes } from './scopes';
import { DemoAccount } from '@/types/demo-accounts';

// Storage keys
const STORAGE_KEYS = {
  session: 'comms.session',
  revokedJtis: 'comms.revokedJtis',
  profile: 'comms.activeProfile',
};

export interface AuthSession {
  token: string;
  profileId: string;
  createdAt: number;
  payload: JwtPayload;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

export interface SessionValidation {
  valid: boolean;
  session?: AuthSession;
  payload?: JwtPayload;
  error?: string;
  expiresIn?: number;
}

/**
 * Get revoked JTIs from storage
 */
function getRevokedJtis(): string[] {
  const stored = localStorage.getItem(STORAGE_KEYS.revokedJtis);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Add JTI to revoked list
 */
function revokeJti(jti: string): void {
  const revoked = getRevokedJtis();
  if (!revoked.includes(jti)) {
    revoked.push(jti);
    // Keep only last 100 revoked JTIs
    const trimmed = revoked.slice(-100);
    localStorage.setItem(STORAGE_KEYS.revokedJtis, JSON.stringify(trimmed));
  }
}

/**
 * Check if JTI is revoked
 */
function isJtiRevoked(jti: string): boolean {
  return getRevokedJtis().includes(jti);
}

/**
 * Login with demo account profile
 */
export async function loginDemo(profile: DemoAccount): Promise<AuthResult> {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iss: 'okatech-demo',
      aud: 'comms-sandbox',
      sub: profile.actor_id || profile.app_id,
      iat: now,
      nbf: now - 5,
      exp: now + 7200, // 2 hours
      tenant_id: profile.tenant_id,
      realm: profile.realm,
      app_id: profile.app_id,
      network_id: profile.network || '',
      network_type: profile.network_type,
      mode: profile.mode,
      scopes: profile.permissions,
      actor_id: profile.actor_id || undefined,
    };
    
    const token = await signJwtHS256(payload);
    
    const session: AuthSession = {
      token,
      profileId: profile.id,
      createdAt: Date.now(),
      payload: {
        ...payload,
        jti: decodeJwt(token).payload?.jti || '',
      },
    };
    
    // Store session
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.profile, profile.id);
    
    return { success: true, session };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create session' 
    };
  }
}

/**
 * Get current session with validation
 */
export async function getSession(): Promise<SessionValidation> {
  const stored = localStorage.getItem(STORAGE_KEYS.session);
  if (!stored) {
    return { valid: false, error: 'NO_SESSION' };
  }
  
  let session: AuthSession;
  try {
    session = JSON.parse(stored);
  } catch {
    return { valid: false, error: 'INVALID_SESSION_DATA' };
  }
  
  // Verify token
  const result = await verifyJwtHS256(session.token);
  
  if (!result.valid) {
    // Auto logout on invalid token
    logout();
    return { valid: false, error: result.error || 'INVALID_TOKEN' };
  }
  
  // Check if JTI is revoked
  if (result.payload?.jti && isJtiRevoked(result.payload.jti)) {
    logout();
    return { valid: false, error: 'TOKEN_REVOKED' };
  }
  
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = result.payload?.exp ? result.payload.exp - now : 0;
  
  return { 
    valid: true, 
    session, 
    payload: result.payload,
    expiresIn,
  };
}

/**
 * Refresh session with new token
 */
export async function refreshSession(): Promise<AuthResult> {
  const validation = await getSession();
  
  if (!validation.valid || !validation.payload) {
    return { success: false, error: 'NO_VALID_SESSION' };
  }
  
  // Only refresh if expiring soon (< 10 minutes)
  if (validation.expiresIn && validation.expiresIn > 600) {
    return { 
      success: true, 
      session: validation.session,
    };
  }
  
  // Revoke old token
  if (validation.payload.jti) {
    revokeJti(validation.payload.jti);
  }
  
  // Create new token with same claims but new jti and exp
  const now = Math.floor(Date.now() / 1000);
  const newPayload = {
    ...validation.payload,
    iat: now,
    nbf: now - 5,
    exp: now + 7200,
    jti: undefined, // Will be regenerated
  };
  
  const token = await signJwtHS256(newPayload);
  
  const session: AuthSession = {
    token,
    profileId: validation.session?.profileId || '',
    createdAt: Date.now(),
    payload: {
      ...newPayload,
      jti: decodeJwt(token).payload?.jti || '',
    },
  };
  
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  
  return { success: true, session };
}

/**
 * Logout and revoke current token
 */
export function logout(): void {
  const stored = localStorage.getItem(STORAGE_KEYS.session);
  if (stored) {
    try {
      const session: AuthSession = JSON.parse(stored);
      const decoded = decodeJwt(session.token);
      if (decoded.payload?.jti) {
        revokeJti(decoded.payload.jti);
      }
    } catch {
      // Ignore parse errors
    }
  }
  
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem(STORAGE_KEYS.profile);
  localStorage.removeItem('comms.demoProfile');
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const validation = await getSession();
  return validation.valid;
}

/**
 * Require specific scopes - throws if missing
 */
export async function requireScopes(requiredScopes: string[]): Promise<void> {
  const validation = await getSession();
  
  if (!validation.valid || !validation.payload) {
    throw { code: 'AUTH_REQUIRED', message: 'Authentication required' };
  }
  
  const userScopes = validation.payload.scopes || [];
  const missing = getMissingScopes(userScopes, requiredScopes);
  
  if (missing.length > 0) {
    throw { 
      code: 'FORBIDDEN', 
      message: 'Missing required permissions',
      missingScopes: missing,
    };
  }
}

/**
 * Check scopes without throwing
 */
export async function checkScopes(requiredScopes: string[]): Promise<{
  authorized: boolean;
  missingScopes: string[];
}> {
  const validation = await getSession();
  
  if (!validation.valid || !validation.payload) {
    return { authorized: false, missingScopes: requiredScopes };
  }
  
  const userScopes = validation.payload.scopes || [];
  const missing = getMissingScopes(userScopes, requiredScopes);
  
  return { 
    authorized: missing.length === 0, 
    missingScopes: missing 
  };
}

/**
 * Get API headers for authenticated requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const validation = await getSession();
  
  if (!validation.valid || !validation.session) {
    return {};
  }
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${validation.session.token}`,
    'X-App-Id': validation.payload?.app_id || '',
  };
  
  if (validation.payload?.actor_id) {
    headers['X-Actor-Id'] = validation.payload.actor_id;
  }
  
  return headers;
}

/**
 * Manually revoke current token (for testing)
 */
export async function revokeCurrentToken(): Promise<void> {
  const validation = await getSession();
  if (validation.valid && validation.payload?.jti) {
    revokeJti(validation.payload.jti);
    logout();
  }
}

/**
 * Get all revoked JTIs (for debugging)
 */
export function getRevocations(): string[] {
  return getRevokedJtis();
}

/**
 * Clear all revocations (for debugging)
 */
export function clearRevocations(): void {
  localStorage.removeItem(STORAGE_KEYS.revokedJtis);
}
