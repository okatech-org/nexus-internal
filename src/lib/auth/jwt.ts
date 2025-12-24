/**
 * JWT HS256 Implementation for Demo Mode
 * Uses Web Crypto API for HMAC-SHA256 signing
 * 
 * NOTE: In production, JWT signing should be done server-side with JWKS/OIDC
 */

// Get demo secret from env or use fallback
const DEMO_SECRET = import.meta.env.VITE_DEMO_JWT_SECRET || 'ndjobi-dev-secret-change-me';

export interface JwtHeader {
  alg: 'HS256';
  typ: 'JWT';
  kid: string;
}

export interface JwtPayload {
  // Standard claims
  iss: string;           // Issuer
  aud: string;           // Audience
  sub: string;           // Subject (actor_id or app_id)
  iat: number;           // Issued at
  nbf: number;           // Not before
  exp: number;           // Expiration
  jti: string;           // JWT ID (unique)
  
  // Custom claims
  tenant_id: string;
  realm: string;
  app_id: string;
  network_id: string;
  network_type: string;
  mode: string;
  scopes: string[];
  actor_id?: string;
}

export interface VerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  header?: JwtHeader;
  error?: string;
}

/**
 * Base64 URL encode
 */
export function base64urlEncode(data: string | Uint8Array): string {
  let input: string;
  if (typeof data === 'string') {
    input = data;
  } else {
    input = String.fromCharCode(...data);
  }
  return btoa(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64 URL decode
 */
export function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padding);
  return atob(base64);
}

/**
 * HMAC-SHA256 signature using Web Crypto API
 */
async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return new Uint8Array(signature);
}

/**
 * Sign a JWT with HS256
 */
export async function signJwtHS256(
  payload: Omit<JwtPayload, 'iat' | 'nbf' | 'exp' | 'jti'> & { 
    iat?: number; 
    nbf?: number; 
    exp?: number; 
    jti?: string; 
  },
  secret: string = DEMO_SECRET,
  header?: Partial<JwtHeader>
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const fullHeader: JwtHeader = {
    alg: 'HS256',
    typ: 'JWT',
    kid: header?.kid || 'demo-1',
  };
  
  const fullPayload: JwtPayload = {
    ...payload,
    iat: payload.iat ?? now,
    nbf: payload.nbf ?? (now - 5), // Valid 5 seconds before
    exp: payload.exp ?? (now + 7200), // 2 hours
    jti: payload.jti ?? generateJti(),
  };
  
  const encodedHeader = base64urlEncode(JSON.stringify(fullHeader));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  const signature = await hmacSha256(secret, signingInput);
  const encodedSignature = base64urlEncode(signature);
  
  return `${signingInput}.${encodedSignature}`;
}

/**
 * Verify a JWT with HS256
 */
export async function verifyJwtHS256(
  token: string,
  secret: string = DEMO_SECRET
): Promise<VerifyResult> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'INVALID_FORMAT' };
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Parse header and payload
    let header: JwtHeader;
    let payload: JwtPayload;
    
    try {
      header = JSON.parse(base64urlDecode(encodedHeader));
      payload = JSON.parse(base64urlDecode(encodedPayload));
    } catch {
      return { valid: false, error: 'INVALID_JSON' };
    }
    
    // Verify algorithm
    if (header.alg !== 'HS256') {
      return { valid: false, error: 'UNSUPPORTED_ALGORITHM', header };
    }
    
    // Verify signature
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await hmacSha256(secret, signingInput);
    const actualSignature = Uint8Array.from(base64urlDecode(encodedSignature), c => c.charCodeAt(0));
    
    if (!timingSafeEqual(expectedSignature, actualSignature)) {
      return { valid: false, error: 'INVALID_SIGNATURE', header };
    }
    
    // Verify claims
    const now = Math.floor(Date.now() / 1000);
    
    // Check issuer
    if (payload.iss !== 'okatech-demo') {
      return { valid: false, error: 'INVALID_ISSUER', header, payload };
    }
    
    // Check audience
    if (payload.aud !== 'comms-sandbox') {
      return { valid: false, error: 'INVALID_AUDIENCE', header, payload };
    }
    
    // Check expiration
    if (payload.exp && now > payload.exp) {
      return { valid: false, error: 'TOKEN_EXPIRED', header, payload };
    }
    
    // Check not before
    if (payload.nbf && now < payload.nbf) {
      return { valid: false, error: 'TOKEN_NOT_YET_VALID', header, payload };
    }
    
    return { valid: true, header, payload };
  } catch (error) {
    return { valid: false, error: 'VERIFICATION_ERROR' };
  }
}

/**
 * Decode JWT without verification (for debugging)
 */
export function decodeJwt(token: string): { header: JwtHeader | null; payload: JwtPayload | null } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { header: null, payload: null };
    }
    
    const header = JSON.parse(base64urlDecode(parts[0]));
    const payload = JSON.parse(base64urlDecode(parts[1]));
    
    return { header, payload };
  } catch {
    return { header: null, payload: null };
  }
}

/**
 * Generate unique JWT ID
 */
function generateJti(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Timing-safe comparison to prevent timing attacks
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}
