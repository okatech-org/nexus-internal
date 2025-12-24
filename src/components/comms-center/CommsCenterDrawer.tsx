import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageCircle, 
  Inbox, 
  Archive, 
  ArrowLeft, 
  Plus, 
  Search, 
  Bot, 
  User, 
  Network,
  Phone,
  Video,
  Users,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import { ThreadList } from './ThreadList';
import { ThreadView } from './ThreadView';
import { ContactList } from './ContactList';
import { CallList } from './CallList';
import { MeetingList } from './MeetingList';
import { cn } from '@/lib/utils';
import { IcomFeatureName, IcomFeatureConfig } from '@/types/comms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type InboxView = 'inbox' | 'archived';
type IcomSubTab = 'contact' | 'chat' | 'call' | 'meeting';

const ICOM_FEATURE_CONFIG: Record<IcomSubTab, { icon: typeof MessageCircle; label: string; color: string }> = {
  contact: { icon: Users, label: 'iContact', color: 'text-emerald-500' },
  chat: { icon: MessageCircle, label: 'iChat', color: 'text-blue-500' },
  call: { icon: Phone, label: 'iAppel', color: 'text-orange-500' },
  meeting: { icon: Video, label: 'iRéunion', color: 'text-purple-500' },
};

export function CommsCenterDrawer() {
  const { 
    capabilities,
    appContext,
    currentNetwork,
    isCommsCenterOpen, 
    closeCommsCenter, 
    activeTab, 
    setActiveTab,
    selectedConversation,
    selectedThread,
  } = useComms();
  
  const [inboxView, setInboxView] = useState<InboxView>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [icomSubTab, setIcomSubTab] = useState<IcomSubTab>('contact');
  
  // Get iCom features status
  const icomFeatures = capabilities?.modules.icom.features;
  const icomEnabled = capabilities?.modules.icom.enabled;
  const iboiteEnabled = capabilities?.modules.iboite.enabled;
  
  // Get enabled features list
  const enabledIcomFeatures: IcomSubTab[] = [];
  const disabledIcomFeatures: { feature: IcomSubTab; reason?: string }[] = [];
  
  if (icomFeatures) {
    (['contact', 'chat', 'call', 'meeting'] as IcomSubTab[]).forEach(feature => {
      const config = icomFeatures[feature];
      if (config.enabled) {
        enabledIcomFeatures.push(feature);
      } else {
        disabledIcomFeatures.push({ 
          feature, 
          reason: config.disabled_reason 
        });
      }
    });
  }
  
  const hasDetailView = (activeTab === 'icom' && selectedConversation) || 
                        (activeTab === 'iboite' && selectedThread);
  
  // Auto-select first available tab if current is disabled
  const effectiveTab = activeTab === 'icom' && !icomEnabled && iboiteEnabled ? 'iboite' 
    : activeTab === 'iboite' && !iboiteEnabled && icomEnabled ? 'icom' 
    : activeTab;
    
  // Auto-select first available iCom sub-tab
  const effectiveIcomSubTab = enabledIcomFeatures.includes(icomSubTab) 
    ? icomSubTab 
    : enabledIcomFeatures[0] || 'contact';

  const getDisabledReasonLabel = (reason?: string): string => {
    switch (reason) {
      case 'MODULE_DISABLED': return 'Feature désactivée pour cette app';
      case 'MISSING_SCOPE': return 'Scope manquant';
      case 'NETWORK_POLICY': return 'Interdit par la politique réseau';
      default: return 'Non disponible';
    }
  };
  
  return (
    <AnimatePresence>
      {isCommsCenterOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommsCenter}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-6 top-6 bottom-6 z-50 w-[440px] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {hasDetailView && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {}}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <h2 className="text-lg font-semibold text-foreground">
                    Centre de Communication
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={closeCommsCenter}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Mode & Network Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                  appContext.mode === 'service' 
                    ? 'bg-icom/20 text-icom' 
                    : 'bg-primary/20 text-primary'
                )}>
                  {appContext.mode === 'service' ? (
                    <><Bot className="w-3 h-3" /> Service</>
                  ) : (
                    <><User className="w-3 h-3" /> Delegated</>
                  )}
                </span>
                {currentNetwork && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                    currentNetwork.network_type === 'government'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-iboite/10 text-iboite'
                  )}>
                    <Network className="w-3 h-3" />
                    {currentNetwork.name}
                  </span>
                )}
              </div>
              
              {/* Main Tabs - only show enabled modules */}
              {!hasDetailView && (icomEnabled || iboiteEnabled) && (
                <div className="flex gap-2 mb-3">
                  {icomEnabled && (
                    <button
                      onClick={() => setActiveTab('icom')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        effectiveTab === 'icom'
                          ? "bg-icom/20 text-icom border border-icom/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <MessageCircle className="w-4 h-4" />
                      iCom
                    </button>
                  )}
                  {iboiteEnabled && (
                    <button
                      onClick={() => setActiveTab('iboite')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        effectiveTab === 'iboite'
                          ? "bg-iboite/20 text-iboite border border-iboite/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <Inbox className="w-4 h-4" />
                      iBoîte
                    </button>
                  )}
                </div>
              )}

              {/* iCom Feature Sub-Tabs */}
              {effectiveTab === 'icom' && icomEnabled && !hasDetailView && (
                <TooltipProvider>
                  <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
                    {(['contact', 'chat', 'call', 'meeting'] as IcomSubTab[]).map((feature) => {
                      const config = ICOM_FEATURE_CONFIG[feature];
                      const Icon = config.icon;
                      const isEnabled = enabledIcomFeatures.includes(feature);
                      const disabledInfo = disabledIcomFeatures.find(d => d.feature === feature);
                      
                      if (!isEnabled) {
                        return (
                          <Tooltip key={feature}>
                            <TooltipTrigger asChild>
                              <button
                                disabled
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-muted-foreground/50 cursor-not-allowed"
                              >
                                <Lock className="w-3 h-3" />
                                <span className="hidden sm:inline">{config.label}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px]">
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3 text-destructive" />
                                <span>{getDisabledReasonLabel(disabledInfo?.reason)}</span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      
                      return (
                        <button
                          key={feature}
                          onClick={() => setIcomSubTab(feature)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                            effectiveIcomSubTab === feature
                              ? `bg-background shadow-sm ${config.color}`
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </TooltipProvider>
              )}

              {/* iCom Features Status Banner */}
              {effectiveTab === 'icom' && icomEnabled && !hasDetailView && disabledIcomFeatures.length > 0 && (
                <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertCircle className="w-3 h-3" />
                    <span>
                      {disabledIcomFeatures.length} feature{disabledIcomFeatures.length > 1 ? 's' : ''} désactivée{disabledIcomFeatures.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Search & filters for list view */}
              {!hasDetailView && (
                <div className="mt-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        effectiveTab === 'iboite' 
                          ? 'Rechercher un thread...' 
                          : effectiveIcomSubTab === 'contact'
                          ? 'Rechercher un contact...'
                          : effectiveIcomSubTab === 'chat'
                          ? 'Rechercher une conversation...'
                          : effectiveIcomSubTab === 'call'
                          ? 'Rechercher un appel...'
                          : 'Rechercher une réunion...'
                      }
                      className="w-full bg-secondary/50 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  {effectiveTab === 'iboite' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setInboxView('inbox')}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          inboxView === 'inbox'
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Inbox interne
                      </button>
                      <button
                        onClick={() => setInboxView('archived')}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1",
                          inboxView === 'archived'
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Archive className="w-3 h-3" />
                        Archives
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {/* iCom Content - based on sub-tab */}
              {effectiveTab === 'icom' && icomEnabled && (
                <>
                  {selectedConversation ? (
                    <ChatView />
                  ) : (
                    <>
                      {effectiveIcomSubTab === 'contact' && <ContactList searchQuery={searchQuery} />}
                      {effectiveIcomSubTab === 'chat' && <ConversationList />}
                      {effectiveIcomSubTab === 'call' && <CallList searchQuery={searchQuery} />}
                      {effectiveIcomSubTab === 'meeting' && <MeetingList searchQuery={searchQuery} />}
                    </>
                  )}
                </>
              )}
              
              {effectiveTab === 'iboite' && iboiteEnabled && (
                selectedThread ? (
                  <ThreadView />
                ) : (
                  <ThreadList showArchived={inboxView === 'archived'} />
                )
              )}
              
              {!icomEnabled && !iboiteEnabled && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucun module de communication activé pour cette application.
                  </p>
                </div>
              )}
            </div>
            
            {/* FAB for new conversation/thread */}
            {!hasDetailView && (icomEnabled || iboiteEnabled) && (
              <div className="absolute bottom-6 right-6">
                <Button
                  variant={effectiveTab === 'icom' ? 'icom' : 'iboite'}
                  size="icon-lg"
                  className="rounded-xl shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
