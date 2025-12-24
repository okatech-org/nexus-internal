import { useState, useCallback, useMemo, useEffect } from 'react';
import { Badge, UserStats, BadgeCategory, LEVEL_THRESHOLDS } from '@/types/gamification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BADGE_DEFINITIONS: Omit<Badge, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  // Communication badges
  {
    id: 'first-message',
    name: 'Premier Pas',
    description: 'Envoyez votre premier message',
    icon: '💬',
    rarity: 'common',
    category: 'communication',
    requirement: 1,
  },
  {
    id: 'chatterbox',
    name: 'Bavard',
    description: 'Envoyez 50 messages',
    icon: '🗣️',
    rarity: 'rare',
    category: 'communication',
    requirement: 50,
  },
  {
    id: 'master-communicator',
    name: 'Maître Communicateur',
    description: 'Envoyez 500 messages',
    icon: '🎙️',
    rarity: 'epic',
    category: 'communication',
    requirement: 500,
  },
  {
    id: 'voice-hero',
    name: 'Héros Vocal',
    description: 'Passez 10 appels',
    icon: '📞',
    rarity: 'rare',
    category: 'communication',
    requirement: 10,
  },
  // Collaboration badges
  {
    id: 'team-player',
    name: 'Esprit d\'Équipe',
    description: 'Participez à 5 réunions',
    icon: '🤝',
    rarity: 'rare',
    category: 'collaboration',
    requirement: 5,
  },
  {
    id: 'meeting-master',
    name: 'Maître des Réunions',
    description: 'Participez à 50 réunions',
    icon: '🎥',
    rarity: 'epic',
    category: 'collaboration',
    requirement: 50,
  },
  // Productivity badges
  {
    id: 'networker',
    name: 'Networker',
    description: 'Ajoutez 10 contacts',
    icon: '👥',
    rarity: 'common',
    category: 'productivity',
    requirement: 10,
  },
  {
    id: 'super-networker',
    name: 'Super Networker',
    description: 'Ajoutez 100 contacts',
    icon: '🌐',
    rarity: 'epic',
    category: 'productivity',
    requirement: 100,
  },
  {
    id: 'document-pro',
    name: 'Pro des Documents',
    description: 'Traitez 25 documents',
    icon: '📄',
    rarity: 'rare',
    category: 'productivity',
    requirement: 25,
  },
  // Exploration badges
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Utilisez tous les modules',
    icon: '🧭',
    rarity: 'rare',
    category: 'exploration',
    requirement: 5,
  },
  // Milestone badges
  {
    id: 'streak-3',
    name: 'Régulier',
    description: '3 jours consécutifs d\'activité',
    icon: '🔥',
    rarity: 'common',
    category: 'milestone',
    requirement: 3,
  },
  {
    id: 'streak-7',
    name: 'Semaine Parfaite',
    description: '7 jours consécutifs d\'activité',
    icon: '⚡',
    rarity: 'rare',
    category: 'milestone',
    requirement: 7,
  },
  {
    id: 'streak-30',
    name: 'Inarrêtable',
    description: '30 jours consécutifs d\'activité',
    icon: '💎',
    rarity: 'legendary',
    category: 'milestone',
    requirement: 30,
  },
  {
    id: 'level-5',
    name: 'Vétéran',
    description: 'Atteignez le niveau 5',
    icon: '⭐',
    rarity: 'epic',
    category: 'milestone',
    requirement: 5,
  },
  {
    id: 'level-10',
    name: 'Légende',
    description: 'Atteignez le niveau 10',
    icon: '👑',
    rarity: 'legendary',
    category: 'milestone',
    requirement: 10,
  },
];

const DEFAULT_STATS: UserStats = {
  messagesSent: 0,
  callsMade: 0,
  meetingsJoined: 0,
  contactsAdded: 0,
  documentsProcessed: 0,
  daysActive: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  level: 1,
};

export function useGamification() {
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
  const [celebrationBadge, setCelebrationBadge] = useState<Badge | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Use mock data for demo
        setStats({
          messagesSent: 47,
          callsMade: 8,
          meetingsJoined: 12,
          contactsAdded: 23,
          documentsProcessed: 15,
          daysActive: 14,
          currentStreak: 5,
          longestStreak: 7,
          totalPoints: 850,
          level: 3,
        });
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch stats
      const { data: statsData } = await supabase
        .from('user_gamification_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsData) {
        setStats({
          messagesSent: statsData.messages_sent,
          callsMade: statsData.calls_made,
          meetingsJoined: statsData.meetings_joined,
          contactsAdded: statsData.contacts_added,
          documentsProcessed: statsData.documents_processed,
          daysActive: statsData.days_active,
          currentStreak: statsData.current_streak,
          longestStreak: statsData.longest_streak,
          totalPoints: statsData.total_points,
          level: statsData.level,
        });
      } else {
        // Create initial stats
        await supabase.from('user_gamification_stats').insert({
          user_id: user.id,
          ...DEFAULT_STATS,
        });
      }

      // Fetch unlocked badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('badge_id, celebrated')
        .eq('user_id', user.id);

      if (badgesData) {
        const ids = new Set(badgesData.map(b => b.badge_id));
        setUnlockedBadgeIds(ids);

        // Check for uncelebrated badges
        const uncelebrated = badgesData.find(b => !b.celebrated);
        if (uncelebrated) {
          const badgeDef = BADGE_DEFINITIONS.find(d => d.id === uncelebrated.badge_id);
          if (badgeDef) {
            const badge: Badge = {
              ...badgeDef,
              progress: badgeDef.requirement,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
            setCelebrationBadge(badge);
          }
        }
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // Calculate badges with current progress
  const badges = useMemo((): Badge[] => {
    return BADGE_DEFINITIONS.map(badgeDef => {
      let progress = 0;

      switch (badgeDef.id) {
        case 'first-message':
        case 'chatterbox':
        case 'master-communicator':
          progress = stats.messagesSent;
          break;
        case 'voice-hero':
          progress = stats.callsMade;
          break;
        case 'team-player':
        case 'meeting-master':
          progress = stats.meetingsJoined;
          break;
        case 'networker':
        case 'super-networker':
          progress = stats.contactsAdded;
          break;
        case 'document-pro':
          progress = stats.documentsProcessed;
          break;
        case 'streak-3':
        case 'streak-7':
        case 'streak-30':
          progress = stats.currentStreak;
          break;
        case 'level-5':
        case 'level-10':
          progress = stats.level;
          break;
        case 'explorer':
          progress = 4;
          break;
      }

      const unlocked = unlockedBadgeIds.has(badgeDef.id) || progress >= badgeDef.requirement;

      return {
        ...badgeDef,
        progress: Math.min(progress, badgeDef.requirement),
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : undefined,
      };
    });
  }, [stats, unlockedBadgeIds]);

  const unlockedBadges = useMemo(() => badges.filter(b => b.unlocked), [badges]);
  const lockedBadges = useMemo(() => badges.filter(b => !b.unlocked), [badges]);

  const nextLevelPoints = useMemo(() => {
    return LEVEL_THRESHOLDS[stats.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }, [stats.level]);

  const currentLevelPoints = useMemo(() => {
    return LEVEL_THRESHOLDS[stats.level - 1] || 0;
  }, [stats.level]);

  const levelProgress = useMemo(() => {
    const pointsInLevel = stats.totalPoints - currentLevelPoints;
    const pointsNeeded = nextLevelPoints - currentLevelPoints;
    return Math.min((pointsInLevel / pointsNeeded) * 100, 100);
  }, [stats.totalPoints, currentLevelPoints, nextLevelPoints]);

  // Sync stats to database
  const syncStats = useCallback(async (newStats: UserStats) => {
    if (!userId) return;

    await supabase
      .from('user_gamification_stats')
      .update({
        messages_sent: newStats.messagesSent,
        calls_made: newStats.callsMade,
        meetings_joined: newStats.meetingsJoined,
        contacts_added: newStats.contactsAdded,
        documents_processed: newStats.documentsProcessed,
        days_active: newStats.daysActive,
        current_streak: newStats.currentStreak,
        longest_streak: newStats.longestStreak,
        total_points: newStats.totalPoints,
        level: newStats.level,
        last_active_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', userId);
  }, [userId]);

  // Check and unlock new badges
  const checkBadgeUnlocks = useCallback(async (newStats: UserStats) => {
    for (const badgeDef of BADGE_DEFINITIONS) {
      if (unlockedBadgeIds.has(badgeDef.id)) continue;

      let progress = 0;
      switch (badgeDef.id) {
        case 'first-message':
        case 'chatterbox':
        case 'master-communicator':
          progress = newStats.messagesSent;
          break;
        case 'voice-hero':
          progress = newStats.callsMade;
          break;
        case 'team-player':
        case 'meeting-master':
          progress = newStats.meetingsJoined;
          break;
        case 'networker':
        case 'super-networker':
          progress = newStats.contactsAdded;
          break;
        case 'document-pro':
          progress = newStats.documentsProcessed;
          break;
        case 'streak-3':
        case 'streak-7':
        case 'streak-30':
          progress = newStats.currentStreak;
          break;
        case 'level-5':
        case 'level-10':
          progress = newStats.level;
          break;
      }

      if (progress >= badgeDef.requirement) {
        // Unlock badge!
        const newBadge: Badge = {
          ...badgeDef,
          progress: badgeDef.requirement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };

        setUnlockedBadgeIds(prev => new Set([...prev, badgeDef.id]));
        
        // Show celebration
        setCelebrationBadge(newBadge);

        // Show toast
        toast({
          title: "🎉 Badge débloqué !",
          description: `${badgeDef.icon} ${badgeDef.name}`,
        });

        // Save to database
        if (userId) {
          await supabase.from('user_badges').insert({
            user_id: userId,
            badge_id: badgeDef.id,
            celebrated: false,
          });
        }
      }
    }
  }, [unlockedBadgeIds, userId, toast]);

  const addPoints = useCallback(async (points: number) => {
    setStats(prev => {
      const newTotal = prev.totalPoints + points;
      let newLevel = prev.level;

      while (newLevel < LEVEL_THRESHOLDS.length && newTotal >= LEVEL_THRESHOLDS[newLevel]) {
        newLevel++;
      }

      const newStats = {
        ...prev,
        totalPoints: newTotal,
        level: newLevel,
      };

      // Sync to database
      syncStats(newStats);
      checkBadgeUnlocks(newStats);

      return newStats;
    });
  }, [syncStats, checkBadgeUnlocks]);

  const incrementStat = useCallback(async (stat: keyof UserStats, amount: number = 1) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        [stat]: (prev[stat] as number) + amount,
        totalPoints: prev.totalPoints + amount * 10,
      };

      // Check level up
      let newLevel = newStats.level;
      while (newLevel < LEVEL_THRESHOLDS.length && newStats.totalPoints >= LEVEL_THRESHOLDS[newLevel]) {
        newLevel++;
      }
      newStats.level = newLevel;

      // Sync to database
      syncStats(newStats);
      checkBadgeUnlocks(newStats);

      return newStats;
    });
  }, [syncStats, checkBadgeUnlocks]);

  const dismissCelebration = useCallback(async () => {
    if (celebrationBadge && userId) {
      // Mark as celebrated
      await supabase
        .from('user_badges')
        .update({ celebrated: true })
        .eq('user_id', userId)
        .eq('badge_id', celebrationBadge.id);
    }
    setCelebrationBadge(null);
  }, [celebrationBadge, userId]);

  const getBadgesByCategory = useCallback((category: BadgeCategory) => {
    return badges.filter(b => b.category === category);
  }, [badges]);

  return {
    stats,
    badges,
    unlockedBadges,
    lockedBadges,
    celebrationBadge,
    levelProgress,
    nextLevelPoints,
    currentLevelPoints,
    incrementStat,
    addPoints,
    dismissCelebration,
    getBadgesByCategory,
    isLoading,
    userId,
  };
}