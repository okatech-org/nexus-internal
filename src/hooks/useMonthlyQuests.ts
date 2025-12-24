import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { MonthlyQuest } from '@/types/monthly-quests';

const STORAGE_KEY = 'monthly_quests_data';

interface MonthlyQuestsData {
  quests: MonthlyQuest[];
  monthKey: string;
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthEndDate(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return lastDay.toISOString();
}

function generateMonthlyQuests(): MonthlyQuest[] {
  const expiresAt = getMonthEndDate();
  
  return [
    {
      id: 'communicator_master',
      name: 'Maître Communicateur',
      description: 'Envoyez 500 messages ce mois-ci',
      icon: '💬',
      rarity: 'rare',
      targetValue: 500,
      currentValue: 0,
      rewardPoints: 1000,
      expiresAt,
      claimed: false,
    },
    {
      id: 'call_champion',
      name: 'Champion des Appels',
      description: 'Passez 100 appels ce mois-ci',
      icon: '📞',
      rarity: 'epic',
      targetValue: 100,
      currentValue: 0,
      rewardPoints: 1500,
      rewardBadgeId: 'call_master',
      expiresAt,
      claimed: false,
    },
    {
      id: 'meeting_legend',
      name: 'Légende des Réunions',
      description: 'Participez à 50 réunions ce mois-ci',
      icon: '🎥',
      rarity: 'legendary',
      targetValue: 50,
      currentValue: 0,
      rewardPoints: 2000,
      rewardBadgeId: 'meeting_master',
      expiresAt,
      claimed: false,
    },
    {
      id: 'document_titan',
      name: 'Titan des Documents',
      description: 'Traitez 200 documents ce mois-ci',
      icon: '📄',
      rarity: 'epic',
      targetValue: 200,
      currentValue: 0,
      rewardPoints: 1500,
      expiresAt,
      claimed: false,
    },
    {
      id: 'network_architect',
      name: 'Architecte du Réseau',
      description: 'Ajoutez 30 nouveaux contacts ce mois-ci',
      icon: '🌐',
      rarity: 'rare',
      targetValue: 30,
      currentValue: 0,
      rewardPoints: 800,
      expiresAt,
      claimed: false,
    },
    {
      id: 'consistency_god',
      name: 'Dieu de la Constance',
      description: 'Connectez-vous 25 jours ce mois-ci',
      icon: '⚡',
      rarity: 'mythic',
      targetValue: 25,
      currentValue: 0,
      rewardPoints: 3000,
      rewardBadgeId: 'legendary_consistency',
      expiresAt,
      claimed: false,
    },
  ];
}

export function useMonthlyQuests(onAddPoints: (points: number) => void) {
  const [quests, setQuests] = useState<MonthlyQuest[]>([]);

  // Load quests from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentMonthKey = getMonthKey();
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MonthlyQuestsData;
        
        // Reset if it's a new month
        if (parsed.monthKey !== currentMonthKey) {
          const newQuests = generateMonthlyQuests();
          setQuests(newQuests);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: newQuests, monthKey: currentMonthKey }));
        } else {
          setQuests(parsed.quests);
        }
      } catch {
        const newQuests = generateMonthlyQuests();
        setQuests(newQuests);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: newQuests, monthKey: currentMonthKey }));
      }
    } else {
      const newQuests = generateMonthlyQuests();
      setQuests(newQuests);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: newQuests, monthKey: currentMonthKey }));
    }
  }, []);

  // Save quests to localStorage
  const saveQuests = useCallback((newQuests: MonthlyQuest[]) => {
    setQuests(newQuests);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: newQuests, monthKey: getMonthKey() }));
  }, []);

  // Update quest progress based on stat type
  const updateQuestProgress = useCallback((statType: string, amount: number = 1) => {
    setQuests((prev) => {
      const questMapping: Record<string, string> = {
        messagesSent: 'communicator_master',
        callsMade: 'call_champion',
        meetingsJoined: 'meeting_legend',
        documentsProcessed: 'document_titan',
        contactsAdded: 'network_architect',
        daysActive: 'consistency_god',
      };

      const questId = questMapping[statType];
      if (!questId) return prev;

      const updated = prev.map((quest) => {
        if (quest.id === questId && !quest.completedAt) {
          const newValue = Math.min(quest.currentValue + amount, quest.targetValue);
          const justCompleted = newValue >= quest.targetValue && quest.currentValue < quest.targetValue;

          if (justCompleted) {
            toast.success(`🎯 Quête mensuelle complétée !`, {
              description: `${quest.name} - Réclamez votre récompense !`,
            });
          }

          return {
            ...quest,
            currentValue: newValue,
            completedAt: justCompleted ? new Date().toISOString() : undefined,
          };
        }
        return quest;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: updated, monthKey: getMonthKey() }));
      return updated;
    });
  }, []);

  // Claim a quest reward
  const claimQuestReward = useCallback((questId: string) => {
    setQuests((prev) => {
      const quest = prev.find((q) => q.id === questId);
      if (!quest || quest.claimed || !quest.completedAt) return prev;

      onAddPoints(quest.rewardPoints);

      toast.success('🎁 Récompense réclamée !', {
        description: `+${quest.rewardPoints} points${quest.rewardBadgeId ? ' + Badge exclusif' : ''}`,
      });

      const updated = prev.map((q) =>
        q.id === questId ? { ...q, claimed: true } : q
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests: updated, monthKey: getMonthKey() }));
      return updated;
    });
  }, [onAddPoints]);

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (quests.length === 0) return '';
    
    const expiresAt = new Date(quests[0].expiresAt);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}j ${hours}h restants`;
    return `${hours}h restantes`;
  }, [quests]);

  const completedCount = quests.filter((q) => q.completedAt).length;
  const claimableCount = quests.filter((q) => q.completedAt && !q.claimed).length;
  const totalRewardPoints = quests.reduce((sum, q) => sum + q.rewardPoints, 0);
  const earnedRewardPoints = quests.filter((q) => q.claimed).reduce((sum, q) => sum + q.rewardPoints, 0);

  return {
    quests,
    updateQuestProgress,
    claimQuestReward,
    timeRemaining,
    completedCount,
    claimableCount,
    totalRewardPoints,
    earnedRewardPoints,
  };
}
