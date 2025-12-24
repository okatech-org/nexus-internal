import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'weekly_rewards_data';

interface WeeklyRewardsData {
  claimedRewards: string[];
  challengeStreak: number;
  completedChallengesThisWeek: number;
  lastCompletedDate: string | null;
  weekStartDate: string;
}

function getWeekStartDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getDefaultData(): WeeklyRewardsData {
  return {
    claimedRewards: [],
    challengeStreak: 0,
    completedChallengesThisWeek: 0,
    lastCompletedDate: null,
    weekStartDate: getWeekStartDate(),
  };
}

export function useWeeklyRewards(onAddPoints: (points: number) => void) {
  const [data, setData] = useState<WeeklyRewardsData>(getDefaultData);

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as WeeklyRewardsData;
        const currentWeekStart = getWeekStartDate();
        
        // Reset if it's a new week
        if (parsed.weekStartDate !== currentWeekStart) {
          const newData = {
            ...getDefaultData(),
            challengeStreak: parsed.challengeStreak, // Keep streak across weeks
          };
          setData(newData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        } else {
          setData(parsed);
        }
      } catch {
        setData(getDefaultData());
      }
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((newData: WeeklyRewardsData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  // Record that all daily challenges were completed today
  const recordDailyCompletion = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    setData((prev) => {
      if (prev.lastCompletedDate === today) {
        return prev; // Already recorded today
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if streak continues
      const newStreak = prev.lastCompletedDate === yesterdayStr 
        ? prev.challengeStreak + 1 
        : 1;

      const newData = {
        ...prev,
        challengeStreak: newStreak,
        completedChallengesThisWeek: prev.completedChallengesThisWeek + 3, // 3 challenges per day
        lastCompletedDate: today,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      
      if (newStreak > 1) {
        toast.success(`🔥 Série de ${newStreak} jours !`, {
          description: 'Continuez pour débloquer des récompenses bonus',
        });
      }

      return newData;
    });
  }, []);

  // Claim a weekly reward
  const claimReward = useCallback((rewardId: string, points: number) => {
    setData((prev) => {
      if (prev.claimedRewards.includes(rewardId)) {
        return prev;
      }

      const newData = {
        ...prev,
        claimedRewards: [...prev.claimedRewards, rewardId],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      
      // Add points
      onAddPoints(points);
      
      toast.success('🎁 Récompense réclamée !', {
        description: `+${points} points bonus ajoutés`,
      });

      return newData;
    });
  }, [onAddPoints]);

  return {
    challengeStreak: data.challengeStreak,
    completedChallengesThisWeek: data.completedChallengesThisWeek,
    claimedRewards: data.claimedRewards,
    recordDailyCompletion,
    claimReward,
  };
}
