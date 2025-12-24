import { useEffect, useState, useCallback } from 'react';
import { 
  realtimeSimulator, 
  RealtimeEvent, 
  RealtimeEventType,
  IComMessageCreatedPayload,
  IComTypingPayload,
  IBoiteMessageCreatedPayload
} from '@/lib/realtime-simulator';
import { toast } from 'sonner';

export interface TypingIndicator {
  conversationId: string;
  actorId: string;
  actorName: string;
}

export function useRealtime() {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events

    switch (event.type) {
      case 'icom.message.created': {
        const payload = event.payload as IComMessageCreatedPayload;
        toast.info(`Nouveau message de ${payload.message.sender_name}`, {
          description: payload.message.content.substring(0, 50) + (payload.message.content.length > 50 ? '...' : ''),
          duration: 4000,
        });
        break;
      }
      
      case 'icom.typing.start': {
        const payload = event.payload as IComTypingPayload;
        setTypingIndicators(prev => {
          if (prev.some(t => t.actorId === payload.actor_id && t.conversationId === payload.conversation_id)) {
            return prev;
          }
          return [...prev, {
            conversationId: payload.conversation_id,
            actorId: payload.actor_id,
            actorName: payload.actor_name,
          }];
        });
        break;
      }
      
      case 'icom.typing.stop': {
        const payload = event.payload as IComTypingPayload;
        setTypingIndicators(prev => 
          prev.filter(t => !(t.actorId === payload.actor_id && t.conversationId === payload.conversation_id))
        );
        break;
      }
      
      case 'iboite.message.created': {
        const payload = event.payload as IBoiteMessageCreatedPayload;
        toast.info(`Nouveau thread: ${payload.message.sender_name}`, {
          description: payload.message.content.substring(0, 50),
          duration: 4000,
        });
        break;
      }
    }
  }, []);

  const connect = useCallback(() => {
    realtimeSimulator.start();
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    realtimeSimulator.stop();
    setIsConnected(false);
    setTypingIndicators([]);
  }, []);

  useEffect(() => {
    const unsubscribe = realtimeSimulator.on('*', handleEvent);
    return () => {
      unsubscribe();
    };
  }, [handleEvent]);

  return {
    events,
    typingIndicators,
    isConnected,
    connect,
    disconnect,
    triggerEvent: realtimeSimulator.triggerEvent.bind(realtimeSimulator),
  };
}
