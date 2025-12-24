/**
 * Scopes and RBAC definitions for NDJOBI platform
 */

import { ModuleName } from '@/types/comms';

// Module-specific scopes
export const MODULE_SCOPES = {
  icom: {
    read: 'icom:read',
    write: 'icom:write',
    all: 'icom:*',
    // Feature-level scopes for iCom
    chat: {
      read: 'icom:chat:read',
      write: 'icom:chat:write',
      all: 'icom:chat:*',
    },
    call: {
      use: 'icom:call:use',
    },
    meeting: {
      use: 'icom:meeting:use',
    },
    contact: {
      read: 'icom:contact:read',
    },
  },
  iboite: {
    read: 'iboite:read',
    write: 'iboite:write',
    all: 'iboite:*',
  },
  iasted: {
    chat: 'iasted:chat',
    summarize: 'iasted:summarize',
    all: 'iasted:*',
  },
  icorrespondance: {
    read: 'icorrespondance:read',
    write: 'icorrespondance:write',
    approve: 'icorrespondance:approve',
    all: 'icorrespondance:*',
  },
} as const;

// iCom feature scope requirements
export const ICOM_FEATURE_SCOPES = {
  chat: ['icom:chat:read', 'icom:chat:write', 'icom:chat:*', 'icom:*'],
  call: ['icom:call:use', 'icom:*'],
  meeting: ['icom:meeting:use', 'icom:*'],
  contact: ['icom:contact:read', 'icom:*'],
} as const;

/**
 * Check if user has scope for a specific iCom feature
 */
export function hasIcomFeatureScope(userScopes: string[], feature: 'chat' | 'call' | 'meeting' | 'contact'): boolean {
  const requiredScopes = ICOM_FEATURE_SCOPES[feature];
  return requiredScopes.some(scope => hasScope(userScopes, scope));
}

// Admin scopes
export const ADMIN_SCOPES = {
  platform: 'platform:*',
  tenant: 'tenant:*',
  registry: 'registry:*',
  networks: 'networks:*',
  modules: 'modules:*',
  audit: {
    read: 'audit:read',
    write: 'audit:write',
    all: 'audit:*',
  },
  apps: {
    read: 'apps:read',
    write: 'apps:write',
    all: 'apps:*',
  },
} as const;

// Scope patterns for matching
type ScopeAction = 'read' | 'write' | 'approve' | 'chat' | 'summarize' | '*';

export interface ScopeCheck {
  module: string;
  action: ScopeAction;
}

/**
 * Check if a list of scopes includes the required scope
 */
export function hasScope(userScopes: string[], requiredScope: string): boolean {
  // Direct match
  if (userScopes.includes(requiredScope)) {
    return true;
  }
  
  // Wildcard match (e.g., 'icom:*' matches 'icom:read')
  const [resource, action] = requiredScope.split(':');
  if (action && userScopes.includes(`${resource}:*`)) {
    return true;
  }
  
  // Global admin wildcard
  if (userScopes.includes('*')) {
    return true;
  }
  
  return false;
}

/**
 * Check if user has all required scopes
 */
export function hasAllScopes(userScopes: string[], requiredScopes: string[]): boolean {
  return requiredScopes.every(scope => hasScope(userScopes, scope));
}

/**
 * Check if user has any of the required scopes
 */
export function hasAnyScope(userScopes: string[], requiredScopes: string[]): boolean {
  return requiredScopes.some(scope => hasScope(userScopes, scope));
}

/**
 * Get missing scopes
 */
export function getMissingScopes(userScopes: string[], requiredScopes: string[]): string[] {
  return requiredScopes.filter(scope => !hasScope(userScopes, scope));
}

/**
 * Check module access based on scopes
 */
export function canAccessModule(userScopes: string[], moduleName: ModuleName): boolean {
  const moduleScopes = MODULE_SCOPES[moduleName];
  if (!moduleScopes) return false;
  
  // Check for any access (read at minimum)
  const readScope = 'read' in moduleScopes ? moduleScopes.read : null;
  const allScope = moduleScopes.all;
  
  if (readScope && hasScope(userScopes, readScope)) return true;
  if (hasScope(userScopes, allScope)) return true;
  
  // Special case for iasted which has 'chat' instead of 'read'
  if (moduleName === 'iasted') {
    return hasScope(userScopes, MODULE_SCOPES.iasted.chat);
  }
  
  return false;
}

/**
 * Get required scopes for a module action
 */
export function getRequiredScopes(moduleName: ModuleName, action: ScopeAction): string[] {
  const moduleScopes = MODULE_SCOPES[moduleName];
  if (!moduleScopes) return [];
  
  if (action === '*') {
    return [moduleScopes.all];
  }
  
  const scopeKey = action as keyof typeof moduleScopes;
  if (scopeKey in moduleScopes) {
    return [moduleScopes[scopeKey] as string];
  }
  
  return [];
}

/**
 * Check if user is platform admin
 */
export function isPlatformAdmin(scopes: string[]): boolean {
  return hasScope(scopes, ADMIN_SCOPES.platform);
}

/**
 * Check if user is tenant admin
 */
export function isTenantAdmin(scopes: string[]): boolean {
  return hasScope(scopes, ADMIN_SCOPES.tenant);
}

/**
 * Format scopes for display
 */
export function formatScope(scope: string): { resource: string; action: string } {
  const [resource, action = '*'] = scope.split(':');
  return { resource, action };
}

/**
 * Group scopes by resource
 */
export function groupScopes(scopes: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  for (const scope of scopes) {
    const { resource, action } = formatScope(scope);
    if (!grouped[resource]) {
      grouped[resource] = [];
    }
    grouped[resource].push(action);
  }
  
  return grouped;
}

/**
 * Default scopes for each mode
 */
export const DEFAULT_SCOPES = {
  platform_admin: [
    'platform:*',
    'registry:*',
    'networks:*',
    'modules:*',
    'audit:read',
    'icom:*',
    'iboite:*',
    'iasted:*',
    'icorrespondance:*',
  ],
  tenant_admin: [
    'tenant:*',
    'apps:read',
    'modules:write',
    'audit:read',
    'icom:*',
    'iboite:*',
    'iasted:*',
  ],
  service_gov: [
    'icom:chat:*',
    'icom:call:use',
    'icom:meeting:use',
    'icom:contact:read',
    'iboite:read',
    'iboite:write',
    'iasted:chat',
    'iasted:summarize',
    'icorrespondance:read',
    'icorrespondance:write',
    'icorrespondance:approve',
  ],
  service_commercial: [
    'icom:chat:*',
    'icom:call:use',
    'icom:meeting:use',
    'icom:contact:read',
    'iboite:read',
    'iboite:write',
    'iasted:chat',
    'iasted:summarize',
  ],
  // iCom à la carte examples
  service_call_contact_only: [
    'icom:call:use',
    'icom:contact:read',
    'iboite:read',
    'iboite:write',
    'iasted:chat',
  ],
  delegated_chat_contact: [
    'icom:chat:*',
    'icom:contact:read',
    'iboite:read',
    'iboite:write',
    'iasted:chat',
  ],
  delegated_citizen: [
    'icom:chat:*',
    'icom:contact:read',
    'iboite:read',
    'iboite:write',
    'iasted:chat',
  ],
  delegated_gov_agent: [
    'icom:*',
    'iboite:*',
    'iasted:*',
    'icorrespondance:read',
    'icorrespondance:write',
  ],
} as const;
