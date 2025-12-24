import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KeyboardShortcut, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsDialog({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsDialogProps) {
  const categories = {
    navigation: { label: 'Navigation', icon: '🧭' },
    actions: { label: 'Actions', icon: '⚡' },
    view: { label: 'Affichage', icon: '👁' },
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[500px] max-h-[80vh] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Raccourcis clavier</h3>
                  <p className="text-xs text-muted-foreground">
                    Appuyez sur ? pour afficher cette aide
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Shortcuts List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                    <span>{categories[category as keyof typeof categories]?.icon}</span>
                    {categories[category as keyof typeof categories]?.label || category}
                  </h4>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm text-foreground">
                          {shortcut.description}
                        </span>
                        <kbd className={cn(
                          "px-2 py-1 text-xs font-mono rounded",
                          "bg-background border border-border shadow-sm",
                          "text-muted-foreground"
                        )}>
                          {formatShortcut(shortcut)}
                        </kbd>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Les raccourcis sont désactivés dans les champs de saisie
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
