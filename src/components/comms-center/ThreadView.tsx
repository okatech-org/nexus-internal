import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Archive, MoreVertical, Mail, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ThreadView() {
  const { selectedThread, archiveThread } = useComms();
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread]);
  
  if (!selectedThread) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // In real app, would send reply via API
    setInput('');
    setIsReplying(false);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-iboite/20 text-iboite flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {selectedThread.subject}
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedThread.participants.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={() => archiveThread(selectedThread.id)}
            disabled={selectedThread.is_archived}
          >
            <Archive className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedThread.messages.map((message, index) => {
          const isOwn = message.sender_id === 'dev-user-001';
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-secondary/30 rounded-xl p-4"
            >
              {/* Message header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium",
                    isOwn 
                      ? "bg-primary/20 text-primary" 
                      : "bg-iboite/20 text-iboite"
                  )}>
                    {message.sender_name[0]}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-foreground">
                      {message.sender_name}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>
              
              {/* Message content */}
              <div className="text-sm text-secondary-foreground leading-relaxed pl-10">
                {message.content}
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Reply section */}
      <div className="p-4 border-t border-border">
        {!isReplying ? (
          <Button
            variant="iboite"
            className="w-full"
            onClick={() => setIsReplying(true)}
          >
            <Reply className="w-4 h-4 mr-2" />
            Répondre
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre réponse..."
              className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-iboite/50 min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsReplying(false);
                  setInput('');
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="iboite"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
