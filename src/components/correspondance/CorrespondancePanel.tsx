import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Plus, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { CaseList } from './CaseList';
import { CaseView } from './CaseView';
import { Case, CaseStatus } from '@/types/correspondance';
import { mockCases } from '@/mocks/correspondance.mock';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CorrespondancePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusFilters: { value: CaseStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'in_review', label: 'En révision' },
  { value: 'approved', label: 'Approuvés' },
];

export function CorrespondancePanel({ isOpen, onClose }: CorrespondancePanelProps) {
  const { capabilities } = useComms();
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');
  
  const isEnabled = capabilities?.modules.icorrespondance.enabled;
  
  const handleTransition = (caseId: string, action: 'approve' | 'reject' | 'publish') => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      
      if (action === 'approve') {
        toast.success('Dossier approuvé');
        return {
          ...c,
          status: 'approved' as CaseStatus,
          current_step: 'publication' as const,
          approvals: c.approvals.map(a => ({
            ...a,
            decision: 'approved' as const,
            decided_at: new Date().toISOString(),
          })),
        };
      }
      
      if (action === 'reject') {
        toast.error('Dossier rejeté');
        return {
          ...c,
          status: 'rejected' as CaseStatus,
          approvals: c.approvals.map(a => ({
            ...a,
            decision: 'rejected' as const,
            decided_at: new Date().toISOString(),
          })),
        };
      }
      
      if (action === 'publish') {
        toast.success('Dossier publié vers iBoîte');
        return {
          ...c,
          status: 'published' as CaseStatus,
        };
      }
      
      return c;
    }));
    
    // Update selected case
    setSelectedCase(prev => {
      if (!prev || prev.id !== caseId) return prev;
      return cases.find(c => c.id === caseId) || null;
    });
  };
  
  useEffect(() => {
    if (selectedCase) {
      const updated = cases.find(c => c.id === selectedCase.id);
      if (updated) setSelectedCase(updated);
    }
  }, [cases]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-6 top-6 bottom-6 z-50 w-[500px] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {selectedCase && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSelectedCase(null)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">iCorrespondance</h2>
                    <p className="text-xs text-muted-foreground">Workflow Gouvernemental</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {!selectedCase && isEnabled && (
                <div className="flex gap-1 mt-3">
                  {statusFilters.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        filter === f.value
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Content */}
            {!isEnabled ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Module non disponible</h3>
                <p className="text-sm text-muted-foreground">
                  iCorrespondance nécessite un réseau gouvernemental et un realm government.
                </p>
              </div>
            ) : selectedCase ? (
              <CaseView caseItem={selectedCase} onTransition={handleTransition} />
            ) : (
              <CaseList
                cases={cases}
                selectedCase={selectedCase}
                onSelectCase={setSelectedCase}
                filter={filter}
              />
            )}
            
            {/* FAB */}
            {isEnabled && !selectedCase && (
              <div className="absolute bottom-6 right-6">
                <Button
                  variant="default"
                  size="icon-lg"
                  className="rounded-xl shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
