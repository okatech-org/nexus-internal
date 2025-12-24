import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  ChevronRight,
  File,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Case, WorkflowStep } from '@/types/correspondance';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CaseViewProps {
  caseItem: Case;
  onTransition: (caseId: string, action: 'approve' | 'reject' | 'publish') => void;
}

const workflowSteps: { step: WorkflowStep; label: string; icon: typeof FileText }[] = [
  { step: 'preparation', label: 'Préparation', icon: FileText },
  { step: 'validation', label: 'Validation', icon: CheckCircle },
  { step: 'approval', label: 'Approbation', icon: User },
  { step: 'publication', label: 'Publication', icon: Send },
];

const stepIndex = (step: WorkflowStep) => workflowSteps.findIndex(s => s.step === step);

export function CaseView({ caseItem, onTransition }: CaseViewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history'>('details');
  
  const currentStepIdx = stepIndex(caseItem.current_step);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
            {caseItem.reference}
          </span>
          <span className={cn(
            "text-xs px-2 py-1 rounded",
            caseItem.status === 'approved' ? 'bg-success/20 text-success' :
            caseItem.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
            caseItem.status === 'in_review' ? 'bg-warning/20 text-warning' :
            'bg-secondary text-secondary-foreground'
          )}>
            {caseItem.status}
          </span>
        </div>
        <h3 className="font-semibold text-foreground text-lg">{caseItem.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{caseItem.description}</p>
      </div>
      
      {/* Workflow Progress */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentStepIdx;
            const isCurrent = index === currentStepIdx;
            const StepIcon = step.icon;
            
            return (
              <div key={step.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCompleted ? "bg-success border-success text-success-foreground" :
                    isCurrent ? "bg-primary border-primary text-primary-foreground" :
                    "bg-secondary border-border text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1",
                    isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <ChevronRight className={cn(
                    "w-4 h-4 mx-2",
                    isCompleted ? "text-success" : "text-muted-foreground"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-border">
        {[
          { id: 'details', label: 'Détails', icon: FileText },
          { id: 'documents', label: 'Documents', icon: File },
          { id: 'history', label: 'Historique', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Approvals */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Approbations</h4>
              <div className="space-y-2">
                {caseItem.approvals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune approbation requise</p>
                ) : (
                  caseItem.approvals.map(approval => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          approval.decision === 'approved' ? "bg-success/20 text-success" :
                          approval.decision === 'rejected' ? "bg-destructive/20 text-destructive" :
                          "bg-warning/20 text-warning"
                        )}>
                          {approval.decision === 'approved' ? <CheckCircle className="w-4 h-4" /> :
                           approval.decision === 'rejected' ? <XCircle className="w-4 h-4" /> :
                           <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{approval.approver_name}</p>
                          <p className="text-xs text-muted-foreground">{approval.approver_role}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        approval.decision === 'approved' ? "bg-success/20 text-success" :
                        approval.decision === 'rejected' ? "bg-destructive/20 text-destructive" :
                        "bg-warning/20 text-warning"
                      )}>
                        {approval.decision === 'pending' ? 'En attente' :
                         approval.decision === 'approved' ? 'Approuvé' : 'Rejeté'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Créé le</span>
                </div>
                <p className="text-sm text-foreground">
                  {format(new Date(caseItem.created_at), "d MMM yyyy", { locale: fr })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Créé par</span>
                </div>
                <p className="text-sm text-foreground">{caseItem.created_by}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="space-y-2">
            {caseItem.documents.map(doc => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type} • v{doc.version}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="space-y-3">
            {caseItem.workflow_history.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3"
              >
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    event.action === 'complete' ? "bg-success/20 text-success" :
                    event.action === 'reject' ? "bg-destructive/20 text-destructive" :
                    "bg-primary/20 text-primary"
                  )}>
                    {event.action === 'complete' ? <CheckCircle className="w-4 h-4" /> :
                     event.action === 'reject' ? <XCircle className="w-4 h-4" /> :
                     event.action === 'comment' ? <MessageSquare className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  {index < caseItem.workflow_history.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{event.actor_name}</span>
                    {' '}
                    {event.action === 'start' ? 'a démarré' :
                     event.action === 'complete' ? 'a terminé' :
                     event.action === 'reject' ? 'a rejeté' : 'a commenté'}
                    {' '}
                    <span className="text-primary">{event.step}</span>
                  </p>
                  {event.comment && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{event.comment}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(event.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions */}
      {caseItem.status === 'in_review' && (
        <div className="p-4 border-t border-border flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onTransition(caseItem.id, 'reject')}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeter
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onTransition(caseItem.id, 'approve')}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approuver
          </Button>
        </div>
      )}
      
      {caseItem.status === 'approved' && caseItem.current_step === 'publication' && (
        <div className="p-4 border-t border-border">
          <Button
            variant="default"
            className="w-full"
            onClick={() => onTransition(caseItem.id, 'publish')}
          >
            <Send className="w-4 h-4 mr-2" />
            Publier vers iBoîte
          </Button>
        </div>
      )}
    </div>
  );
}
