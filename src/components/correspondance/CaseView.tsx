import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Calendar,
  Plus,
  Eye,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Case, WorkflowStep, Document } from '@/types/correspondance';
import { DocumentUpload, UploadedFile } from './DocumentUpload';
import { DocumentPreview, DocumentWithVersions } from './DocumentPreview';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface CaseViewProps {
  caseItem: Case;
  onTransition: (caseId: string, action: 'approve' | 'reject' | 'publish') => void;
  onDocumentsAdded?: (caseId: string, documents: Document[]) => void;
}

const workflowSteps: { step: WorkflowStep; label: string; icon: typeof FileText }[] = [
  { step: 'preparation', label: 'Préparation', icon: FileText },
  { step: 'validation', label: 'Validation', icon: CheckCircle },
  { step: 'approval', label: 'Approbation', icon: User },
  { step: 'publication', label: 'Publication', icon: Send },
];

const stepIndex = (step: WorkflowStep) => workflowSteps.findIndex(s => s.step === step);

// Mock version history for documents
const getDocumentVersions = (doc: Document): DocumentWithVersions => {
  const versions = [];
  for (let v = 1; v <= doc.version; v++) {
    versions.push({
      version: v,
      created_by: v === 1 ? doc.created_by : `user-${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(new Date(doc.created_at).getTime() - (doc.version - v) * 86400000).toISOString(),
      changes: v === 1 ? 'Version initiale' : v === doc.version ? 'Dernière modification' : 'Mise à jour mineure',
    });
  }
  return { ...doc, versions };
};

export function CaseView({ caseItem, onTransition, onDocumentsAdded }: CaseViewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history'>('details');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithVersions | null>(null);
  
  const currentStepIdx = stepIndex(caseItem.current_step);
  
  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    const newDocuments: Document[] = files.map((file, index) => ({
      id: `doc-new-${Date.now()}-${index}`,
      case_id: caseItem.id,
      name: file.name,
      type: file.type.includes('image') ? 'annexe' : 'rapport',
      content: '[Contenu du fichier importé]',
      version: 1,
      created_by: 'service-account',
      created_at: new Date().toISOString(),
      file_size: file.size,
      mime_type: file.type,
      preview_url: file.preview,
    }));
    
    onDocumentsAdded?.(caseItem.id, newDocuments);
    setShowUpload(false);
    toast.success(`${newDocuments.length} document(s) ajouté(s) au dossier`);
  }, [caseItem.id, onDocumentsAdded]);

  const handleDocumentClick = useCallback((doc: Document) => {
    setSelectedDocument(getDocumentVersions(doc));
  }, []);
  
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
          { id: 'documents', label: `Documents (${caseItem.documents.length})`, icon: File },
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
          <div className="space-y-4">
            {/* Upload Toggle */}
            <AnimatePresence mode="wait">
              {showUpload ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <DocumentUpload onFilesUploaded={handleFilesUploaded} />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setShowUpload(false)}
                  >
                    Annuler
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowUpload(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter des documents
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Document List */}
            <div className="space-y-2">
              {caseItem.documents.length === 0 ? (
                <div className="text-center py-8">
                  <File className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun document</p>
                </div>
              ) : (
                caseItem.documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Preview Thumbnail */}
                      {doc.preview_url ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-background shrink-0">
                          <img 
                            src={doc.preview_url} 
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <File className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{doc.type}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                            v{doc.version}
                          </span>
                          {doc.file_size && (
                            <span className="text-xs text-muted-foreground">
                              {(doc.file_size / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
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
      
      {/* Document Preview Modal */}
      <DocumentPreview
        document={selectedDocument!}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
}
