import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Users, User, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ChatView() {
  const { selectedConversation, messages, sendMessage } = useComms();
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
  
  return (
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
          <Button variant="ghost" size="icon-sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
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
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
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
      </form>
    </div>
  );
}
