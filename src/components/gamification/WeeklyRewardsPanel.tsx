import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Star, Trophy, Flame, Crown, Sparkles, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

interface WeeklyReward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  pointsBonus: number;
  daysRequired: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface WeeklyRewardsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  completedChallengesThisWeek: number;
  onClaimReward: (rewardId: string, points: number) => void;
  claimedRewards: string[];
}

const WEEKLY_REWARDS: WeeklyReward[] = [
  {
    id: 'week_starter',
    name: 'Démarrage en force',
    description: 'Complétez tous les défis pendant 1 jour',
    icon: <Star className="w-6 h-6" />,
    pointsBonus: 50,
    daysRequired: 1,
    rarity: 'common',
  },
  {
    id: 'week_momentum',
    name: 'Sur la lancée',
    description: 'Complétez tous les défis pendant 3 jours',
    icon: <Flame className="w-6 h-6" />,
    pointsBonus: 150,
    daysRequired: 3,
    rarity: 'rare',
  },
  {
    id: 'week_dedicated',
    name: 'Dédié',
    description: 'Complétez tous les défis pendant 5 jours',
    icon: <Trophy className="w-6 h-6" />,
    pointsBonus: 300,
    daysRequired: 5,
    rarity: 'epic',
  },
  {
    id: 'week_champion',
    name: 'Champion de la semaine',
    description: 'Complétez TOUS les défis pendant 7 jours consécutifs',
    icon: <Crown className="w-6 h-6" />,
    pointsBonus: 500,
    daysRequired: 7,
    rarity: 'legendary',
  },
];

const rarityColors = {
  common: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/50',
    text: 'text-slate-400',
    gradient: 'from-slate-500/20 to-slate-600/20',
  },
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
};

function RewardCard({
  reward,
  currentStreak,
  isClaimed,
  onClaim,
}: {
  reward: WeeklyReward;
  currentStreak: number;
  isClaimed: boolean;
  onClaim: () => void;
}) {
  const colors = rarityColors[reward.rarity];
  const isUnlocked = currentStreak >= reward.daysRequired;
  const canClaim = isUnlocked && !isClaimed;
  const progress = Math.min((currentStreak / reward.daysRequired) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: canClaim ? 1.02 : 1 }}
    >
      <Card
        className={`p-4 relative overflow-hidden transition-all ${colors.border} ${
          isClaimed ? 'opacity-60' : ''
        } ${canClaim ? 'cursor-pointer hover:shadow-lg' : ''}`}
        onClick={canClaim ? onClaim : undefined}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50`} />
        
        {/* Claimed overlay */}
        {isClaimed && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-green-500/20 text-green-500 px-3 py-1 rounded-full">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Réclamé</span>
            </div>
          </div>
        )}

        {/* Locked overlay */}
        {!isUnlocked && !isClaimed && (
          <div className="absolute inset-0 bg-background/30 flex items-center justify-center z-10">
            <Lock className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}

        <div className="relative z-0">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <div className={colors.text}>{reward.icon}</div>
            </div>
            <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
              +{reward.pointsBonus} pts
            </Badge>
          </div>

          <h3 className="font-semibold mb-1">{reward.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>

          {!isClaimed && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progression</span>
                <span className={colors.text}>
                  {Math.min(currentStreak, reward.daysRequired)}/{reward.daysRequired} jours
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {canClaim && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 hover:opacity-100 transition-opacity"
              whileHover={{ opacity: 1 }}
            >
              <Button className="gap-2">
                <Gift className="w-4 h-4" />
                Réclamer
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function WeeklyRewardsPanel({
  isOpen,
  onClose,
  currentStreak,
  completedChallengesThisWeek,
  onClaimReward,
  claimedRewards,
}: WeeklyRewardsPanelProps) {
  const totalAvailablePoints = useMemo(() => {
    return WEEKLY_REWARDS.filter(
      (r) => currentStreak >= r.daysRequired && !claimedRewards.includes(r.id)
    ).reduce((sum, r) => sum + r.pointsBonus, 0);
  }, [currentStreak, claimedRewards]);

  const totalClaimedPoints = useMemo(() => {
    return WEEKLY_REWARDS.filter((r) => claimedRewards.includes(r.id)).reduce(
      (sum, r) => sum + r.pointsBonus,
      0
    );
  }, [claimedRewards]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <Gift className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Récompenses hebdo</h2>
                    <p className="text-sm text-muted-foreground">Complétez les défis chaque jour</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Current Streak */}
              <Card className="p-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">🔥</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Série de défis complets</p>
                      <p className="text-3xl font-bold">{currentStreak} jours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cette semaine</p>
                    <p className="text-xl font-semibold">{completedChallengesThisWeek} défis</p>
                  </div>
                </div>
              </Card>

              {/* Points Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-500">{totalAvailablePoints}</p>
                  <p className="text-xs text-muted-foreground">pts à réclamer</p>
                </Card>
                <Card className="p-4 text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-500">{totalClaimedPoints}</p>
                  <p className="text-xs text-muted-foreground">pts réclamés</p>
                </Card>
              </div>

              {/* Rewards Grid */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Récompenses disponibles
                </h3>
                <div className="space-y-4">
                  {WEEKLY_REWARDS.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      currentStreak={currentStreak}
                      isClaimed={claimedRewards.includes(reward.id)}
                      onClaim={() => onClaimReward(reward.id, reward.pointsBonus)}
                    />
                  ))}
                </div>
              </div>

              {/* Tip */}
              <Card className="p-4 bg-muted/50 border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  💡 <strong>Astuce:</strong> Complétez tous vos défis quotidiens pour augmenter
                  votre série et débloquer des récompenses bonus !
                </p>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
