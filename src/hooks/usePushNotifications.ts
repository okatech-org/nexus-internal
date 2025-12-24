import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PushNotification {
  id: string;
  type: 'missed_call' | 'unread_message' | 'meeting_reminder' | 'urgent_thread' | 'badge_unlock' | 'challenge_expiring';
  title: string;
  body: string;
  icon?: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface NotificationPreferences {
  missedCalls: boolean;
  unreadMessages: boolean;
  meetingReminders: boolean;
  urgentThreads: boolean;
  badgeUnlocks: boolean;
  challengeExpiring: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  missedCalls: true,
  unreadMessages: true,
  meetingReminders: true,
  urgentThreads: true,
  badgeUnlocks: true,
  challengeExpiring: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

// Notification sounds (base64 encoded short beep)
const NOTIFICATION_SOUNDS = {
  default: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAABAAAAA',
  urgent: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAABAAAAA',
  subtle: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAABAAAAA',
};

export function usePushNotifications() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationQueue = useRef<PushNotification[]>([]);
  const processingQueue = useRef(false);

  // Load preferences and check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    const savedPrefs = localStorage.getItem('push_notification_preferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Error parsing notification preferences:', e);
      }
    }

    const savedNotifications = localStorage.getItem('push_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: PushNotification) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (e) {
        console.error('Error parsing saved notifications:', e);
      }
    }
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
    
    // Persist notifications (keep last 50)
    const toSave = notifications.slice(0, 50);
    localStorage.setItem('push_notifications', JSON.stringify(toSave));
  }, [notifications]);

  // Check if currently in quiet hours
  const isQuietHours = useCallback(() => {
    if (!preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }, [preferences.quietHoursEnabled, preferences.quietHoursStart, preferences.quietHoursEnd]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Non supporté",
        description: "Votre navigateur ne supporte pas les notifications push",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "✅ Notifications activées",
          description: "Vous recevrez des alertes pour les appels manqués et messages non lus",
        });
        return true;
      } else if (result === 'denied') {
        toast({
          title: "Notifications bloquées",
          description: "Vous pouvez les réactiver dans les paramètres de votre navigateur",
          variant: "destructive",
        });
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [toast]);

  // Play notification sound
  const playSound = useCallback((priority: PushNotification['priority']) => {
    if (!preferences.soundEnabled || isQuietHours()) return;

    try {
      const audio = new Audio(priority === 'urgent' ? NOTIFICATION_SOUNDS.urgent : NOTIFICATION_SOUNDS.default);
      audio.volume = priority === 'urgent' ? 0.8 : 0.5;
      audio.play().catch(() => {
        // Ignore audio play errors (common on mobile)
      });
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
  }, [preferences.soundEnabled, isQuietHours]);

  // Vibrate device
  const vibrate = useCallback((priority: PushNotification['priority']) => {
    if (!preferences.vibrationEnabled || isQuietHours()) return;

    if ('vibrate' in navigator) {
      const pattern = priority === 'urgent' ? [200, 100, 200, 100, 200] : [100, 50, 100];
      navigator.vibrate(pattern);
    }
  }, [preferences.vibrationEnabled, isQuietHours]);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: PushNotification) => {
    if (permission !== 'granted' || isQuietHours()) return;

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: !preferences.soundEnabled,
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        markAsRead(notification.id);
      };

      // Auto-close after 8 seconds for non-urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 8000);
      }
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }, [permission, isQuietHours, preferences.soundEnabled]);

  // Process notification queue
  const processQueue = useCallback(async () => {
    if (processingQueue.current || notificationQueue.current.length === 0) return;

    processingQueue.current = true;

    while (notificationQueue.current.length > 0) {
      const notification = notificationQueue.current.shift()!;
      
      // Add to state
      setNotifications(prev => [notification, ...prev]);

      // Show effects based on priority
      if (!isQuietHours()) {
        playSound(notification.priority);
        vibrate(notification.priority);
        showBrowserNotification(notification);

        // Show toast for in-app notification
        toast({
          title: notification.title,
          description: notification.body,
          duration: notification.priority === 'urgent' ? 10000 : 5000,
        });
      }

      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    processingQueue.current = false;
  }, [isQuietHours, playSound, vibrate, showBrowserNotification, toast]);

  // Send a push notification
  const sendNotification = useCallback((
    type: PushNotification['type'],
    title: string,
    body: string,
    options?: {
      icon?: string;
      data?: Record<string, unknown>;
      priority?: PushNotification['priority'];
    }
  ) => {
    // Check if this type is enabled
    const typeToPreference: Record<PushNotification['type'], keyof NotificationPreferences> = {
      missed_call: 'missedCalls',
      unread_message: 'unreadMessages',
      meeting_reminder: 'meetingReminders',
      urgent_thread: 'urgentThreads',
      badge_unlock: 'badgeUnlocks',
      challenge_expiring: 'challengeExpiring',
    };

    const preferenceKey = typeToPreference[type];
    if (preferenceKey && !preferences[preferenceKey]) {
      return; // This notification type is disabled
    }

    const notification: PushNotification = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      body,
      icon: options?.icon,
      timestamp: new Date(),
      read: false,
      data: options?.data,
      priority: options?.priority || 'normal',
    };

    notificationQueue.current.push(notification);
    processQueue();

    return notification.id;
  }, [preferences, processQueue]);

  // Notification helper methods
  const notifyMissedCall = useCallback((callerName: string, callerCompany?: string) => {
    const body = callerCompany 
      ? `${callerName} de ${callerCompany} a essayé de vous joindre`
      : `${callerName} a essayé de vous joindre`;
    
    return sendNotification('missed_call', '📞 Appel manqué', body, {
      priority: 'high',
      data: { callerName, callerCompany },
    });
  }, [sendNotification]);

  const notifyUnreadMessage = useCallback((senderName: string, preview: string, conversationId?: string) => {
    return sendNotification('unread_message', `💬 Message de ${senderName}`, preview, {
      priority: 'normal',
      data: { senderName, conversationId },
    });
  }, [sendNotification]);

  const notifyMeetingReminder = useCallback((meetingTitle: string, minutesUntil: number) => {
    const body = minutesUntil <= 5 
      ? `Commence dans ${minutesUntil} minutes !`
      : `Dans ${minutesUntil} minutes`;
    
    return sendNotification('meeting_reminder', `📅 ${meetingTitle}`, body, {
      priority: minutesUntil <= 5 ? 'urgent' : 'high',
      data: { meetingTitle, minutesUntil },
    });
  }, [sendNotification]);

  const notifyUrgentThread = useCallback((subject: string, from: string) => {
    return sendNotification('urgent_thread', `🚨 Thread urgent: ${subject}`, `De: ${from}`, {
      priority: 'urgent',
      data: { subject, from },
    });
  }, [sendNotification]);

  const notifyBadgeUnlock = useCallback((badgeName: string, badgeIcon: string) => {
    return sendNotification('badge_unlock', '🏆 Badge débloqué !', `${badgeIcon} ${badgeName}`, {
      priority: 'low',
      data: { badgeName, badgeIcon },
    });
  }, [sendNotification]);

  const notifyChallengeExpiring = useCallback((challengeTitle: string, minutesRemaining: number) => {
    return sendNotification(
      'challenge_expiring', 
      '⏰ Défi expire bientôt !', 
      `${challengeTitle} - ${minutesRemaining} min restantes`,
      {
        priority: 'high',
        data: { challengeTitle, minutesRemaining },
      }
    );
  }, [sendNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('push_notifications');
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem('push_notification_preferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    // State
    permission,
    preferences,
    notifications,
    unreadCount,
    isQuietHours: isQuietHours(),

    // Actions
    requestPermission,
    sendNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updatePreferences,

    // Helpers
    notifyMissedCall,
    notifyUnreadMessage,
    notifyMeetingReminder,
    notifyUrgentThread,
    notifyBadgeUnlock,
    notifyChallengeExpiring,
  };
}
