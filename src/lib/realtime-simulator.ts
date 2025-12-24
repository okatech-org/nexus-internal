import { Message, Thread, ThreadMessage } from '@/types/comms';

export type RealtimeEventType = 
  | 'icom.message.created'
  | 'icom.message.read'
  | 'icom.typing.start'
  | 'icom.typing.stop'
  | 'iboite.thread.created'
  | 'iboite.thread.updated'
  | 'iboite.message.created';

export interface RealtimeEvent {
  event_id: string;
  type: RealtimeEventType;
  timestamp: string;
  payload: unknown;
}

export interface IComMessageCreatedPayload {
  conversation_id: string;
  message: Message;
}

export interface IComTypingPayload {
  conversation_id: string;
  actor_id: string;
  actor_name: string;
}

export interface IBoiteThreadUpdatedPayload {
  thread_id: string;
  thread: Thread;
}

export interface IBoiteMessageCreatedPayload {
  thread_id: string;
  message: ThreadMessage;
}

type EventCallback = (event: RealtimeEvent) => void;

class RealtimeSimulator {
  private listeners: Map<RealtimeEventType | '*', EventCallback[]> = new Map();
  private eventCounter = 0;
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  constructor() {
    this.listeners.set('*', []);
  }

  on(eventType: RealtimeEventType | '*', callback: EventCallback): () => void {
    const existing = this.listeners.get(eventType) || [];
    this.listeners.set(eventType, [...existing, callback]);
    
    return () => {
      const callbacks = this.listeners.get(eventType) || [];
      this.listeners.set(eventType, callbacks.filter(cb => cb !== callback));
    };
  }

  private emit(type: RealtimeEventType, payload: unknown) {
    const event: RealtimeEvent = {
      event_id: `evt-${++this.eventCounter}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };

    // Notify specific listeners
    const typeListeners = this.listeners.get(type) || [];
    typeListeners.forEach(cb => cb(event));

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*') || [];
    wildcardListeners.forEach(cb => cb(event));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Simulate random iCom messages every 8-15 seconds
    const icomInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const messages = [
          { sender: 'Alice Kabongo', content: 'Avez-vous vu le nouveau rapport ?' },
          { sender: 'Bernard Mutombo', content: 'La réunion est confirmée pour 14h.' },
          { sender: 'Claire Lukusa', content: 'Merci pour votre retour rapide !' },
          { sender: 'Support NDJOBI', content: 'Votre demande a été prise en compte.' },
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        
        this.emit('icom.message.created', {
          conversation_id: `conv-${Math.floor(Math.random() * 3) + 1}`,
          message: {
            id: `msg-live-${Date.now()}`,
            conversation_id: 'conv-1',
            sender_id: `user-${Math.floor(Math.random() * 10)}`,
            sender_name: msg.sender,
            content: msg.content,
            created_at: new Date().toISOString(),
            status: 'delivered',
          },
        } as IComMessageCreatedPayload);
      }
    }, 8000 + Math.random() * 7000);
    this.intervals.push(icomInterval);

    // Simulate typing indicators
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const names = ['Alice Kabongo', 'Bernard Mutombo', 'Claire Lukusa'];
        const name = names[Math.floor(Math.random() * names.length)];
        
        this.emit('icom.typing.start', {
          conversation_id: 'conv-1',
          actor_id: 'user-002',
          actor_name: name,
        } as IComTypingPayload);

        // Stop typing after 2-4 seconds
        setTimeout(() => {
          this.emit('icom.typing.stop', {
            conversation_id: 'conv-1',
            actor_id: 'user-002',
            actor_name: name,
          } as IComTypingPayload);
        }, 2000 + Math.random() * 2000);
      }
    }, 10000 + Math.random() * 5000);
    this.intervals.push(typingInterval);

    // Simulate iBoîte thread updates every 15-25 seconds
    const iboiteInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const subjects = [
          'Nouveau document disponible',
          'Mise à jour du dossier',
          'Notification système',
          'Rappel: Action requise',
        ];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        
        this.emit('iboite.message.created', {
          thread_id: `thread-${Math.floor(Math.random() * 3) + 1}`,
          message: {
            id: `tmsg-live-${Date.now()}`,
            thread_id: 'thread-1',
            sender_id: 'system',
            sender_name: 'Système NDJOBI',
            content: subject,
            created_at: new Date().toISOString(),
            status: 'delivered',
          },
        } as IBoiteMessageCreatedPayload);
      }
    }, 15000 + Math.random() * 10000);
    this.intervals.push(iboiteInterval);

    console.log('[Realtime] Simulator started');
  }

  stop() {
    this.isRunning = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    console.log('[Realtime] Simulator stopped');
  }

  // Manual event trigger for testing
  triggerEvent(type: RealtimeEventType, payload: unknown) {
    this.emit(type, payload);
  }
}

// Singleton instance
export const realtimeSimulator = new RealtimeSimulator();
