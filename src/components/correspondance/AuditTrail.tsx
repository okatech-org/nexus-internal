import { motion } from 'framer-motion';
import { 
  FileText, 
  Eye, 
  Edit3, 
  PenTool, 
  CheckCircle, 
  XCircle, 
  Clock,
  Send,
  Shield,
  Download
} from 'lucide-react';
import { AuditLogEntry, AuditAction } from '@/types/correspondance';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditTrailProps {
  entries: AuditLogEntry[];
  onExport?: () => void;
}

const actionConfig: Record<AuditAction, { icon: typeof FileText; color: string; label: string }> = {
  document_created: { icon: FileText, color: 'text-primary', label: 'Document créé' },
  document_viewed: { icon: Eye, color: 'text-muted-foreground', label: 'Document consulté' },
  document_updated: { icon: Edit3, color: 'text-warning', label: 'Document modifié' },
  signature_requested: { icon: PenTool, color: 'text-primary', label: 'Signature demandée' },
  signature_signed: { icon: CheckCircle, color: 'text-success', label: 'Document signé' },
  signature_declined: { icon: XCircle, color: 'text-destructive', label: 'Signature refusée' },
  signature_expired: { icon: Clock, color: 'text-muted-foreground', label: 'Signature expirée' },
  approval_granted: { icon: CheckCircle, color: 'text-success', label: 'Approbation accordée' },
  approval_rejected: { icon: XCircle, color: 'text-destructive', label: 'Approbation rejetée' },
  case_status_changed: { icon: Shield, color: 'text-primary', label: 'Statut modifié' },
  case_published: { icon: Send, color: 'text-success', label: 'Dossier publié' },
};

export function AuditTrail({ entries, onExport }: AuditTrailProps) {
  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, AuditLogEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Piste d'audit complète
        </h4>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        )}
      </div>

      {/* Entries by date */}
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date}>
            <div className="sticky top-0 z-10 bg-background py-2">
              <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-full bg-secondary">
                {format(new Date(date), "EEEE d MMMM yyyy", { locale: fr })}
              </span>
            </div>
            
            <div className="relative ml-4 mt-3">
              {/* Timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-3">
                {groupedEntries[date].map((entry, index) => {
                  const config = actionConfig[entry.action];
                  const ActionIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative flex gap-4 pl-2"
                    >
                      {/* Icon */}
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center bg-background border-2 border-border z-10",
                        config.color
                      )}>
                        <ActionIcon className="w-3 h-3" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm text-foreground">
                                <span className="font-medium">{entry.actor_name}</span>
                                <span className="text-muted-foreground"> • {entry.actor_role}</span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {entry.details}
                              </p>
                            </div>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full whitespace-nowrap", 
                              config.color === 'text-success' ? 'bg-success/20 text-success' :
                              config.color === 'text-destructive' ? 'bg-destructive/20 text-destructive' :
                              config.color === 'text-warning' ? 'bg-warning/20 text-warning' :
                              'bg-primary/20 text-primary'
                            )}>
                              {config.label}
                            </span>
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(entry.timestamp), "HH:mm:ss", { locale: fr })}
                            </span>
                            {entry.ip_address && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                IP: {entry.ip_address}
                              </span>
                            )}
                            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{Object.keys(entry.metadata).length} métadonnées
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune entrée dans l'audit</p>
        </div>
      )}
    </div>
  );
}
