import { 
  Capabilities, 
  Conversation, 
  Message, 
  Thread, 
  ThreadMessage,
  DevContext 
} from '@/types/comms';

// Mock Dev Context
export const mockDevContext: DevContext = {
  actor_id: 'dev-user-001',
  tenant_id: 'demo-tenant',
  realm: 'government',
  scopes: ['icom:read', 'icom:write', 'iboite:read', 'iboite:write', 'iasted:chat', 'icorrespondance:read'],
};

// Mock Capabilities
export const mockCapabilities: Capabilities = {
  platform: 'okatech-comms',
  version: '1.0',
  tenant_id: mockDevContext.tenant_id,
  app_id: 'sandbox-app',
  modules: {
    icom: { enabled: true, realtime: { sse_url: '/v1/realtime' } },
    iboite: { enabled: true },
    iasted: { enabled: true },
    icorrespondance: { enabled: true, realm_required: 'government' },
  },
};

// Mock Conversations for iCom
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    tenant_id: 'demo-tenant',
    type: 'dm',
    title: 'Alice Kabongo',
    created_by: 'dev-user-001',
    created_at: '2024-01-15T10:00:00Z',
    unread_count: 2,
    members: [
      { actor_id: 'dev-user-001', name: 'Vous', role: 'owner', online: true },
      { actor_id: 'user-002', name: 'Alice Kabongo', role: 'member', online: true },
    ],
    last_message: {
      id: 'msg-1-5',
      conversation_id: 'conv-1',
      sender_id: 'user-002',
      sender_name: 'Alice Kabongo',
      content: 'Avez-vous reçu le dossier ?',
      created_at: '2024-01-15T14:32:00Z',
      status: 'delivered',
    },
  },
  {
    id: 'conv-2',
    tenant_id: 'demo-tenant',
    type: 'group',
    title: 'Équipe Direction',
    created_by: 'user-003',
    created_at: '2024-01-10T08:00:00Z',
    unread_count: 0,
    members: [
      { actor_id: 'dev-user-001', name: 'Vous', role: 'admin', online: true },
      { actor_id: 'user-003', name: 'Bernard Mutombo', role: 'owner', online: false },
      { actor_id: 'user-004', name: 'Claire Lukusa', role: 'member', online: true },
      { actor_id: 'user-005', name: 'David Kasongo', role: 'member', online: false },
    ],
    last_message: {
      id: 'msg-2-10',
      conversation_id: 'conv-2',
      sender_id: 'user-004',
      sender_name: 'Claire Lukusa',
      content: 'Réunion confirmée pour demain 9h.',
      created_at: '2024-01-15T11:45:00Z',
      status: 'read',
    },
  },
  {
    id: 'conv-3',
    tenant_id: 'demo-tenant',
    type: 'dm',
    title: 'Support Technique',
    created_by: 'dev-user-001',
    created_at: '2024-01-12T09:00:00Z',
    unread_count: 1,
    members: [
      { actor_id: 'dev-user-001', name: 'Vous', role: 'member', online: true },
      { actor_id: 'user-006', name: 'Support NDJOBI', role: 'owner', online: true },
    ],
    last_message: {
      id: 'msg-3-3',
      conversation_id: 'conv-3',
      sender_id: 'user-006',
      sender_name: 'Support NDJOBI',
      content: 'Votre demande a été traitée.',
      created_at: '2024-01-15T16:00:00Z',
      status: 'delivered',
    },
  },
];

// Mock Messages for each conversation
export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversation_id: 'conv-1',
      sender_id: 'dev-user-001',
      sender_name: 'Vous',
      content: 'Bonjour Alice, pouvez-vous m\'envoyer le rapport mensuel ?',
      created_at: '2024-01-15T10:00:00Z',
      status: 'read',
    },
    {
      id: 'msg-1-2',
      conversation_id: 'conv-1',
      sender_id: 'user-002',
      sender_name: 'Alice Kabongo',
      content: 'Bien sûr, je vous l\'envoie dans l\'heure.',
      created_at: '2024-01-15T10:05:00Z',
      status: 'read',
    },
    {
      id: 'msg-1-3',
      conversation_id: 'conv-1',
      sender_id: 'user-002',
      sender_name: 'Alice Kabongo',
      content: 'Voilà, je l\'ai envoyé via iBoîte.',
      created_at: '2024-01-15T11:30:00Z',
      status: 'read',
    },
    {
      id: 'msg-1-4',
      conversation_id: 'conv-1',
      sender_id: 'dev-user-001',
      sender_name: 'Vous',
      content: 'Merci beaucoup !',
      created_at: '2024-01-15T11:35:00Z',
      status: 'read',
    },
    {
      id: 'msg-1-5',
      conversation_id: 'conv-1',
      sender_id: 'user-002',
      sender_name: 'Alice Kabongo',
      content: 'Avez-vous reçu le dossier ?',
      created_at: '2024-01-15T14:32:00Z',
      status: 'delivered',
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversation_id: 'conv-2',
      sender_id: 'user-003',
      sender_name: 'Bernard Mutombo',
      content: 'Équipe, nous devons planifier la réunion de cette semaine.',
      created_at: '2024-01-15T09:00:00Z',
      status: 'read',
    },
    {
      id: 'msg-2-2',
      conversation_id: 'conv-2',
      sender_id: 'dev-user-001',
      sender_name: 'Vous',
      content: 'Je suis disponible mardi et mercredi matin.',
      created_at: '2024-01-15T09:15:00Z',
      status: 'read',
    },
    {
      id: 'msg-2-3',
      conversation_id: 'conv-2',
      sender_id: 'user-004',
      sender_name: 'Claire Lukusa',
      content: 'Réunion confirmée pour demain 9h.',
      created_at: '2024-01-15T11:45:00Z',
      status: 'read',
    },
  ],
};

// Mock Threads for iBoîte
export const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    tenant_id: 'demo-tenant',
    subject: 'Rapport mensuel - Janvier 2024',
    created_by: 'user-002',
    created_at: '2024-01-15T11:30:00Z',
    is_archived: false,
    unread: true,
    participants: [
      { actor_id: 'user-002', name: 'Alice Kabongo' },
      { actor_id: 'dev-user-001', name: 'Vous' },
    ],
    messages: [
      {
        id: 'tmsg-1-1',
        thread_id: 'thread-1',
        sender_id: 'user-002',
        sender_name: 'Alice Kabongo',
        content: 'Veuillez trouver ci-joint le rapport mensuel de janvier 2024. Les indicateurs clés sont positifs avec une augmentation de 15% du trafic.',
        created_at: '2024-01-15T11:30:00Z',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'thread-2',
    tenant_id: 'demo-tenant',
    subject: 'Notification: Nouveau dossier en attente',
    created_by: 'system',
    created_at: '2024-01-14T15:00:00Z',
    is_archived: false,
    unread: false,
    participants: [
      { actor_id: 'system', name: 'Système NDJOBI' },
      { actor_id: 'dev-user-001', name: 'Vous' },
    ],
    messages: [
      {
        id: 'tmsg-2-1',
        thread_id: 'thread-2',
        sender_id: 'system',
        sender_name: 'Système NDJOBI',
        content: 'Un nouveau dossier requiert votre attention. Réf: DOSS-2024-0042. Action requise avant le 20 janvier.',
        created_at: '2024-01-14T15:00:00Z',
        status: 'read',
      },
      {
        id: 'tmsg-2-2',
        thread_id: 'thread-2',
        sender_id: 'dev-user-001',
        sender_name: 'Vous',
        content: 'Bien reçu, je traite ce dossier aujourd\'hui.',
        created_at: '2024-01-14T16:30:00Z',
        status: 'read',
      },
    ],
  },
  {
    id: 'thread-3',
    tenant_id: 'demo-tenant',
    subject: 'Mise à jour des procédures internes',
    created_by: 'user-003',
    created_at: '2024-01-10T09:00:00Z',
    is_archived: true,
    unread: false,
    participants: [
      { actor_id: 'user-003', name: 'Bernard Mutombo' },
      { actor_id: 'dev-user-001', name: 'Vous' },
      { actor_id: 'user-004', name: 'Claire Lukusa' },
    ],
    messages: [
      {
        id: 'tmsg-3-1',
        thread_id: 'thread-3',
        sender_id: 'user-003',
        sender_name: 'Bernard Mutombo',
        content: 'Suite à notre réunion, voici les nouvelles procédures qui entrent en vigueur le 1er février.',
        created_at: '2024-01-10T09:00:00Z',
        status: 'read',
      },
    ],
  },
];

// Helper to get messages for a thread
export const getThreadMessages = (threadId: string): ThreadMessage[] => {
  const thread = mockThreads.find(t => t.id === threadId);
  return thread?.messages || [];
};

// Helper to get messages for a conversation
export const getConversationMessages = (conversationId: string): Message[] => {
  return mockMessages[conversationId] || [];
};
