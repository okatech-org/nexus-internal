import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DailyChallenge } from '@/types/challenges';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  challengeExpiring: boolean;
  leaderboardChanges: boolean;
  badgeUnlocked: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  challengeExpiring: true,
  leaderboardChanges: true,
  badgeUnlocked: true,
};

export function useNotifications() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const lastLeaderboardRank = useRef<number | null>(null);
  const notifiedChallenges = useRef<Set<string>>(new Set());

  // Check and request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load settings from localStorage
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Non supporté",
        description: "Votre navigateur ne supporte pas les notifications",
        variant: "destructive",
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      toast({
        title: "Notifications activées",
        description: "Vous recevrez des notifications pour les événements importants",
      });
      return true;
    } else {
      toast({
        title: "Notifications refusées",
        description: "Vous pouvez les activer dans les paramètres de votre navigateur",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [permission]);

  // Check for expiring challenges
  const checkExpiringChallenges = useCallback((challenges: DailyChallenge[]) => {
    if (!settings.challengeExpiring || permission !== 'granted') return;

    const now = new Date();
    
    challenges.forEach(challenge => {
      if (challenge.completed) return;
      if (notifiedChallenges.current.has(challenge.id)) return;

      const expiresAt = new Date(challenge.expiresAt);
      const hoursRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Notify when 2 hours remaining
      if (hoursRemaining <= 2 && hoursRemaining > 0) {
        notifiedChallenges.current.add(challenge.id);
        
        sendNotification(`⏰ Défi expire bientôt !`, {
          body: `${challenge.icon} ${challenge.title} - ${challenge.progress}/${challenge.requirement} (${Math.round(hoursRemaining * 60)} min restantes)`,
          tag: `challenge-expiring-${challenge.id}`,
        });

        toast({
          title: "⏰ Défi expire bientôt !",
          description: `${challenge.icon} ${challenge.title} - Plus que ${Math.round(hoursRemaining * 60)} minutes`,
        });
      }
    });
  }, [settings.challengeExpiring, permission, sendNotification, toast]);

  // Check for leaderboard changes
  const checkLeaderboardPosition = useCallback(async (userId: string | null) => {
    if (!settings.leaderboardChanges || permission !== 'granted' || !userId) return;

    try {
      const { data: stats } = await supabase
        .from('user_gamification_stats')
        .select('user_id, total_points')
        .order('total_points', { ascending: false })
        .limit(100);

      if (!stats) return;

      const currentRank = stats.findIndex(s => s.user_id === userId) + 1;
      
      if (currentRank === 0) return; // User not in leaderboard

      if (lastLeaderboardRank.current !== null && currentRank !== lastLeaderboardRank.current) {
        if (currentRank < lastLeaderboardRank.current) {
          // User moved up
          sendNotification(`🚀 Vous montez dans le classement !`, {
            body: `Vous êtes maintenant #${currentRank} (était #${lastLeaderboardRank.current})`,
            tag: 'leaderboard-up',
          });
        } else {
          // User moved down
          sendNotification(`📉 Un ami vous a dépassé !`, {
            body: `Vous êtes maintenant #${currentRank} (était #${lastLeaderboardRank.current})`,
            tag: 'leaderboard-down',
          });
          
          toast({
            title: "📉 Quelqu'un vous a dépassé !",
            description: `Vous êtes maintenant #${currentRank}. Relevez le défi !`,
          });
        }
      }

      lastLeaderboardRank.current = currentRank;
    } catch (error) {
      console.error('Error checking leaderboard:', error);
    }
  }, [settings.leaderboardChanges, permission, sendNotification, toast]);

  // Notify badge unlock
  const notifyBadgeUnlock = useCallback((badgeName: string, badgeIcon: string) => {
    if (!settings.badgeUnlocked || permission !== 'granted') return;

    sendNotification(`🏆 Badge débloqué !`, {
      body: `${badgeIcon} ${badgeName}`,
      tag: 'badge-unlock',
    });
  }, [settings.badgeUnlocked, permission, sendNotification]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('notification_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    permission,
    settings,
    requestPermission,
    sendNotification,
    checkExpiringChallenges,
    checkLeaderboardPosition,
    notifyBadgeUnlock,
    updateSettings,
  };
}