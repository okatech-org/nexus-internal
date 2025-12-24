export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeCategory = 
  | 'communication' 
  | 'collaboration' 
  | 'productivity' 
  | 'exploration' 
  | 'milestone';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  messagesSent: number;
  callsMade: number;
  meetingsJoined: number;
  contactsAdded: number;
  documentsProcessed: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
}

export interface Achievement {
  badge: Badge;
  celebrationShown: boolean;
}

export const BADGE_COLORS: Record<BadgeRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/50',
    text: 'text-slate-400',
    glow: '',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/40',
  },
};

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
