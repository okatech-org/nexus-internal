import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Capabilities, 
  DevContext, 
  Conversation, 
  Message, 
  Thread,
  AstedMessage,
  AstedSession 
} from '@/types/comms';
import { 
  mockCapabilities, 
  mockDevContext, 
  mockConversations, 
  mockMessages,
  mockThreads 
} from '@/lib/mock-data';

interface CommsContextType {
  // State
  capabilities: Capabilities | null;
  devContext: DevContext;
  isDevMode: boolean;
  isLoading: boolean;
  
  // iCom
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  selectConversation: (id: string) => void;
  sendMessage: (content: string) => void;
  
  // iBoîte
  threads: Thread[];
  selectedThread: Thread | null;
  selectThread: (id: string) => void;
  archiveThread: (id: string) => void;
  
  // iAsted
  astedSession: AstedSession | null;
  astedMessages: AstedMessage[];
  sendAstedMessage: (content: string) => Promise<void>;
  clearAstedSession: () => void;
  
  // UI State
  isCommsCenterOpen: boolean;
  isAstedOpen: boolean;
  activeTab: 'icom' | 'iboite';
  openCommsCenter: () => void;
  closeCommsCenter: () => void;
  openAsted: () => void;
  closeAsted: () => void;
  setActiveTab: (tab: 'icom' | 'iboite') => void;
  
  // Bootstrap
  bootstrap: () => Promise<void>;
}

const CommsContext = createContext<CommsContextType | null>(null);

export function CommsProvider({ children }: { children: ReactNode }) {
  // Core state
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [devContext] = useState<DevContext>(mockDevContext);
  const [isLoading, setIsLoading] = useState(false);
  
  // iCom state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // iBoîte state
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  
  // iAsted state
  const [astedSession, setAstedSession] = useState<AstedSession | null>(null);
  const [astedMessages, setAstedMessages] = useState<AstedMessage[]>([]);
  
  // UI state
  const [isCommsCenterOpen, setIsCommsCenterOpen] = useState(false);
  const [isAstedOpen, setIsAstedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'icom' | 'iboite'>('icom');
  
  const isDevMode = true; // Always dev mode in sandbox
  
  // Bootstrap capabilities
  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCapabilities(mockCapabilities);
      setConversations(mockConversations);
      setThreads(mockThreads);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // iCom actions
  const selectConversation = useCallback((id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setSelectedConversation(conv);
      setMessages(mockMessages[id] || []);
      // Mark as read
      setConversations(prev => 
        prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c)
      );
    }
  }, [conversations]);
  
  const sendMessage = useCallback((content: string) => {
    if (!selectedConversation) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: devContext.actor_id,
      sender_name: 'Vous',
      content,
      created_at: new Date().toISOString(),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update last message in conversation
    setConversations(prev => 
      prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, last_message: newMessage }
          : c
      )
    );
  }, [selectedConversation, devContext.actor_id]);
  
  // iBoîte actions
  const selectThread = useCallback((id: string) => {
    const thread = threads.find(t => t.id === id);
    if (thread) {
      setSelectedThread(thread);
      setThreads(prev => 
        prev.map(t => t.id === id ? { ...t, unread: false } : t)
      );
    }
  }, [threads]);
  
  const archiveThread = useCallback((id: string) => {
    setThreads(prev => 
      prev.map(t => t.id === id ? { ...t, is_archived: true } : t)
    );
    if (selectedThread?.id === id) {
      setSelectedThread(null);
    }
  }, [selectedThread]);
  
  // iAsted actions
  const sendAstedMessage = useCallback(async (content: string) => {
    const userMessage: AstedMessage = {
      id: `asted-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setAstedMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const aiResponses = [
      "Je suis iAsted, votre assistant IA intégré à la plateforme NDJOBI. Comment puis-je vous aider aujourd'hui ?",
      "J'ai analysé votre demande. Voici quelques suggestions basées sur le contexte de vos communications récentes.",
      "D'après les informations disponibles, je peux vous proposer un résumé de vos derniers échanges.",
      "Je peux vous aider à rédiger une réponse ou à synthétiser les points clés de cette conversation.",
      "Avez-vous besoin d'aide pour traiter un dossier spécifique ou pour naviguer dans vos communications ?",
    ];
    
    const assistantMessage: AstedMessage = {
      id: `asted-${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date().toISOString(),
    };
    
    setAstedMessages(prev => [...prev, assistantMessage]);
  }, []);
  
  const clearAstedSession = useCallback(() => {
    setAstedMessages([]);
    setAstedSession(null);
  }, []);
  
  // UI actions
  const openCommsCenter = useCallback(() => setIsCommsCenterOpen(true), []);
  const closeCommsCenter = useCallback(() => {
    setIsCommsCenterOpen(false);
    setSelectedConversation(null);
    setSelectedThread(null);
  }, []);
  const openAsted = useCallback(() => setIsAstedOpen(true), []);
  const closeAsted = useCallback(() => setIsAstedOpen(false), []);
  
  return (
    <CommsContext.Provider
      value={{
        capabilities,
        devContext,
        isDevMode,
        isLoading,
        conversations,
        selectedConversation,
        messages,
        selectConversation,
        sendMessage,
        threads,
        selectedThread,
        selectThread,
        archiveThread,
        astedSession,
        astedMessages,
        sendAstedMessage,
        clearAstedSession,
        isCommsCenterOpen,
        isAstedOpen,
        activeTab,
        openCommsCenter,
        closeCommsCenter,
        openAsted,
        closeAsted,
        setActiveTab,
        bootstrap,
      }}
    >
      {children}
    </CommsContext.Provider>
  );
}

export function useComms() {
  const context = useContext(CommsContext);
  if (!context) {
    throw new Error('useComms must be used within a CommsProvider');
  }
  return context;
}
