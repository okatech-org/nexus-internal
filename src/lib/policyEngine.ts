/**
 * Policy Engine for NDJOBI Platform
 * Manages cross-realm communication rules and feature-level access control
 */

import { Realm, NetworkType, IcomFeatureName } from '@/types/comms';
import { hasIcomFeatureScope, hasScope } from './auth/scopes';

// Communication channel types
export type CommunicationChannel = 
  | 'icom.chat' 
  | 'icom.call' 
  | 'icom.meeting' 
  | 'icom.contact'
  | 'iboite'
  | 'icorrespondance';

// Cross-realm policy matrix
interface CrossRealmPolicy {
  chat: boolean;
  call: boolean;
  meeting: boolean;
  contact: boolean;
}

// Default cross-realm policies
const CROSS_REALM_POLICIES: Record<Realm, Record<Realm, CrossRealmPolicy>> = {
  citizen: {
    citizen: { chat: true, call: true, meeting: true, contact: true },
    government: { chat: true, call: false, meeting: false, contact: true },
    business: { chat: true, call: false, meeting: false, contact: true },
  },
  government: {
    citizen: { chat: true, call: false, meeting: false, contact: true },
    government: { chat: true, call: true, meeting: true, contact: true },
    business: { chat: true, call: true, meeting: false, contact: true },
  },
  business: {
    citizen: { chat: true, call: false, meeting: false, contact: true },
    government: { chat: true, call: true, meeting: false, contact: true },
    business: { chat: true, call: true, meeting: true, contact: true },
  },
};

// Network type policies
const NETWORK_POLICIES: Record<NetworkType, Partial<Record<CommunicationChannel, boolean>>> = {
  government: {
    'icom.chat': true,
    'icom.call': true,
    'icom.meeting': true,
    'icom.contact': true,
    'iboite': true,
    'icorrespondance': true,
  },
  commercial: {
    'icom.chat': true,
    'icom.call': true,
    'icom.meeting': true,
    'icom.contact': true,
    'iboite': true,
    'icorrespondance': false, // Gov only
  },
};

export interface PolicyContext {
  senderRealm: Realm;
  receiverRealm: Realm;
  networkType: NetworkType;
  userScopes: string[];
  channel: CommunicationChannel;
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
  suggestedAlternative?: CommunicationChannel;
}

/**
 * Check if communication is allowed between two realms on a specific channel
 */
export function canCommunicate(context: PolicyContext): PolicyResult {
  const { senderRealm, receiverRealm, networkType, userScopes, channel } = context;

  // 1. Check network policy first
  if (!NETWORK_POLICIES[networkType][channel]) {
    return {
      allowed: false,
      reason: `Channel ${channel} is not available on ${networkType} networks`,
    };
  }

  // 2. Check feature-specific scope
  if (channel.startsWith('icom.')) {
    const feature = channel.replace('icom.', '') as IcomFeatureName;
    if (!hasIcomFeatureScope(userScopes, feature)) {
      return {
        allowed: false,
        reason: `Missing scope for ${channel}`,
      };
    }

    // 3. Check cross-realm policy for iCom features
    const crossRealmPolicy = CROSS_REALM_POLICIES[senderRealm]?.[receiverRealm];
    if (!crossRealmPolicy) {
      return {
        allowed: false,
        reason: `Unknown realm combination: ${senderRealm} -> ${receiverRealm}`,
      };
    }

    if (!crossRealmPolicy[feature]) {
      // Find an alternative if available
      const alternatives: IcomFeatureName[] = ['chat', 'contact'];
      const suggestedAlt = alternatives.find(alt => 
        crossRealmPolicy[alt] && hasIcomFeatureScope(userScopes, alt)
      );

      return {
        allowed: false,
        reason: `${feature} is not allowed from ${senderRealm} to ${receiverRealm}`,
        suggestedAlternative: suggestedAlt ? `icom.${suggestedAlt}` as CommunicationChannel : undefined,
      };
    }
  }

  // 4. Check iBoîte scope
  if (channel === 'iboite') {
    if (!hasScope(userScopes, 'iboite:read') && !hasScope(userScopes, 'iboite:*')) {
      return {
        allowed: false,
        reason: 'Missing scope for iBoîte',
      };
    }
  }

  // 5. Check iCorrespondance scope and network
  if (channel === 'icorrespondance') {
    if (networkType !== 'government') {
      return {
        allowed: false,
        reason: 'iCorrespondance is only available on government networks',
      };
    }
    if (!hasScope(userScopes, 'icorrespondance:read') && !hasScope(userScopes, 'icorrespondance:*')) {
      return {
        allowed: false,
        reason: 'Missing scope for iCorrespondance',
      };
    }
  }

  return { allowed: true };
}

/**
 * Get all available channels for a given context
 */
export function getAvailableChannels(
  senderRealm: Realm,
  receiverRealm: Realm,
  networkType: NetworkType,
  userScopes: string[]
): CommunicationChannel[] {
  const allChannels: CommunicationChannel[] = [
    'icom.chat',
    'icom.call',
    'icom.meeting',
    'icom.contact',
    'iboite',
    'icorrespondance',
  ];

  return allChannels.filter(channel => {
    const result = canCommunicate({
      senderRealm,
      receiverRealm,
      networkType,
      userScopes,
      channel,
    });
    return result.allowed;
  });
}

/**
 * Check if a specific iCom feature is allowed
 */
export function isIcomFeatureAllowed(
  feature: IcomFeatureName,
  senderRealm: Realm,
  receiverRealm: Realm,
  userScopes: string[]
): boolean {
  // Check scope first
  if (!hasIcomFeatureScope(userScopes, feature)) {
    return false;
  }

  // Check cross-realm policy
  const policy = CROSS_REALM_POLICIES[senderRealm]?.[receiverRealm];
  return policy?.[feature] ?? false;
}

/**
 * Get cross-realm policy for display
 */
export function getCrossRealmPolicy(
  senderRealm: Realm,
  receiverRealm: Realm
): CrossRealmPolicy | null {
  return CROSS_REALM_POLICIES[senderRealm]?.[receiverRealm] ?? null;
}

/**
 * Format policy result for user display
 */
export function formatPolicyReason(result: PolicyResult): string {
  if (result.allowed) return 'Autorisé';
  
  let message = result.reason || 'Non autorisé';
  
  if (result.suggestedAlternative) {
    const altLabel = result.suggestedAlternative
      .replace('icom.', 'i')
      .replace('chat', 'Chat')
      .replace('call', 'Appel')
      .replace('meeting', 'Réunion')
      .replace('contact', 'Contact');
    message += `. Alternative suggérée: ${altLabel}`;
  }
  
  return message;
}
