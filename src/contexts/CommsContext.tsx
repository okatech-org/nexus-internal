import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  Capabilities, 
  AppContext,
  Conversation, 
  Message, 
  Thread,
  AstedMessage,
  AstedSession,
  App,
  Network,
} from '@/types/comms';
import { 
  mockConversations, 
  mockMessages,
  mockThreads 
} from '@/lib/mock-data';
import {
  loadAppContext,
  saveAppContext,
  bootstrapCapabilities,
  getApps,
  getNetworks,
  getAppById,
  getNetworkById,
} from '@/lib/capabilities';

interface CommsContextType {
  // State
  capabilities: Capabilities | null;
  appContext: AppContext;
  isLoading: boolean;
  
  // App & Network data
  apps: App[];
  networks: Network[];
  currentApp: App | null;
  currentNetwork: Network | null;
  
  // App context management
  setCurrentApp: (appId: string) => void;
  setIdentityMode: (mode: 'service' | 'delegated') => void;
  setDelegatedActor: (actorId: string, realm: 'citizen' | 'government' | 'business') => void;
  updateAppModules: (modules: Partial<App['enabled_modules']>) => void;
  
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
  const [appContext, setAppContext] = useState<AppContext>(loadAppContext());
  const [isLoading, setIsLoading] = useState(false);
  
  // App & Network data
  const [apps] = useState<App[]>(getApps());
  const [networks] = useState<Network[]>(getNetworks());
  const [currentApp, setCurrentAppState] = useState<App | null>(null);
  const [currentNetwork, setCurrentNetworkState] = useState<Network | null>(null);
  
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
  
  // Set current app
  const setCurrentApp = useCallback((appId: string) => {
    const app = getAppById(appId);
    if (!app) return;
    
    const network = getNetworkById(app.network_id);
    if (!network) return;
    
    const newContext: AppContext = {
      app_id: app.app_id,
      tenant_id: app.tenant_id,
      network_id: network.network_id,
      network_type: network.network_type,
      mode: 'service',
      delegated_actor_id: undefined,
      delegated_realm: undefined,
    };
    
    saveAppContext(newContext);
    setAppContext(newContext);
    setCurrentAppState(app);
    setCurrentNetworkState(network);
    
    // Recalculate capabilities
    const newCapabilities = bootstrapCapabilities(newContext);
    setCapabilities(newCapabilities);
  }, []);
  
  // Set identity mode
  const setIdentityMode = useCallback((mode: 'service' | 'delegated') => {
    const newContext: AppContext = {
      ...appContext,
      mode,
      delegated_actor_id: mode === 'service' ? undefined : appContext.delegated_actor_id,
      delegated_realm: mode === 'service' ? undefined : appContext.delegated_realm,
    };
    
    saveAppContext(newContext);
    setAppContext(newContext);
    
    // Recalculate capabilities
    const newCapabilities = bootstrapCapabilities(newContext);
    setCapabilities(newCapabilities);
  }, [appContext]);
  
  // Set delegated actor
  const setDelegatedActor = useCallback((actorId: string, realm: 'citizen' | 'government' | 'business') => {
    const newContext: AppContext = {
      ...appContext,
      mode: 'delegated',
      delegated_actor_id: actorId,
      delegated_realm: realm,
    };
    
    saveAppContext(newContext);
    setAppContext(newContext);
    
    // Recalculate capabilities
    const newCapabilities = bootstrapCapabilities(newContext);
    setCapabilities(newCapabilities);
  }, [appContext]);
  
  // Update app modules (for debug panel simulation)
  const updateAppModules = useCallback((modules: Partial<App['enabled_modules']>) => {
    // This would normally update the backend, but in sandbox we just recalculate
    // For now, capabilities are recalculated on next bootstrap
  }, []);
  
  // Bootstrap capabilities
  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const context = loadAppContext();
      setAppContext(context);
      
      const app = getAppById(context.app_id);
      const network = app ? getNetworkById(app.network_id) : null;
      
      setCurrentAppState(app || null);
      setCurrentNetworkState(network || null);
      
      const caps = bootstrapCapabilities(context);
      setCapabilities(caps);
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
      setConversations(prev => 
        prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c)
      );
    }
  }, [conversations]);
  
  const sendMessage = useCallback((content: string) => {
    if (!selectedConversation) return;
    
    const senderId = appContext.mode === 'delegated' && appContext.delegated_actor_id 
      ? appContext.delegated_actor_id 
      : 'service-account';
    const senderName = appContext.mode === 'delegated' 
      ? `Delegated: ${appContext.delegated_actor_id}` 
      : 'Service Account';
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: senderId,
      sender_name: senderName,
      content,
      created_at: new Date().toISOString(),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, newMessage]);
    setConversations(prev => 
      prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, last_message: newMessage }
          : c
      )
    );
  }, [selectedConversation, appContext]);
  
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
        appContext,
        isLoading,
        apps,
        networks,
        currentApp,
        currentNetwork,
        setCurrentApp,
        setIdentityMode,
        setDelegatedActor,
        updateAppModules,
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
