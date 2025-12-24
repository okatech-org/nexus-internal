import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Badge as BadgeType, BADGE_COLORS } from '@/types/gamification';
import { cn } from '@/lib/utils';

interface BadgeCelebrationProps {
  badge: BadgeType | null;
  onDismiss: () => void;
}

const rarityConfetti = {
  common: {
    particleCount: 50,
    spread: 60,
    colors: ['#64748b', '#94a3b8', '#cbd5e1'],
  },
  rare: {
    particleCount: 100,
    spread: 80,
    colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
  },
  epic: {
    particleCount: 150,
    spread: 100,
    colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
  },
  legendary: {
    particleCount: 200,
    spread: 120,
    colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
  },
};

export function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  useEffect(() => {
    if (!badge) return;

    const config = rarityConfetti[badge.rarity];
    
    // Fire confetti
    const duration = badge.rarity === 'legendary' ? 3000 : 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: Math.floor(config.particleCount / 10),
        angle: 60,
        spread: config.spread,
        origin: { x: 0, y: 0.6 },
        colors: config.colors,
      });
      confetti({
        particleCount: Math.floor(config.particleCount / 10),
        angle: 120,
        spread: config.spread,
        origin: { x: 1, y: 0.6 },
        colors: config.colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial burst
    confetti({
      particleCount: config.particleCount,
      spread: config.spread,
      origin: { y: 0.6 },
      colors: config.colors,
    });

    // Continuous effect for rare+ badges
    if (badge.rarity !== 'common') {
      frame();
    }

    // Auto-dismiss after animation
    const timeout = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [badge, onDismiss]);

  if (!badge) return null;

  const colors = BADGE_COLORS[badge.rarity];

  return (
    <AnimatePresence>
      {badge && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
            onClick={onDismiss}
          />

          {/* Celebration Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { type: 'spring', damping: 15, stiffness: 300 }
            }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none"
          >
            <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 text-center relative pointer-events-auto border-2 border-primary/20">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={onDismiss}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Sparkle decorations */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-6 -left-6"
              >
                <Sparkles className="w-12 h-12 text-amber-400" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-4 -right-4"
              >
                <Star className="w-10 h-10 text-purple-400" />
              </motion.div>

              {/* Trophy animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6"
              >
                <div className={cn(
                  "w-24 h-24 rounded-2xl mx-auto flex items-center justify-center text-5xl",
                  colors.bg,
                  "shadow-lg",
                  colors.glow && `shadow-2xl ${colors.glow}`
                )}>
                  {badge.icon}
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Badge Débloqué!
                  </span>
                </div>
                
                <h2 className={cn("text-2xl font-bold mb-2", colors.text)}>
                  {badge.name}
                </h2>
                
                <p className="text-muted-foreground mb-4">
                  {badge.description}
                </p>

                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium capitalize",
                  colors.bg,
                  colors.border,
                  colors.text
                )}>
                  <Star className="w-4 h-4" />
                  {badge.rarity}
                </div>
              </motion.div>

              {/* Points earned */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 pt-4 border-t border-border/50"
              >
                <span className="text-sm text-muted-foreground">
                  +{badge.rarity === 'legendary' ? 500 : badge.rarity === 'epic' ? 200 : badge.rarity === 'rare' ? 100 : 50} points
                </span>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}