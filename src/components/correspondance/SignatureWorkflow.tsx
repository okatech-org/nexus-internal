import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  FileSignature,
  User,
  AlertTriangle,
  Fingerprint,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  SignatureRequest, 
  SignerInfo, 
  Document,
  AuditLogEntry 
} from '@/types/correspondance';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface SignatureWorkflowProps {
  caseId: string;
  documents: Document[];
  signatureRequests: SignatureRequest[];
  auditLog: AuditLogEntry[];
  currentUserId: string;
  currentUserName: string;
  onRequestSignature: (documentIds: string[], signers: Omit<SignerInfo, 'id' | 'status' | 'signed_at'>[]) => void;
  onSign: (requestId: string) => void;
  onDecline: (requestId: string, reason: string) => void;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/20', label: 'En attente' },
  signed: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/20', label: 'Signé' },
  declined: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/20', label: 'Refusé' },
  expired: { icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Expiré' },
};

export function SignatureWorkflow({
  caseId,
  documents,
  signatureRequests,
  auditLog,
  currentUserId,
  currentUserName,
  onRequestSignature,
  onSign,
  onDecline,
}: SignatureWorkflowProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [signatureCode, setSignatureCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const pendingForUser = signatureRequests.filter(req => 
    req.status === 'active' && 
    req.signers.some(s => s.signer_id === currentUserId && s.status === 'pending')
  );

  const handleRequestSignature = useCallback(() => {
    if (selectedDocIds.length === 0 || !signerName || !signerEmail) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onRequestSignature(selectedDocIds, [{
      signer_id: `signer-${Date.now()}`,
      signer_name: signerName,
      signer_email: signerEmail,
      signer_role: signerRole || 'Signataire',
      order: 1,
    }]);

    setShowRequestDialog(false);
    setSelectedDocIds([]);
    setSignerName('');
    setSignerEmail('');
    setSignerRole('');
    toast.success('Demande de signature envoyée');
  }, [selectedDocIds, signerName, signerEmail, signerRole, onRequestSignature]);

  const handleSign = useCallback(async () => {
    if (!selectedRequest || signatureCode.length !== 6) {
      toast.error('Veuillez entrer le code de vérification à 6 chiffres');
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSign(selectedRequest.id);
    setIsVerifying(false);
    setShowSignDialog(false);
    setSignatureCode('');
    setSelectedRequest(null);
    toast.success('Document signé avec succès');
  }, [selectedRequest, signatureCode, onSign]);

  const handleDecline = useCallback(() => {
    if (!selectedRequest || !declineReason) {
      toast.error('Veuillez indiquer le motif du refus');
      return;
    }

    onDecline(selectedRequest.id, declineReason);
    setShowDeclineDialog(false);
    setDeclineReason('');
    setSelectedRequest(null);
    toast.info('Signature refusée');
  }, [selectedRequest, declineReason, onDecline]);

  const openSignDialog = (request: SignatureRequest) => {
    setSelectedRequest(request);
    setShowSignDialog(true);
  };

  const openDeclineDialog = (request: SignatureRequest) => {
    setSelectedRequest(request);
    setShowDeclineDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Pending Signatures Banner */}
      {pendingForUser.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-warning/10 border border-warning/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                {pendingForUser.length} signature(s) en attente
              </h4>
              <p className="text-xs text-muted-foreground">
                Vous avez des documents à signer
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRequestDialog(true)}
          disabled={documents.length === 0}
        >
          <FileSignature className="w-4 h-4 mr-2" />
          Demander une signature
        </Button>
      </div>

      {/* Signature Requests List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Demandes de signature
        </h4>
        
        {signatureRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune demande de signature</p>
          </div>
        ) : (
          <div className="space-y-2">
            {signatureRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {request.document_ids.length} document(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Créé le {format(new Date(request.created_at), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    request.status === 'completed' ? 'bg-success/20 text-success' :
                    request.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                    request.status === 'expired' ? 'bg-muted text-muted-foreground' :
                    'bg-primary/20 text-primary'
                  )}>
                    {request.status === 'active' ? 'En cours' :
                     request.status === 'completed' ? 'Terminé' :
                     request.status === 'cancelled' ? 'Annulé' : 'Expiré'}
                  </span>
                </div>

                {/* Signers */}
                <div className="space-y-2">
                  {request.signers.map((signer) => {
                    const config = statusConfig[signer.status];
                    const StatusIcon = config.icon;
                    const isCurrentUser = signer.signer_id === currentUserId;
                    const canSign = isCurrentUser && signer.status === 'pending' && request.status === 'active';

                    return (
                      <div
                        key={signer.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg",
                          canSign ? "bg-warning/10 border border-warning/30" : "bg-background/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bg)}>
                            <StatusIcon className={cn("w-4 h-4", config.color)} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {signer.signer_name}
                              {isCurrentUser && <span className="text-xs text-primary ml-2">(vous)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{signer.signer_role}</p>
                          </div>
                        </div>
                        
                        {canSign ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeclineDialog(request)}
                            >
                              Refuser
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openSignDialog(request)}
                            >
                              <PenTool className="w-4 h-4 mr-1" />
                              Signer
                            </Button>
                          </div>
                        ) : signer.signed_at ? (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(signer.signed_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                          </span>
                        ) : (
                          <span className={cn("text-xs", config.color)}>{config.label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          Piste d'audit
        </h4>
        
        {auditLog.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune entrée dans l'audit
          </p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {auditLog.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    <span className="font-medium">{entry.actor_name}</span>
                    {' '}{entry.details}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(entry.timestamp), "d MMM yyyy 'à' HH:mm:ss", { locale: fr })}
                    </span>
                    {entry.ip_address && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {entry.ip_address}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Request Signature Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander une signature</DialogTitle>
            <DialogDescription>
              Sélectionnez les documents et ajoutez les signataires
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Document Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Documents à signer
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {documents.map(doc => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocIds([...selectedDocIds, doc.id]);
                        } else {
                          setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
                        }
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">{doc.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Signer Info */}
            <div className="space-y-3">
              <Input
                placeholder="Nom du signataire *"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
              />
              <Input
                placeholder="Email du signataire *"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
              />
              <Input
                placeholder="Rôle (ex: Directeur)"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRequestSignature}>
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary" />
              Signature électronique
            </DialogTitle>
            <DialogDescription>
              Entrez le code de vérification envoyé à votre adresse email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground mb-2">
                En signant, vous confirmez :
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Avoir lu et compris le(s) document(s)</li>
                <li>• Accepter les termes et conditions</li>
                <li>• Que cette signature a valeur légale</li>
              </ul>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Code de vérification (6 chiffres)
              </label>
              <Input
                placeholder="000000"
                value={signatureCode}
                onChange={(e) => setSignatureCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Pour la démo, entrez n'importe quel code à 6 chiffres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSign} 
              disabled={signatureCode.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                  Vérification...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Signer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Refuser la signature
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif de votre refus
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Motif du refus..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDecline}
              disabled={!declineReason}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
