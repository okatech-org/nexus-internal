import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Gift, CheckCircle2, X, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DailyChallenge, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/types/challenges';
import { cn } from '@/lib/utils';

interface DailyChallengesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: DailyChallenge[];
  completedCount: number;
  totalChallenges: number;
  earnedReward: number;
  totalReward: number;
  timeRemaining: string;
  allCompleted: boolean;
  onClaimBonus: () => number;
}

function ChallengeCard({ challenge }: { challenge: DailyChallenge }) {
  const colors = DIFFICULTY_COLORS[challenge.difficulty];
  const progressPercent = (challenge.progress / challenge.requirement) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border transition-all",
        challenge.completed 
          ? "bg-success/10 border-success/30" 
          : "bg-background/50 border-border/50 hover:border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
          challenge.completed ? "bg-success/20" : colors.bg
        )}>
          {challenge.completed ? '✅' : challenge.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              "font-medium",
              challenge.completed ? "text-success" : "text-foreground"
            )}>
              {challenge.title}
            </h4>
            <Badge 
              variant="outline" 
              className={cn("text-xs", colors.border, colors.text)}
            >
              {DIFFICULTY_LABELS[challenge.difficulty]}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {challenge.description}
          </p>
          
          {!challenge.completed && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progression</span>
                <span className={colors.text}>
                  {challenge.progress}/{challenge.requirement}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
          
          {challenge.completed && (
            <div className="flex items-center gap-1 text-success text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Complété !</span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className={cn(
            "flex items-center gap-1 font-bold",
            challenge.completed ? "text-success" : colors.text
          )}>
            <Star className="w-4 h-4" />
            +{challenge.reward}
          </div>
          <span className="text-xs text-muted-foreground">points</span>
        </div>
      </div>
    </motion.div>
  );
}

export function DailyChallengesPanel({
  isOpen,
  onClose,
  challenges,
  completedCount,
  totalChallenges,
  earnedReward,
  totalReward,
  timeRemaining,
  allCompleted,
  onClaimBonus,
}: DailyChallengesPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass border-l border-border/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Défis du Jour</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Expire dans {timeRemaining}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-foreground">
                      {completedCount}/{totalChallenges} défis
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Gift className="w-4 h-4" />
                    <span className="font-bold">{earnedReward}/{totalReward}</span>
                  </div>
                </div>
                <Progress 
                  value={(completedCount / totalChallenges) * 100} 
                  className="h-2"
                />
                
                {allCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      onClick={onClaimBonus}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Réclamer le bonus +100 pts
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Challenges List */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {challenges.map((challenge, index) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                  />
                ))}
              </div>
              
              {/* Tip */}
              <div className="mt-6 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    Complétez les 3 défis pour recevoir un bonus de 100 points supplémentaires !
                  </span>
                </p>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}