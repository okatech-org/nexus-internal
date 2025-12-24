import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  File, 
  FileText, 
  FileImage, 
  Clock, 
  User,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, DocumentAnnotation, AnnotationReply } from '@/types/correspondance';
import { DocumentAnnotations } from './DocumentAnnotations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export interface DocumentVersion {
  version: number;
  created_by: string;
  created_at: string;
  changes?: string;
}

export interface DocumentWithVersions extends Document {
  versions: DocumentVersion[];
}

interface DocumentPreviewProps {
  document: DocumentWithVersions;
  isOpen: boolean;
  onClose: () => void;
}

const getFileIcon = (type: string) => {
  if (type === 'annexe' || type === 'image') return FileImage;
  if (type === 'courrier' || type === 'note' || type === 'rapport') return FileText;
  return File;
};

// Generate mock annotations for demo
const generateMockAnnotations = (documentId: string): DocumentAnnotation[] => {
  return [
    {
      id: `ann-${documentId}-1`,
      document_id: documentId,
      created_by: 'user-1',
      created_by_name: 'Marie Martin',
      content: 'Ce paragraphe nécessite une clarification sur les délais mentionnés.',
      position: {
        start_offset: 50,
        end_offset: 120,
        selected_text: 'les délais de traitement prévus',
      },
      status: 'open',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      replies: [
        {
          id: 'reply-1',
          annotation_id: `ann-${documentId}-1`,
          created_by: 'user-2',
          created_by_name: 'Jean Dupont',
          content: "Je suis d'accord, il faudrait préciser si ce sont des jours ouvrés ou calendaires.",
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ],
    },
    {
      id: `ann-${documentId}-2`,
      document_id: documentId,
      created_by: 'current-user',
      created_by_name: 'Utilisateur courant',
      content: 'Vérifier la conformité avec le règlement 2024/001.',
      position: {
        start_offset: 0,
        end_offset: 0,
        selected_text: '',
      },
      status: 'open',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      replies: [],
    },
    {
      id: `ann-${documentId}-3`,
      document_id: documentId,
      created_by: 'user-3',
      created_by_name: 'Sophie Bernard',
      content: 'Correction effectuée suite à la revue juridique.',
      position: {
        start_offset: 200,
        end_offset: 250,
        selected_text: 'dispositions légales',
      },
      status: 'resolved',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      replies: [
        {
          id: 'reply-2',
          annotation_id: `ann-${documentId}-3`,
          created_by: 'user-1',
          created_by_name: 'Marie Martin',
          content: 'Merci pour la correction!',
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
      ],
    },
  ];
};

export function DocumentPreview({ document, isOpen, onClose }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'annotations' | 'versions'>('content');
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>(() => 
    generateMockAnnotations(document.id)
  );
  
  const FileIcon = getFileIcon(document.type);

  const handleAddAnnotation = useCallback((
    content: string, 
    selectedText: string, 
    startOffset: number, 
    endOffset: number
  ) => {
    const newAnnotation: DocumentAnnotation = {
      id: `ann-${Date.now()}`,
      document_id: document.id,
      created_by: 'current-user',
      created_by_name: 'Utilisateur courant',
      content,
      position: {
        start_offset: startOffset,
        end_offset: endOffset,
        selected_text: selectedText,
      },
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: [],
    };
    setAnnotations(prev => [newAnnotation, ...prev]);
  }, [document.id]);

  const handleReply = useCallback((annotationId: string, content: string) => {
    setAnnotations(prev => prev.map(ann => {
      if (ann.id !== annotationId) return ann;
      const newReply: AnnotationReply = {
        id: `reply-${Date.now()}`,
        annotation_id: annotationId,
        created_by: 'current-user',
        created_by_name: 'Utilisateur courant',
        content,
        created_at: new Date().toISOString(),
      };
      return {
        ...ann,
        replies: [...ann.replies, newReply],
        updated_at: new Date().toISOString(),
      };
    }));
  }, []);

  const handleResolve = useCallback((annotationId: string) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === annotationId 
        ? { ...ann, status: 'resolved' as const, updated_at: new Date().toISOString() }
        : ann
    ));
    toast.success('Annotation marquée comme résolue');
  }, []);

  const handleDelete = useCallback((annotationId: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
    toast.success('Annotation supprimée');
  }, []);

  const openAnnotationsCount = annotations.filter(a => a.status === 'open').length;

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[600px] max-h-[85vh] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{document.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {document.type} • Version {document.version}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-border">
              {[
                { id: 'content', label: 'Contenu', icon: FileText },
                { id: 'annotations', label: 'Annotations', icon: MessageSquare, badge: openAnnotationsCount },
                { id: 'versions', label: 'Versions', icon: Clock, badge: document.versions.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      activeTab === tab.id ? "bg-primary/20" : "bg-secondary"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'content' && (
                <div className="space-y-4">
                  {/* Preview Content */}
                  <div className="p-4 rounded-lg bg-secondary/30 min-h-[150px]">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {document.content}
                    </p>
                  </div>
                  
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs">Créé par</span>
                      </div>
                      <p className="text-sm text-foreground">{document.created_by}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">Date</span>
                      </div>
                      <p className="text-sm text-foreground">
                        {format(new Date(document.created_at), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'annotations' && (
                <DocumentAnnotations
                  documentId={document.id}
                  annotations={annotations}
                  currentUserId="current-user"
                  currentUserName="Utilisateur courant"
                  onAddAnnotation={handleAddAnnotation}
                  onReply={handleReply}
                  onResolve={handleResolve}
                  onDelete={handleDelete}
                />
              )}

              {activeTab === 'versions' && (
                <div className="space-y-2">
                  {document.versions.map((version, index) => (
                    <motion.div
                      key={version.version}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-3 rounded-lg border",
                        version.version === document.version
                          ? "border-primary/30 bg-primary/10"
                          : "border-border bg-secondary/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded font-mono",
                            version.version === document.version
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground"
                          )}>
                            v{version.version}
                          </span>
                          {version.version === document.version && (
                            <span className="text-xs text-success">Actuelle</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(version.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Par {version.created_by}
                        </p>
                        {version.changes && (
                          <p className="text-xs text-foreground/70 italic">
                            {version.changes}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="p-4 border-t border-border flex gap-2">
              <Button variant="outline" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Ouvrir
              </Button>
              <Button variant="default" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
