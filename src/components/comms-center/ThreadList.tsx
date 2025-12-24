import { motion } from 'framer-motion';
import { Mail, MailOpen, Archive, Users } from 'lucide-react';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ThreadListProps {
  showArchived?: boolean;
}

export function ThreadList({ showArchived = false }: ThreadListProps) {
  const { threads, selectedThread, selectThread } = useComms();
  
  const filteredThreads = threads.filter(t => t.is_archived === showArchived);
  
  return (
    <div className="flex-1 overflow-y-auto">
      {filteredThreads.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          {showArchived ? (
            <Archive className="w-12 h-12 text-muted-foreground/50 mb-4" />
          ) : (
            <Mail className="w-12 h-12 text-muted-foreground/50 mb-4" />
          )}
          <p className="text-sm text-muted-foreground">
            {showArchived ? 'Aucun message archivé' : 'Aucun message'}
          </p>
        </div>
      ) : (
        <div className="p-2 space-y-1">
          {filteredThreads.map((thread, index) => (
            <motion.button
              key={thread.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => selectThread(thread.id)}
              className={cn(
                "w-full p-3 rounded-xl text-left transition-all duration-200",
                "hover:bg-secondary/80",
                selectedThread?.id === thread.id
                  ? "bg-secondary ring-1 ring-iboite/30"
                  : "bg-transparent"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  thread.unread 
                    ? "bg-iboite/20 text-iboite" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {thread.unread ? (
                    <Mail className="w-5 h-5" />
                  ) : (
                    <MailOpen className="w-5 h-5" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      "font-medium truncate",
                      thread.unread 
                        ? "text-foreground" 
                        : "text-secondary-foreground"
                    )}>
                      {thread.subject}
                    </h4>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(thread.created_at), {
                        addSuffix: false,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  
                  {/* Sender */}
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {thread.participants.find(p => p.actor_id === thread.created_by)?.name || 'Inconnu'}
                  </p>
                  
                  {/* Preview */}
                  {thread.messages[0] && (
                    <p className={cn(
                      "text-sm truncate mt-1",
                      thread.unread 
                        ? "text-foreground/70" 
                        : "text-muted-foreground"
                    )}>
                      {thread.messages[thread.messages.length - 1].content}
                    </p>
                  )}
                  
                  {/* Participants */}
                  {thread.participants.length > 2 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {thread.participants.length} participants
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Unread indicator */}
                {thread.unread && (
                  <div className="w-2 h-2 rounded-full bg-iboite shrink-0 mt-2" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
