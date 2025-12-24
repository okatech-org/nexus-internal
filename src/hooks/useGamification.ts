import { useState, useCallback, useMemo } from 'react';
import { Badge, UserStats, BadgeCategory, LEVEL_THRESHOLDS } from '@/types/gamification';

const INITIAL_BADGES: Badge[] = [
  // Communication badges
  {
    id: 'first-message',
    name: 'Premier Pas',
    description: 'Envoyez votre premier message',
    icon: '💬',
    rarity: 'common',
    category: 'communication',
    requirement: 1,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'chatterbox',
    name: 'Bavard',
    description: 'Envoyez 50 messages',
    icon: '🗣️',
    rarity: 'rare',
    category: 'communication',
    requirement: 50,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'master-communicator',
    name: 'Maître Communicateur',
    description: 'Envoyez 500 messages',
    icon: '🎙️',
    rarity: 'epic',
    category: 'communication',
    requirement: 500,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'voice-hero',
    name: 'Héros Vocal',
    description: 'Passez 10 appels',
    icon: '📞',
    rarity: 'rare',
    category: 'communication',
    requirement: 10,
    progress: 0,
    unlocked: false,
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
    progress: 0,
    unlocked: false,
  },
  {
    id: 'meeting-master',
    name: 'Maître des Réunions',
    description: 'Participez à 50 réunions',
    icon: '🎥',
    rarity: 'epic',
    category: 'collaboration',
    requirement: 50,
    progress: 0,
    unlocked: false,
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
    progress: 0,
    unlocked: false,
  },
  {
    id: 'super-networker',
    name: 'Super Networker',
    description: 'Ajoutez 100 contacts',
    icon: '🌐',
    rarity: 'epic',
    category: 'productivity',
    requirement: 100,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'document-pro',
    name: 'Pro des Documents',
    description: 'Traitez 25 documents',
    icon: '📄',
    rarity: 'rare',
    category: 'productivity',
    requirement: 25,
    progress: 0,
    unlocked: false,
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
    progress: 0,
    unlocked: false,
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
    progress: 0,
    unlocked: false,
  },
  {
    id: 'streak-7',
    name: 'Semaine Parfaite',
    description: '7 jours consécutifs d\'activité',
    icon: '⚡',
    rarity: 'rare',
    category: 'milestone',
    requirement: 7,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'streak-30',
    name: 'Inarrêtable',
    description: '30 jours consécutifs d\'activité',
    icon: '💎',
    rarity: 'legendary',
    category: 'milestone',
    requirement: 30,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'level-5',
    name: 'Vétéran',
    description: 'Atteignez le niveau 5',
    icon: '⭐',
    rarity: 'epic',
    category: 'milestone',
    requirement: 5,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'level-10',
    name: 'Légende',
    description: 'Atteignez le niveau 10',
    icon: '👑',
    rarity: 'legendary',
    category: 'milestone',
    requirement: 10,
    progress: 0,
    unlocked: false,
  },
];

// Simulated initial stats
const INITIAL_STATS: UserStats = {
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
};

export function useGamification() {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [newUnlock, setNewUnlock] = useState<Badge | null>(null);

  // Calculate badges with current progress
  const badges = useMemo((): Badge[] => {
    return INITIAL_BADGES.map(badge => {
      let progress = 0;
      let unlocked = false;

      switch (badge.id) {
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
          // Simplified: count of modules used
          progress = 4;
          break;
      }

      unlocked = progress >= badge.requirement;

      return {
        ...badge,
        progress: Math.min(progress, badge.requirement),
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : undefined,
      };
    });
  }, [stats]);

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

  const addPoints = useCallback((points: number) => {
    setStats(prev => {
      const newTotal = prev.totalPoints + points;
      let newLevel = prev.level;
      
      // Check for level up
      while (newLevel < LEVEL_THRESHOLDS.length && newTotal >= LEVEL_THRESHOLDS[newLevel]) {
        newLevel++;
      }
      
      return {
        ...prev,
        totalPoints: newTotal,
        level: newLevel,
      };
    });
  }, []);

  const incrementStat = useCallback((stat: keyof UserStats, amount: number = 1) => {
    setStats(prev => ({
      ...prev,
      [stat]: (prev[stat] as number) + amount,
    }));
    addPoints(amount * 10);
  }, [addPoints]);

  const dismissNewUnlock = useCallback(() => {
    setNewUnlock(null);
  }, []);

  const getBadgesByCategory = useCallback((category: BadgeCategory) => {
    return badges.filter(b => b.category === category);
  }, [badges]);

  return {
    stats,
    badges,
    unlockedBadges,
    lockedBadges,
    newUnlock,
    levelProgress,
    nextLevelPoints,
    currentLevelPoints,
    incrementStat,
    addPoints,
    dismissNewUnlock,
    getBadgesByCategory,
  };
}
