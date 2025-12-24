import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useToast } from '@/hooks/use-toast';

type ActionType = 
  | 'send_message'
  | 'make_call'
  | 'join_meeting'
  | 'add_contact'
  | 'process_document'
  | 'daily_login';

interface ActionTrackerContextType {
  trackAction: (action: ActionType, count?: number) => void;
  trackMessageSent: () => void;
  trackCallMade: () => void;
  trackMeetingJoined: () => void;
  trackContactAdded: () => void;
  trackDocumentProcessed: () => void;
}

const ActionTrackerContext = createContext<ActionTrackerContextType | null>(null);

export function ActionTrackerProvider({ children }: { children: ReactNode }) {
  const { incrementStat, addPoints } = useGamification();
  const { updateProgress } = useDailyChallenges();
  const { toast } = useToast();

  const trackAction = useCallback((action: ActionType, count: number = 1) => {
    // Map action to gamification stat and challenge type
    switch (action) {
      case 'send_message':
        incrementStat('messagesSent', count);
        updateProgress('send_messages', count);
        break;
      case 'make_call':
        incrementStat('callsMade', count);
        updateProgress('make_calls', count);
        break;
      case 'join_meeting':
        incrementStat('meetingsJoined', count);
        updateProgress('join_meetings', count);
        break;
      case 'add_contact':
        incrementStat('contactsAdded', count);
        updateProgress('add_contacts', count);
        break;
      case 'process_document':
        incrementStat('documentsProcessed', count);
        updateProgress('process_documents', count);
        break;
      case 'daily_login':
        incrementStat('daysActive', 1);
        updateProgress('daily_login', 1);
        break;
    }
  }, [incrementStat, updateProgress]);

  const trackMessageSent = useCallback(() => {
    trackAction('send_message');
  }, [trackAction]);

  const trackCallMade = useCallback(() => {
    trackAction('make_call');
  }, [trackAction]);

  const trackMeetingJoined = useCallback(() => {
    trackAction('join_meeting');
  }, [trackAction]);

  const trackContactAdded = useCallback(() => {
    trackAction('add_contact');
  }, [trackAction]);

  const trackDocumentProcessed = useCallback(() => {
    trackAction('process_document');
  }, [trackAction]);

  return (
    <ActionTrackerContext.Provider value={{
      trackAction,
      trackMessageSent,
      trackCallMade,
      trackMeetingJoined,
      trackContactAdded,
      trackDocumentProcessed,
    }}>
      {children}
    </ActionTrackerContext.Provider>
  );
}

export function useActionTracker() {
  const context = useContext(ActionTrackerContext);
  if (!context) {
    throw new Error('useActionTracker must be used within ActionTrackerProvider');
  }
  return context;
}