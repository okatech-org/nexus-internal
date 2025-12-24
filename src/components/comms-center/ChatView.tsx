import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, User, MoreVertical, Phone, Video, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PolicyIndicator } from './PolicyIndicator';
import { canCommunicate, formatPolicyReason } from '@/lib/policyEngine';
import { Realm } from '@/types/comms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ChatView() {
  const { selectedConversation, messages, sendMessage, appContext, capabilities } = useComms();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedConversation]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage(input.trim());
    setInput('');
  };
  
  if (!selectedConversation) return null;
  
  const onlineMembers = selectedConversation.members.filter(m => m.online);
  
  // Determine receiver realm from conversation
  const otherMember = selectedConversation.members.find(m => m.actor_id !== 'dev-user-001');
  const receiverRealm: Realm = (otherMember as any)?.realm || 'citizen';
  const senderRealm: Realm = appContext.delegated_realm || 'citizen';
  const userScopes = JSON.parse(localStorage.getItem('comms.user_scopes') || '[]');
  
  // Check policy for different channels
  const chatPolicy = canCommunicate({
    senderRealm,
    receiverRealm,
    networkType: appContext.network_type,
    userScopes,
    channel: 'icom.chat',
  });
  
  const callPolicy = canCommunicate({
    senderRealm,
    receiverRealm,
    networkType: appContext.network_type,
    userScopes,
    channel: 'icom.call',
  });
  
  const meetingPolicy = canCommunicate({
    senderRealm,
    receiverRealm,
    networkType: appContext.network_type,
    userScopes,
    channel: 'icom.meeting',
  });
  
  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              selectedConversation.type === 'group' 
                ? "bg-primary/20 text-primary" 
                : "bg-icom/20 text-icom"
            )}>
              {selectedConversation.type === 'group' ? (
                <Users className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {selectedConversation.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.type === 'group' 
                  ? `${onlineMembers.length} en ligne`
                  : onlineMembers.length > 1 ? 'En ligne' : 'Hors ligne'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Call button with policy check */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    disabled={!callPolicy.allowed}
                    className={cn(!callPolicy.allowed && "opacity-50 cursor-not-allowed")}
                  >
                    {callPolicy.allowed ? (
                      <Phone className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {!callPolicy.allowed && (
                <TooltipContent side="bottom">
                  <p className="text-xs">{formatPolicyReason(callPolicy)}</p>
                </TooltipContent>
              )}
            </Tooltip>
            
            {/* Video button with policy check */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    disabled={!meetingPolicy.allowed}
                    className={cn(!meetingPolicy.allowed && "opacity-50 cursor-not-allowed")}
                  >
                    {meetingPolicy.allowed ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {!meetingPolicy.allowed && (
                <TooltipContent side="bottom">
                  <p className="text-xs">{formatPolicyReason(meetingPolicy)}</p>
                </TooltipContent>
              )}
            </Tooltip>
            
            <Button variant="ghost" size="icon-sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Policy Banner - show if chat is restricted or cross-realm */}
        {senderRealm !== receiverRealm && (
          <div className={cn(
            "px-4 py-2 border-b border-border flex items-center gap-2 text-xs",
            chatPolicy.allowed 
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
              : "bg-destructive/10 text-destructive"
          )}>
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              Communication cross-realm: <strong>{senderRealm}</strong> → <strong>{receiverRealm}</strong>
            </span>
            <PolicyIndicator 
              senderRealm={senderRealm} 
              receiverRealm={receiverRealm}
              networkType={appContext.network_type}
              userScopes={userScopes}
              compact
            />
          </div>
        )}
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isOwn = message.sender_id === 'dev-user-001';
            const showDate = index === 0 || 
              new Date(messages[index - 1].created_at).toDateString() !== 
              new Date(message.created_at).toDateString();
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                      {format(new Date(message.created_at), 'EEEE d MMMM', { locale: fr })}
                    </span>
                  </div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[75%]",
                    isOwn ? "items-end" : "items-start"
                  )}>
                    {!isOwn && selectedConversation.type === 'group' && (
                      <span className="text-xs text-muted-foreground mb-1 block ml-1">
                        {message.sender_name}
                      </span>
                    )}
                    
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-secondary text-secondary-foreground rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    <span className={cn(
                      "text-[10px] text-muted-foreground mt-1 block",
                      isOwn ? "text-right mr-1" : "ml-1"
                    )}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input - disabled if chat not allowed */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          {!chatPolicy.allowed ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground bg-secondary/50 rounded-xl">
              <Lock className="w-4 h-4" />
              <span>{formatPolicyReason(chatPolicy)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez un message..."
                className="flex-1 bg-secondary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                type="submit"
                variant="icom"
                size="icon"
                disabled={!input.trim()}
                className="rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </form>
      </div>
    </TooltipProvider>
  );
}
