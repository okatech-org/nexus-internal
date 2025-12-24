import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';

export function NeuralHeartButton() {
  const { capabilities, isAstedOpen, openAsted, closeAsted } = useComms();
  const [isHovered, setIsHovered] = useState(false);
  
  const isEnabled = capabilities?.modules.iasted.enabled;
  
  if (!isEnabled) return null;
  
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        delay: 0.5 
      }}
    >
      {/* Glow effect */}
      <AnimatePresence>
        {(isHovered || isAstedOpen) && (
          <motion.div
            className="absolute inset-0 rounded-full gradient-neural blur-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1.5 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      
      {/* Pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-neural/40"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <Button
        variant="neural"
        size="icon-lg"
        className={cn(
          "relative rounded-full w-14 h-14",
          isAstedOpen && "ring-2 ring-neural ring-offset-2 ring-offset-background"
        )}
        onClick={isAstedOpen ? closeAsted : openAsted}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          {isAstedOpen ? (
            <motion.div
              key="active"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Brain className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
      
      {/* Label tooltip */}
      <AnimatePresence>
        {isHovered && !isAstedOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="glass px-3 py-2 rounded-lg text-sm font-medium">
              <span className="text-gradient-neural">iAsted</span>
              <span className="text-muted-foreground ml-1">Neural Heart</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
