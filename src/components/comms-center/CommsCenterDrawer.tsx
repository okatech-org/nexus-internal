import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Mail, Archive, ArrowLeft, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import { ThreadList } from './ThreadList';
import { ThreadView } from './ThreadView';
import { cn } from '@/lib/utils';

type InboxView = 'inbox' | 'archived';

export function CommsCenterDrawer() {
  const { 
    capabilities,
    isCommsCenterOpen, 
    closeCommsCenter, 
    activeTab, 
    setActiveTab,
    selectedConversation,
    selectedThread,
  } = useComms();
  
  const [inboxView, setInboxView] = useState<InboxView>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  
  const icomEnabled = capabilities?.modules.icom.enabled;
  const iboiteEnabled = capabilities?.modules.iboite.enabled;
  
  const hasDetailView = (activeTab === 'icom' && selectedConversation) || 
                        (activeTab === 'iboite' && selectedThread);
  
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
            className="fixed left-6 top-6 bottom-6 z-50 w-[420px] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                  {hasDetailView && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        // Back button - handled by parent
                      }}
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
              
              {/* Tabs */}
              {!hasDetailView && (
                <div className="flex gap-2">
                  {icomEnabled && (
                    <button
                      onClick={() => setActiveTab('icom')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        activeTab === 'icom'
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
                        activeTab === 'iboite'
                          ? "bg-iboite/20 text-iboite border border-iboite/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <Mail className="w-4 h-4" />
                      iBoîte
                    </button>
                  )}
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
                      placeholder={activeTab === 'icom' ? 'Rechercher une conversation...' : 'Rechercher un message...'}
                      className="w-full bg-secondary/50 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  {activeTab === 'iboite' && (
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
                        Boîte de réception
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
              {activeTab === 'icom' && (
                selectedConversation ? (
                  <ChatView />
                ) : (
                  <ConversationList />
                )
              )}
              
              {activeTab === 'iboite' && (
                selectedThread ? (
                  <ThreadView />
                ) : (
                  <ThreadList showArchived={inboxView === 'archived'} />
                )
              )}
            </div>
            
            {/* FAB for new conversation/thread */}
            {!hasDetailView && (
              <div className="absolute bottom-6 right-6">
                <Button
                  variant={activeTab === 'icom' ? 'icom' : 'iboite'}
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
