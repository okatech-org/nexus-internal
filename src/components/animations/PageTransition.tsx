import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Card stagger animation variants
export const staggerContainerVariants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Slide animation variants
export const slideInLeftVariants = {
  initial: { opacity: 0, x: -30 },
  enter: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    x: -30,
    transition: { duration: 0.2 }
  },
};

export const slideInRightVariants = {
  initial: { opacity: 0, x: 30 },
  enter: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    x: 30,
    transition: { duration: 0.2 }
  },
};

export const fadeInVariants = {
  initial: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.9 },
  enter: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  },
};

// Animated section wrapper
interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

export function AnimatedSection({ 
  children, 
  delay = 0, 
  className = "",
  direction = 'up'
}: AnimatedSectionProps) {
  const getVariants = () => {
    switch (direction) {
      case 'left':
        return {
          initial: { opacity: 0, x: -30 },
          enter: { opacity: 1, x: 0 },
        };
      case 'right':
        return {
          initial: { opacity: 0, x: 30 },
          enter: { opacity: 1, x: 0 },
        };
      case 'down':
        return {
          initial: { opacity: 0, y: -20 },
          enter: { opacity: 1, y: 0 },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          enter: { opacity: 1, scale: 1 },
        };
      default:
        return {
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0 },
        };
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      variants={getVariants()}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover effects
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export function AnimatedCard({ children, className = "", onClick, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated list for staggered items
interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
}

export function AnimatedList({ children, className = "", itemClassName = "" }: AnimatedListProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      variants={staggerContainerVariants}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={staggerItemVariants}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
