export type QuestRarity = 'rare' | 'epic' | 'legendary' | 'mythic';

export interface MonthlyQuest {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: QuestRarity;
  targetValue: number;
  currentValue: number;
  rewardPoints: number;
  rewardBadgeId?: string;
  expiresAt: string;
  completedAt?: string;
  claimed: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  points: number;
  messagesSent: number;
  callsMade: number;
  meetingsJoined: number;
  documentsProcessed: number;
  badgeCount: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export const QUEST_RARITY_COLORS: Record<QuestRarity, { bg: string; border: string; text: string; gradient: string }> = {
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/20',
  },
  legendary: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    gradient: 'from-amber-500/20 to-amber-600/20',
  },
  mythic: {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    gradient: 'from-rose-500/20 to-rose-600/20',
  },
};
