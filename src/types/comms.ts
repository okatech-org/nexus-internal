// NDJOBI Platform Types

export type Realm = 'citizen' | 'government' | 'business';

export type ModuleName = 'icom' | 'iboite' | 'iasted' | 'icorrespondance';

export interface Capabilities {
  platform: string;
  version: string;
  tenant_id: string;
  app_id: string;
  modules: {
    icom: { enabled: boolean; realtime?: { sse_url: string } };
    iboite: { enabled: boolean };
    iasted: { enabled: boolean };
    icorrespondance: { enabled: boolean; realm_required?: string };
  };
}

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

// iBoîte Types
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
