import { ModuleName } from '@/types/comms';

// Shared platform store for multi-app simulation
export interface PlatformMessage {
  id: string;
  conversation_id: string;
  sender_app_id: string;
  sender_actor_id: string | null;
  content: string;
  created_at: string;
  tenant_id: string;
  network_id: string;
}

export interface PlatformConversation {
  id: string;
  tenant_id: string;
  network_id: string;
  participants: { app_id: string; actor_id: string | null }[];
  created_at: string;
  last_message_at: string;
}

export interface PlatformThread {
  id: string;
  subject: string;
  tenant_id: string;
  network_id: string;
  participants: { app_id: string; actor_id: string | null }[];
  created_at: string;
}

export interface PlatformThreadMessage {
  id: string;
  thread_id: string;
  sender_app_id: string;
  sender_actor_id: string | null;
  content: string;
  created_at: string;
  read_by: string[];
}

export interface PlatformStore {
  conversations: PlatformConversation[];
  messages: PlatformMessage[];
  threads: PlatformThread[];
  threadMessages: PlatformThreadMessage[];
}

// Global singleton store
let platformStore: PlatformStore = {
  conversations: [],
  messages: [],
  threads: [],
  threadMessages: [],
};

// Event types for realtime bus
export type PlatformEventType = 
  | 'icom.message.created'
  | 'icom.conversation.created'
  | 'iboite.message.created'
  | 'iboite.thread.created'
  | 'store.reset';

export interface PlatformEvent {
  type: PlatformEventType;
  payload: unknown;
  tenant_id: string;
  network_id: string;
  origin_app_id: string;
}

type EventHandler = (event: PlatformEvent) => void;
const eventHandlers: Map<string, Set<EventHandler>> = new Map();

// Event bus functions
export function subscribeToEvents(clientId: string, handler: EventHandler) {
  if (!eventHandlers.has(clientId)) {
    eventHandlers.set(clientId, new Set());
  }
  eventHandlers.get(clientId)!.add(handler);
  
  return () => {
    eventHandlers.get(clientId)?.delete(handler);
  };
}

export function emitEvent(event: PlatformEvent) {
  eventHandlers.forEach((handlers) => {
    handlers.forEach((handler) => handler(event));
  });
}

// Store access functions
export function getStore(): PlatformStore {
  return platformStore;
}

export function resetStore() {
  platformStore = {
    conversations: [],
    messages: [],
    threads: [],
    threadMessages: [],
  };
  emitEvent({
    type: 'store.reset',
    payload: null,
    tenant_id: '*',
    network_id: '*',
    origin_app_id: 'system',
  });
}

// iCom functions
export function createConversation(
  tenantId: string,
  networkId: string,
  participants: { app_id: string; actor_id: string | null }[]
): PlatformConversation {
  const conversation: PlatformConversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tenant_id: tenantId,
    network_id: networkId,
    participants,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };
  platformStore.conversations.push(conversation);
  
  emitEvent({
    type: 'icom.conversation.created',
    payload: conversation,
    tenant_id: tenantId,
    network_id: networkId,
    origin_app_id: participants[0]?.app_id || 'unknown',
  });
  
  return conversation;
}

export function sendMessage(
  conversationId: string,
  senderAppId: string,
  senderActorId: string | null,
  content: string
): PlatformMessage | null {
  const conversation = platformStore.conversations.find(c => c.id === conversationId);
  if (!conversation) return null;
  
  const message: PlatformMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversation_id: conversationId,
    sender_app_id: senderAppId,
    sender_actor_id: senderActorId,
    content,
    created_at: new Date().toISOString(),
    tenant_id: conversation.tenant_id,
    network_id: conversation.network_id,
  };
  platformStore.messages.push(message);
  conversation.last_message_at = message.created_at;
  
  emitEvent({
    type: 'icom.message.created',
    payload: message,
    tenant_id: conversation.tenant_id,
    network_id: conversation.network_id,
    origin_app_id: senderAppId,
  });
  
  return message;
}

export function getConversations(tenantId: string, networkId: string): PlatformConversation[] {
  return platformStore.conversations.filter(
    c => c.tenant_id === tenantId && c.network_id === networkId
  );
}

export function getMessages(conversationId: string): PlatformMessage[] {
  return platformStore.messages.filter(m => m.conversation_id === conversationId);
}

// iBoîte functions
export function createThread(
  tenantId: string,
  networkId: string,
  subject: string,
  participants: { app_id: string; actor_id: string | null }[],
  creatorAppId: string
): PlatformThread {
  const thread: PlatformThread = {
    id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subject,
    tenant_id: tenantId,
    network_id: networkId,
    participants,
    created_at: new Date().toISOString(),
  };
  platformStore.threads.push(thread);
  
  emitEvent({
    type: 'iboite.thread.created',
    payload: thread,
    tenant_id: tenantId,
    network_id: networkId,
    origin_app_id: creatorAppId,
  });
  
  return thread;
}

export function sendThreadMessage(
  threadId: string,
  senderAppId: string,
  senderActorId: string | null,
  content: string
): PlatformThreadMessage | null {
  const thread = platformStore.threads.find(t => t.id === threadId);
  if (!thread) return null;
  
  const message: PlatformThreadMessage = {
    id: `tmsg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    thread_id: threadId,
    sender_app_id: senderAppId,
    sender_actor_id: senderActorId,
    content,
    created_at: new Date().toISOString(),
    read_by: [senderAppId],
  };
  platformStore.threadMessages.push(message);
  
  emitEvent({
    type: 'iboite.message.created',
    payload: message,
    tenant_id: thread.tenant_id,
    network_id: thread.network_id,
    origin_app_id: senderAppId,
  });
  
  return message;
}

export function getThreads(tenantId: string, networkId: string): PlatformThread[] {
  return platformStore.threads.filter(
    t => t.tenant_id === tenantId && t.network_id === networkId
  );
}

export function getThreadMessages(threadId: string): PlatformThreadMessage[] {
  return platformStore.threadMessages.filter(m => m.thread_id === threadId);
}
