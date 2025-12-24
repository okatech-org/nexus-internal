// NDJOBI Platform Types - App-Centric Architecture

export type Realm = 'citizen' | 'government' | 'business';

export type NetworkType = 'commercial' | 'government';

export type ModuleName = 'icom' | 'iboite' | 'iasted' | 'icorrespondance';

export type IdentityMode = 'service' | 'delegated';

export type DisabledReason = 
  | 'NOT_IN_GOV_NETWORK' 
  | 'REALM_NOT_GOV' 
  | 'MODULE_DISABLED' 
  | 'NOT_ENTITLED'
  | 'NETWORK_POLICY';

// Network - A collection of apps with shared policies
export interface Network {
  network_id: string;
  name: string;
  network_type: NetworkType;
  member_apps: string[];
  modules_policy: {
    icom: boolean;
    iboite: boolean;
    iasted: boolean;
    icorrespondance: boolean;
  };
}

// App - A registered application in the platform
export interface App {
  app_id: string;
  name: string;
  tenant_id: string;
  network_id: string;
  status: 'active' | 'inactive' | 'suspended';
  enabled_modules: {
    icom: boolean;
    iboite: boolean;
    iasted: boolean;
    icorrespondance: boolean;
  };
}

// Module configuration with effective status
export interface ModuleConfig {
  enabled: boolean;
  disabled_reason?: DisabledReason;
  realtime?: { sse_url: string };
  realm_required?: string;
}

export interface Capabilities {
  platform: string;
  version: string;
  tenant_id: string;
  app_id: string;
  network_id: string;
  network_type: NetworkType;
  modules: {
    icom: ModuleConfig;
    iboite: ModuleConfig;
    iasted: ModuleConfig;
    icorrespondance: ModuleConfig;
  };
}

// App Context (replaces user-centric DevContext)
export interface AppContext {
  app_id: string;
  tenant_id: string;
  network_id: string;
  network_type: NetworkType;
  mode: IdentityMode;
  // Service account is default - no actor needed
  // Delegated mode requires these:
  delegated_actor_id?: string;
  delegated_realm?: Realm;
}

// Legacy DevContext for backwards compatibility (will be removed)
export interface DevContext {
  actor_id: string;
  tenant_id: string;
  realm: Realm;
  scopes: string[];
}

// iCom Types
export interface Conversation {
  id: string;
  tenant_id: string;
  type: 'dm' | 'group';
  title: string;
  created_by: string;
  created_at: string;
  last_message?: Message;
  unread_count: number;
  members: ConversationMember[];
}

export interface ConversationMember {
  actor_id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  online?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
}

// iBoîte Types (Internal Inbox - no external email)
export interface Thread {
  id: string;
  tenant_id: string;
  subject: string;
  created_by: string;
  created_at: string;
  participants: ThreadParticipant[];
  messages: ThreadMessage[];
  is_archived: boolean;
  unread: boolean;
}

export interface ThreadParticipant {
  actor_id: string;
  name: string;
  avatar?: string;
}

export interface ThreadMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  status: 'delivered' | 'read';
}

// iAsted Types
export interface AstedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    conversation_id?: string;
    thread_id?: string;
    case_id?: string;
  };
}

export interface AstedSession {
  id: string;
  messages: AstedMessage[];
  created_at: string;
}
