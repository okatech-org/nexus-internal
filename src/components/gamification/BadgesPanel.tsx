import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Lock, ChevronRight, X, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge, UserStats, BADGE_COLORS, BadgeCategory } from '@/types/gamification';
import { cn } from '@/lib/utils';

interface BadgesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  stats: UserStats;
  levelProgress: number;
  unlockedCount: number;
}

const categoryLabels: Record<BadgeCategory, string> = {
  communication: 'Communication',
  collaboration: 'Collaboration',
  productivity: 'Productivité',
  exploration: 'Exploration',
  milestone: 'Jalons',
};

const categoryIcons: Record<BadgeCategory, string> = {
  communication: '💬',
  collaboration: '🤝',
  productivity: '⚡',
  exploration: '🧭',
  milestone: '🏆',
};

function BadgeCard({ badge }: { badge: Badge }) {
  const colors = BADGE_COLORS[badge.rarity];
  const progressPercent = (badge.progress / badge.requirement) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all",
        colors.bg,
        colors.border,
        badge.unlocked ? `shadow-lg ${colors.glow}` : "opacity-70"
      )}
    >
      {!badge.unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
          badge.unlocked ? "" : "grayscale"
        )}>
          {badge.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn("font-medium", colors.text)}>{badge.name}</h4>
            <BadgeUI 
              variant="outline" 
              className={cn("text-xs capitalize", colors.border, colors.text)}
            >
              {badge.rarity}
            </BadgeUI>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
          
          {!badge.unlocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progression</span>
                <span className={colors.text}>{badge.progress}/{badge.requirement}</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
          
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-xs text-muted-foreground">
              Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function BadgesPanel({ 
  isOpen, 
  onClose, 
  badges, 
  stats, 
  levelProgress,
  unlockedCount 
}: BadgesPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | BadgeCategory>('all');

  const filteredBadges = activeTab === 'all' 
    ? badges 
    : badges.filter(b => b.category === activeTab);

  const categories: ('all' | BadgeCategory)[] = [
    'all', 'communication', 'collaboration', 'productivity', 'exploration', 'milestone'
  ];

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
            className="fixed right-0 top-0 h-full w-full max-w-lg glass border-l border-border/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Badges & Succès</h2>
                    <p className="text-sm text-muted-foreground">
                      {unlockedCount}/{badges.length} débloqués
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* User Level Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Niveau {stats.level}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalPoints} points
                  </span>
                </div>
                <Progress value={levelProgress} className="h-2 mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Prochain niveau</span>
                  <span>{Math.round(levelProgress)}%</span>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-background/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-foreground">{stats.currentStreak}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Série active</span>
                </div>
                <div className="p-3 rounded-lg bg-background/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-foreground">{stats.daysActive}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Jours actifs</span>
                </div>
                <div className="p-3 rounded-lg bg-background/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-foreground">{stats.longestStreak}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Meilleure série</span>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="px-6 py-3 border-b border-border/50 overflow-x-auto">
              <div className="flex gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={activeTab === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab(cat)}
                      className="whitespace-nowrap"
                    >
                      {cat === 'all' ? '🏅 Tous' : `${categoryIcons[cat]} ${categoryLabels[cat]}`}
                    </Button>
                ))}
              </div>
            </div>
            
            {/* Badges Grid */}
            <ScrollArea className="flex-1 p-6">
              <div className="grid gap-4">
                {filteredBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
