import { useState } from 'react';
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
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document } from '@/types/correspondance';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export function DocumentPreview({ document, isOpen, onClose }: DocumentPreviewProps) {
  const [showVersions, setShowVersions] = useState(false);
  const FileIcon = getFileIcon(document.type);

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
            
            {/* Preview Content */}
            <div className="p-4 border-b border-border">
              <div className="p-4 rounded-lg bg-secondary/30 min-h-[150px]">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {document.content}
                </p>
              </div>
            </div>
            
            {/* Metadata */}
            <div className="p-4 border-b border-border grid grid-cols-2 gap-3">
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
            
            {/* Version History */}
            <div className="p-4">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Historique des versions
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                    {document.versions.length}
                  </span>
                </div>
                {showVersions ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence>
                {showVersions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
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
