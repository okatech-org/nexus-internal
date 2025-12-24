import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, MessageCircle, User, FileText, Inbox, Video,
  ArrowRight, Command
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchResult, SearchResultType } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  results: SearchResult[];
  resultsByType: Record<SearchResultType, SearchResult[]>;
  activeFilter: SearchResultType | 'all';
  onFilterChange: (filter: SearchResultType | 'all') => void;
  onResultClick?: (result: SearchResult) => void;
}

const typeLabels: Record<SearchResultType, string> = {
  message: 'Messages',
  contact: 'Contacts',
  document: 'Documents',
  thread: 'Threads',
  meeting: 'Réunions',
};

const typeIcons: Record<SearchResultType, typeof MessageCircle> = {
  message: MessageCircle,
  contact: User,
  document: FileText,
  thread: Inbox,
  meeting: Video,
};

const typeColors: Record<SearchResultType, string> = {
  message: 'text-blue-500 bg-blue-500/20',
  contact: 'text-emerald-500 bg-emerald-500/20',
  document: 'text-primary bg-primary/20',
  thread: 'text-iboite bg-iboite/20',
  meeting: 'text-purple-500 bg-purple-500/20',
};

export function GlobalSearchDialog({
  isOpen,
  onClose,
  query,
  onQueryChange,
  results,
  resultsByType,
  activeFilter,
  onFilterChange,
  onResultClick,
}: GlobalSearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filters: (SearchResultType | 'all')[] = ['all', 'message', 'contact', 'document', 'thread', 'meeting'];

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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl glass rounded-2xl border border-border/50 shadow-2xl z-50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Rechercher messages, contacts, documents..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-lg"
              />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs gap-1">
                  <Command className="w-3 h-3" />K
                </Badge>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2 p-3 border-b border-border/50 overflow-x-auto">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onFilterChange(filter)}
                  className="whitespace-nowrap"
                >
                  {filter === 'all' ? (
                    'Tout'
                  ) : (
                    <>
                      {(() => {
                        const Icon = typeIcons[filter];
                        return <Icon className="w-4 h-4 mr-1" />;
                      })()}
                      {typeLabels[filter]}
                      {resultsByType[filter].length > 0 && (
                        <span className="ml-1 text-xs opacity-60">
                          ({resultsByType[filter].length})
                        </span>
                      )}
                    </>
                  )}
                </Button>
              ))}
            </div>
            
            {/* Results */}
            <ScrollArea className="max-h-[60vh]">
              <div className="p-2">
                {results.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {query ? 'Aucun résultat trouvé' : 'Commencez à taper pour rechercher'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {!query && (
                      <div className="px-3 py-2 text-xs text-muted-foreground font-medium">
                        Éléments récents
                      </div>
                    )}
                    {results.map((result) => {
                      const Icon = typeIcons[result.type];
                      const colorClass = typeColors[result.type];
                      
                      return (
                        <motion.button
                          key={`${result.type}-${result.id}`}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => onResultClick?.(result)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            colorClass
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">
                                {result.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {typeLabels[result.type]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          
                          {result.timestamp && (
                            <span className="text-xs text-muted-foreground">
                              {result.timestamp}
                            </span>
                          )}
                          
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Footer */}
            <div className="p-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd> naviguer
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">↵</kbd> ouvrir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">esc</kbd> fermer
                </span>
              </div>
              <span>{results.length} résultat{results.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
