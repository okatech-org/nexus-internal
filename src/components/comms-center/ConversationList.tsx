import { motion } from 'framer-motion';
import { Users, User, MessageCircle } from 'lucide-react';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ConversationList() {
  const { conversations, selectedConversation, selectConversation } = useComms();
  
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            Aucune conversation
          </p>
        </div>
      ) : (
        <div className="p-2 space-y-1">
          {conversations.map((conversation, index) => (
            <motion.button
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => selectConversation(conversation.id)}
              className={cn(
                "w-full p-3 rounded-xl text-left transition-all duration-200",
                "hover:bg-secondary/80",
                selectedConversation?.id === conversation.id
                  ? "bg-secondary ring-1 ring-primary/30"
                  : "bg-transparent"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  conversation.type === 'group' 
                    ? "bg-primary/20 text-primary" 
                    : "bg-icom/20 text-icom"
                )}>
                  {conversation.type === 'group' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      "font-medium truncate",
                      conversation.unread_count > 0 
                        ? "text-foreground" 
                        : "text-secondary-foreground"
                    )}>
                      {conversation.title}
                    </h4>
                    {conversation.last_message && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                          addSuffix: false,
                          locale: fr,
                        })}
                      </span>
                    )}
                  </div>
                  
                  {conversation.last_message && (
                    <p className={cn(
                      "text-sm truncate mt-0.5",
                      conversation.unread_count > 0 
                        ? "text-foreground/80" 
                        : "text-muted-foreground"
                    )}>
                      {conversation.last_message.sender_id === 'dev-user-001' && 'Vous: '}
                      {conversation.last_message.content}
                    </p>
                  )}
                  
                  {/* Group members preview */}
                  {conversation.type === 'group' && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex -space-x-1">
                        {conversation.members.slice(0, 3).map((member, i) => (
                          <div
                            key={member.actor_id}
                            className={cn(
                              "w-5 h-5 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-medium",
                              member.online ? "bg-icom text-foreground" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {member.name[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">
                        {conversation.members.length} membres
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Unread badge */}
                {conversation.unread_count > 0 && (
                  <div className="shrink-0">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
