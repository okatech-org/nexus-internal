import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, Send, AlertTriangle } from 'lucide-react';
import { Case, CaseStatus } from '@/types/correspondance';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CaseListProps {
  cases: Case[];
  selectedCase: Case | null;
  onSelectCase: (caseItem: Case) => void;
  filter?: CaseStatus | 'all';
}

const statusConfig: Record<CaseStatus, { icon: typeof FileText; color: string; label: string }> = {
  draft: { icon: FileText, color: 'text-muted-foreground', label: 'Brouillon' },
  submitted: { icon: Send, color: 'text-iboite', label: 'Soumis' },
  in_review: { icon: Clock, color: 'text-warning', label: 'En révision' },
  approved: { icon: CheckCircle, color: 'text-success', label: 'Approuvé' },
  rejected: { icon: XCircle, color: 'text-destructive', label: 'Rejeté' },
  published: { icon: CheckCircle, color: 'text-primary', label: 'Publié' },
};

const priorityConfig = {
  low: { color: 'bg-muted text-muted-foreground', label: 'Basse' },
  normal: { color: 'bg-secondary text-secondary-foreground', label: 'Normale' },
  high: { color: 'bg-warning/20 text-warning', label: 'Haute' },
  urgent: { color: 'bg-destructive/20 text-destructive', label: 'Urgente' },
};

export function CaseList({ cases, selectedCase, onSelectCase, filter = 'all' }: CaseListProps) {
  const filteredCases = filter === 'all' 
    ? cases 
    : cases.filter(c => c.status === filter);

  if (filteredCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">Aucun dossier</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {filteredCases.map((caseItem, index) => {
        const StatusIcon = statusConfig[caseItem.status].icon;
        
        return (
          <motion.button
            key={caseItem.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectCase(caseItem)}
            className={cn(
              "w-full p-3 rounded-xl text-left transition-all duration-200",
              "hover:bg-secondary/80",
              selectedCase?.id === caseItem.id
                ? "bg-secondary ring-1 ring-primary/30"
                : "bg-transparent"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                caseItem.status === 'in_review' ? 'bg-warning/20' : 
                caseItem.status === 'approved' ? 'bg-success/20' :
                caseItem.status === 'rejected' ? 'bg-destructive/20' :
                'bg-primary/20'
              )}>
                <StatusIcon className={cn("w-5 h-5", statusConfig[caseItem.status].color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-primary">{caseItem.reference}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(caseItem.updated_at), {
                      addSuffix: false,
                      locale: fr,
                    })}
                  </span>
                </div>
                
                <h4 className="font-medium text-foreground truncate mt-1">
                  {caseItem.title}
                </h4>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    priorityConfig[caseItem.priority].color
                  )}>
                    {priorityConfig[caseItem.priority].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {statusConfig[caseItem.status].label}
                  </span>
                </div>
              </div>
              
              {caseItem.priority === 'urgent' && (
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-1" />
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
