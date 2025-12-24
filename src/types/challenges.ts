export type ChallengeType = 
  | 'send_messages'
  | 'make_calls'
  | 'join_meetings'
  | 'add_contacts'
  | 'process_documents'
  | 'daily_login';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  difficulty: ChallengeDifficulty;
  requirement: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: string;
}

export const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'id' | 'progress' | 'completed' | 'expiresAt'>[] = [
  // Easy challenges
  {
    type: 'send_messages',
    title: 'Communicateur',
    description: 'Envoyez 5 messages',
    icon: '💬',
    difficulty: 'easy',
    requirement: 5,
    reward: 25,
  },
  {
    type: 'daily_login',
    title: 'Présent !',
    description: 'Connectez-vous aujourd\'hui',
    icon: '✅',
    difficulty: 'easy',
    requirement: 1,
    reward: 10,
  },
  {
    type: 'add_contacts',
    title: 'Réseau actif',
    description: 'Ajoutez 1 contact',
    icon: '👤',
    difficulty: 'easy',
    requirement: 1,
    reward: 20,
  },
  // Medium challenges
  {
    type: 'send_messages',
    title: 'Discussion active',
    description: 'Envoyez 15 messages',
    icon: '🗣️',
    difficulty: 'medium',
    requirement: 15,
    reward: 50,
  },
  {
    type: 'make_calls',
    title: 'En ligne',
    description: 'Passez 3 appels',
    icon: '📞',
    difficulty: 'medium',
    requirement: 3,
    reward: 60,
  },
  {
    type: 'join_meetings',
    title: 'Collaborateur',
    description: 'Participez à 2 réunions',
    icon: '🎥',
    difficulty: 'medium',
    requirement: 2,
    reward: 75,
  },
  {
    type: 'process_documents',
    title: 'Archiviste',
    description: 'Traitez 5 documents',
    icon: '📄',
    difficulty: 'medium',
    requirement: 5,
    reward: 50,
  },
  // Hard challenges
  {
    type: 'send_messages',
    title: 'Ultra communicant',
    description: 'Envoyez 50 messages',
    icon: '🎙️',
    difficulty: 'hard',
    requirement: 50,
    reward: 150,
  },
  {
    type: 'add_contacts',
    title: 'Super Networker',
    description: 'Ajoutez 5 contacts',
    icon: '🌐',
    difficulty: 'hard',
    requirement: 5,
    reward: 100,
  },
  {
    type: 'make_calls',
    title: 'Ligne chaude',
    description: 'Passez 10 appels',
    icon: '🔥',
    difficulty: 'hard',
    requirement: 10,
    reward: 200,
  },
];

export const DIFFICULTY_COLORS: Record<ChallengeDifficulty, { bg: string; text: string; border: string }> = {
  easy: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/50',
  },
  medium: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
  },
  hard: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/50',
  },
};

export const DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};