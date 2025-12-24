import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Star, Gift, Lock, Check, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MonthlyQuest, QUEST_RARITY_COLORS } from '@/types/monthly-quests';

interface MonthlyQuestsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  quests: MonthlyQuest[];
  onClaimReward: (questId: string) => void;
  timeRemaining: string;
  completedCount: number;
  claimableCount: number;
  totalRewardPoints: number;
  earnedRewardPoints: number;
}

function QuestCard({
  quest,
  onClaim,
}: {
  quest: MonthlyQuest;
  onClaim: () => void;
}) {
  const colors = QUEST_RARITY_COLORS[quest.rarity];
  const progress = (quest.currentValue / quest.targetValue) * 100;
  const isCompleted = !!quest.completedAt;
  const canClaim = isCompleted && !quest.claimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: canClaim ? 1.02 : 1 }}
    >
      <Card
        className={`p-4 relative overflow-hidden transition-all ${colors.border} ${
          quest.claimed ? 'opacity-60' : ''
        }`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50`} />

        {/* Claimed overlay */}
        {quest.claimed && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-green-500/20 text-green-500 px-3 py-1 rounded-full">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Réclamé</span>
            </div>
          </div>
        )}

        <div className="relative z-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-2xl`}>
                {quest.icon}
              </div>
              <div>
                <h3 className="font-semibold">{quest.name}</h3>
                <Badge variant="outline" className={`${colors.text} ${colors.border} text-xs`}>
                  {quest.rarity.charAt(0).toUpperCase() + quest.rarity.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{quest.rewardPoints}</span>
              </div>
              {quest.rewardBadgeId && (
                <div className="flex items-center gap-1 text-purple-400 text-xs mt-1">
                  <Award className="w-3 h-3" />
                  <span>+ Badge</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>

          {!quest.claimed && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progression</span>
                <span className={isCompleted ? 'text-green-500' : colors.text}>
                  {quest.currentValue}/{quest.targetValue}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {canClaim && (
            <Button
              className="w-full mt-4 gap-2"
              onClick={onClaim}
            >
              <Gift className="w-4 h-4" />
              Réclamer la récompense
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function MonthlyQuestsPanel({
  isOpen,
  onClose,
  quests,
  onClaimReward,
  timeRemaining,
  completedCount,
  claimableCount,
  totalRewardPoints,
  earnedRewardPoints,
}: MonthlyQuestsPanelProps) {
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
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Quêtes Mensuelles</h2>
                    <p className="text-sm text-muted-foreground">{timeRemaining}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Summary */}
              <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quêtes complétées</p>
                    <p className="text-3xl font-bold">{completedCount}/{quests.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Points gagnés</p>
                    <p className="text-2xl font-bold text-amber-500">{earnedRewardPoints}</p>
                    <p className="text-xs text-muted-foreground">sur {totalRewardPoints} possibles</p>
                  </div>
                </div>
                {claimableCount > 0 && (
                  <div className="mt-3 flex items-center gap-2 bg-green-500/20 text-green-500 px-3 py-2 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {claimableCount} récompense{claimableCount > 1 ? 's' : ''} à réclamer !
                    </span>
                  </div>
                )}
              </Card>

              {/* Quests List */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Objectifs du mois
                </h3>
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onClaim={() => onClaimReward(quest.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Tip */}
              <Card className="p-4 bg-muted/50 border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  🌟 <strong>Astuce:</strong> Les quêtes mythiques offrent des badges exclusifs
                  et des récompenses exceptionnelles !
                </p>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
