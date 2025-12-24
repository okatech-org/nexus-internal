import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, MessageCircle, Inbox, Brain, FileText, Bell,
  Phone, Users, Clock, CheckCircle, Send, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useComms } from '@/contexts/CommsContext';
import { useRealtime } from '@/hooks/useRealtime';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface RecentContact {
  id: string;
  name: string;
  avatar?: string;
  lastSeen: string;
  online: boolean;
}

interface RecentConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  participants: string[];
}

export default function DelegatedDashboard() {
  const { t } = useTranslation();
  const { payload, hasScope } = useAuth();
  const { openCommsCenter } = useComms();
  const { events, isConnected, connect, disconnect } = useRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Auto-connect to realtime on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);
  
  // Mock data for Citizen account (Chat + Contact only)
  const recentConversations: RecentConversation[] = [
    {
      id: 'conv-1',
      title: 'Service des impôts',
      lastMessage: 'Votre dossier a été traité avec succès.',
      timestamp: 'Il y a 5 min',
      unread: 2,
      participants: ['Agent Fiscal'],
    },
    {
      id: 'conv-2',
      title: 'Mairie - État civil',
      lastMessage: 'Merci de fournir les documents demandés.',
      timestamp: 'Il y a 1h',
      unread: 0,
      participants: ['Agent Municipal'],
    },
    {
      id: 'conv-3',
      title: 'Support NDJOBI',
      lastMessage: 'Comment pouvons-nous vous aider ?',
      timestamp: 'Hier',
      unread: 1,
      participants: ['Assistant'],
    },
  ];
  
  const frequentContacts: RecentContact[] = [
    { id: 'c1', name: 'Service Impôts', lastSeen: 'En ligne', online: true },
    { id: 'c2', name: 'Mairie Centrale', lastSeen: 'Il y a 30 min', online: false },
    { id: 'c3', name: 'Support Citoyen', lastSeen: 'En ligne', online: true },
    { id: 'c4', name: 'Préfecture', lastSeen: 'Il y a 2h', online: false },
  ];
  
  const modules = [
    { 
      id: 'icom', 
      name: t('dashboard.delegated.messages'), 
      icon: MessageCircle, 
      description: t('dashboard.delegated.liveConversations'),
      color: 'text-icom bg-icom/20',
      enabled: hasScope('icom:read'),
      unread: recentConversations.reduce((sum, c) => sum + c.unread, 0),
    },
    { 
      id: 'iboite', 
      name: t('dashboard.delegated.inbox'), 
      icon: Inbox, 
      description: t('dashboard.delegated.internalMail'),
      color: 'text-iboite bg-iboite/20',
      enabled: hasScope('iboite:read'),
      unread: 5,
    },
    { 
      id: 'iasted', 
      name: t('dashboard.delegated.assistant'), 
      icon: Brain, 
      description: t('dashboard.delegated.smartHelp'),
      color: 'text-neural bg-neural/20',
      enabled: hasScope('iasted:chat'),
      unread: 0,
    },
    { 
      id: 'icorrespondance', 
      name: t('dashboard.delegated.officialMail'), 
      icon: FileText, 
      description: t('dashboard.delegated.adminDocs'),
      color: 'text-primary bg-primary/20',
      enabled: hasScope('icorrespondance:read'),
      unread: 1,
    },
  ];
  
  const totalUnread = modules.reduce((sum, m) => sum + (m.enabled ? m.unread : 0), 0);
  const recentEvents = events.slice(-5).reverse();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{t('dashboard.delegated.title')}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{payload?.actor_id || payload?.sub}</p>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      isConnected ? "bg-green-500" : "bg-muted"
                    )} title={isConnected ? 'Connecté' : 'Déconnecté'} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground font-medium">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </Button>
                
                {/* Notifications dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-80 glass rounded-xl border border-border/50 shadow-xl z-50"
                    >
                      <div className="p-3 border-b border-border/50">
                        <h4 className="font-medium text-foreground">Notifications</h4>
                        <p className="text-xs text-muted-foreground">
                          {recentEvents.length} événements récents
                        </p>
                      </div>
                      <ScrollArea className="h-64">
                        <div className="p-2 space-y-1">
                          {recentEvents.length > 0 ? (
                            recentEvents.map((event) => (
                              <div
                                key={event.event_id}
                                className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-icom/20 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-icom" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {event.type.replace('.', ' ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                              Aucune notification récente
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('dashboard.delegated.welcome')}, {payload?.actor_id || t('modes.delegated')}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.delegated.accessComms')}
          </p>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <h3 className="font-medium text-foreground mb-4">{t('dashboard.delegated.quickActions')}</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="neural" onClick={openCommsCenter}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('dashboard.delegated.newConversation')}
            </Button>
            <Button variant="outline" onClick={openCommsCenter}>
              <Users className="w-4 h-4 mr-2" />
              Mes contacts
            </Button>
            <Button variant="outline" onClick={openCommsCenter}>
              <Send className="w-4 h-4 mr-2" />
              Envoyer un message
            </Button>
          </div>
        </motion.div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Conversations récentes</h3>
              <Button variant="ghost" size="sm" onClick={openCommsCenter}>
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentConversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  whileHover={{ scale: 1.01 }}
                  className="w-full p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors text-left flex items-center gap-4"
                  onClick={openCommsCenter}
                >
                  <div className="w-12 h-12 rounded-xl bg-icom/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-icom" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground truncate">{conv.title}</h4>
                      <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{conv.participants.join(', ')}</span>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <Badge variant="destructive" className="flex-shrink-0">
                      {conv.unread}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {/* Frequent Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Contacts fréquents</h3>
              <Button variant="ghost" size="sm" onClick={openCommsCenter}>
                <Users className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {frequentContacts.map((contact) => (
                <motion.button
                  key={contact.id}
                  whileHover={{ scale: 1.02 }}
                  className="w-full p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors flex items-center gap-3"
                  onClick={openCommsCenter}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                      contact.online ? "bg-green-500" : "bg-muted"
                    )} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-foreground">{contact.name}</h4>
                    <p className="text-xs text-muted-foreground">{contact.lastSeen}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Modules Grid */}
        <h3 className="font-medium text-foreground mt-8 mb-4">{t('dashboard.delegated.yourServices')}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {modules.filter(m => m.enabled).map((module, index) => (
            <motion.button
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className="glass rounded-xl p-5 text-left hover:border-primary/30 transition-colors"
              onClick={openCommsCenter}
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  module.color
                )}>
                  <module.icon className="w-6 h-6" />
                </div>
                
                {module.unread > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {module.unread}
                  </Badge>
                )}
              </div>
              
              <h4 className="font-medium text-foreground mt-4 mb-1">{module.name}</h4>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </motion.button>
          ))}
        </div>
        
        {/* Disabled modules notice */}
        {modules.some(m => !m.enabled) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground"
          >
            {t('dashboard.delegated.servicesNotAvailable')}
          </motion.div>
        )}
        
        {/* Realtime Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <span className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-muted"
          )} />
          {isConnected ? 'Notifications en temps réel actives' : 'Connexion aux notifications...'}
        </motion.div>
      </main>
    </div>
  );
}
