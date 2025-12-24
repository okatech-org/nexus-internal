import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Wifi, WifiOff, Activity, MessageCircle, Mail, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/hooks/useRealtime';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RealtimePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const eventTypeConfig = {
  'icom.message.created': { icon: MessageCircle, color: 'text-icom', bg: 'bg-icom/20' },
  'icom.message.read': { icon: MessageCircle, color: 'text-icom', bg: 'bg-icom/10' },
  'icom.typing.start': { icon: Activity, color: 'text-icom', bg: 'bg-icom/10' },
  'icom.typing.stop': { icon: Activity, color: 'text-muted-foreground', bg: 'bg-secondary' },
  'iboite.thread.created': { icon: Mail, color: 'text-iboite', bg: 'bg-iboite/20' },
  'iboite.thread.updated': { icon: Mail, color: 'text-iboite', bg: 'bg-iboite/10' },
  'iboite.message.created': { icon: Mail, color: 'text-iboite', bg: 'bg-iboite/20' },
};

export function RealtimePanel({ isOpen, onClose }: RealtimePanelProps) {
  const { events, isConnected, connect, disconnect, typingIndicators } = useRealtime();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[600px] max-h-[500px] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isConnected ? "bg-success/20" : "bg-secondary"
                  )}>
                    {isConnected ? (
                      <Wifi className="w-5 h-5 text-success" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Realtime SSE</h2>
                    <p className="text-xs text-muted-foreground">
                      {isConnected ? 'Connecté - Événements simulés' : 'Déconnecté'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Button variant="outline" size="sm" onClick={disconnect}>
                      <WifiOff className="w-4 h-4 mr-2" />
                      Déconnecter
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" onClick={connect}>
                      <Zap className="w-4 h-4 mr-2" />
                      Connecter
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Typing indicators */}
              {typingIndicators.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-icom animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    {typingIndicators.map(t => t.actorName).join(', ')} {typingIndicators.length === 1 ? 'écrit' : 'écrivent'}...
                  </span>
                </div>
              )}
            </div>
            
            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4 max-h-[350px]">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Radio className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'En attente d\'événements...' : 'Connectez-vous pour recevoir des événements'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...events].reverse().map((event, index) => {
                    const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig] || {
                      icon: Radio,
                      color: 'text-muted-foreground',
                      bg: 'bg-secondary',
                    };
                    const EventIcon = config.icon;
                    
                    return (
                      <motion.div
                        key={event.event_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          config.bg
                        )}>
                          <EventIcon className={cn("w-4 h-4", config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-primary">{event.type}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(event.timestamp), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                            {event.event_id}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-border bg-secondary/20">
              <p className="text-xs text-muted-foreground text-center">
                {events.length} événement{events.length !== 1 ? 's' : ''} reçu{events.length !== 1 ? 's' : ''}
                {isConnected && ' • Simulation active'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
