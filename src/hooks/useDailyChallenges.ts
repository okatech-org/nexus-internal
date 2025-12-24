import { useState, useCallback, useMemo, useEffect } from 'react';
import { DailyChallenge, CHALLENGE_TEMPLATES, ChallengeType } from '@/types/challenges';
import { useToast } from '@/hooks/use-toast';

function generateDailyChallenges(): DailyChallenge[] {
  const today = new Date();
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Use date as seed for consistent daily selection
  const seed = today.toISOString().split('T')[0];
  const shuffled = [...CHALLENGE_TEMPLATES].sort((a, b) => {
    const hashA = (seed + a.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hashB = (seed + b.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hashA - hashB;
  });
  
  // Select 3 challenges: 1 easy, 1 medium, 1 hard
  const easy = shuffled.find(c => c.difficulty === 'easy')!;
  const medium = shuffled.find(c => c.difficulty === 'medium')!;
  const hard = shuffled.find(c => c.difficulty === 'hard')!;
  
  return [easy, medium, hard].map((template, index) => ({
    ...template,
    id: `daily-${seed}-${index}`,
    progress: 0,
    completed: false,
    expiresAt: endOfDay.toISOString(),
  }));
}

export function useDailyChallenges() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  // Initialize and refresh challenges
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem('challenges_date');
    const storedChallenges = localStorage.getItem('daily_challenges');
    
    if (storedDate === today && storedChallenges) {
      setChallenges(JSON.parse(storedChallenges));
    } else {
      const newChallenges = generateDailyChallenges();
      setChallenges(newChallenges);
      localStorage.setItem('challenges_date', today);
      localStorage.setItem('daily_challenges', JSON.stringify(newChallenges));
    }
    setLastRefresh(today);
  }, []);

  // Save to localStorage when challenges change
  useEffect(() => {
    if (challenges.length > 0) {
      localStorage.setItem('daily_challenges', JSON.stringify(challenges));
    }
  }, [challenges]);

  const updateProgress = useCallback((type: ChallengeType, amount: number = 1) => {
    setChallenges(prev => {
      const updated = prev.map(challenge => {
        if (challenge.type !== type || challenge.completed) return challenge;
        
        const newProgress = Math.min(challenge.progress + amount, challenge.requirement);
        const justCompleted = newProgress >= challenge.requirement && !challenge.completed;
        
        if (justCompleted) {
          toast({
            title: "🎯 Défi accompli !",
            description: `${challenge.icon} ${challenge.title} - +${challenge.reward} points`,
          });
        }
        
        return {
          ...challenge,
          progress: newProgress,
          completed: newProgress >= challenge.requirement,
        };
      });
      
      return updated;
    });
  }, [toast]);

  const completedCount = useMemo(() => 
    challenges.filter(c => c.completed).length, 
    [challenges]
  );

  const totalReward = useMemo(() => 
    challenges.reduce((sum, c) => sum + c.reward, 0),
    [challenges]
  );

  const earnedReward = useMemo(() => 
    challenges.filter(c => c.completed).reduce((sum, c) => sum + c.reward, 0),
    [challenges]
  );

  const timeRemaining = useMemo(() => {
    if (challenges.length === 0) return '';
    const expires = new Date(challenges[0].expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [challenges]);

  const claimBonus = useCallback(() => {
    if (completedCount === challenges.length && challenges.length > 0) {
      toast({
        title: "🏆 Bonus journalier !",
        description: "+100 points bonus pour avoir terminé tous les défis !",
      });
      return 100; // Bonus points
    }
    return 0;
  }, [completedCount, challenges.length, toast]);

  return {
    challenges,
    updateProgress,
    completedCount,
    totalChallenges: challenges.length,
    totalReward,
    earnedReward,
    timeRemaining,
    claimBonus,
    allCompleted: completedCount === challenges.length && challenges.length > 0,
  };
}