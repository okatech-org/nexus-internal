import { useState, useCallback, useMemo } from 'react';
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
  Lock,
  ArrowDown,
  Plus,
  Trash2,
  GripVertical
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
  waiting: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'En file d\'attente' },
};

interface SignerInput {
  name: string;
  email: string;
  role: string;
}

// Check if a signer can sign based on sequential order
const canSignerSign = (signer: SignerInfo, allSigners: SignerInfo[]): boolean => {
  // Get all signers with lower order (must sign before this one)
  const previousSigners = allSigners.filter(s => s.order < signer.order);
  // All previous signers must have signed
  return previousSigners.every(s => s.status === 'signed');
};

// Get the current active signer (lowest order pending signer who can sign)
const getCurrentActiveSigner = (signers: SignerInfo[]): SignerInfo | null => {
  const sortedSigners = [...signers].sort((a, b) => a.order - b.order);
  for (const signer of sortedSigners) {
    if (signer.status === 'pending' && canSignerSign(signer, signers)) {
      return signer;
    }
  }
  return null;
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
  const [signers, setSigners] = useState<SignerInput[]>([{ name: '', email: '', role: '' }]);
  const [declineReason, setDeclineReason] = useState('');
  const [signatureCode, setSignatureCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if current user has pending signatures they can actually sign (respecting order)
  const pendingForUser = useMemo(() => {
    return signatureRequests.filter(req => {
      if (req.status !== 'active') return false;
      const userSigner = req.signers.find(s => s.signer_id === currentUserId && s.status === 'pending');
      if (!userSigner) return false;
      return canSignerSign(userSigner, req.signers);
    });
  }, [signatureRequests, currentUserId]);

  const addSigner = useCallback(() => {
    setSigners(prev => [...prev, { name: '', email: '', role: '' }]);
  }, []);

  const removeSigner = useCallback((index: number) => {
    setSigners(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateSigner = useCallback((index: number, field: keyof SignerInput, value: string) => {
    setSigners(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }, []);

  const handleRequestSignature = useCallback(() => {
    if (selectedDocIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un document');
      return;
    }

    const validSigners = signers.filter(s => s.name && s.email);
    if (validSigners.length === 0) {
      toast.error('Veuillez ajouter au moins un signataire valide');
      return;
    }

    onRequestSignature(selectedDocIds, validSigners.map((s, idx) => ({
      signer_id: `signer-${Date.now()}-${idx}`,
      signer_name: s.name,
      signer_email: s.email,
      signer_role: s.role || 'Signataire',
      order: idx + 1, // Order based on position in list
    })));

    setShowRequestDialog(false);
    setSelectedDocIds([]);
    setSigners([{ name: '', email: '', role: '' }]);
    toast.success(`Demande de signature envoyée à ${validSigners.length} signataire(s)`);
  }, [selectedDocIds, signers, onRequestSignature]);

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

                {/* Sequential Workflow Indicator */}
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <ArrowDown className="w-3 h-3" />
                  <span>Signature séquentielle (ordre de priorité)</span>
                </div>

                {/* Signers */}
                <div className="space-y-2">
                  {[...request.signers].sort((a, b) => a.order - b.order).map((signer, idx) => {
                    const config = statusConfig[signer.status];
                    const StatusIcon = config.icon;
                    const isCurrentUser = signer.signer_id === currentUserId;
                    const userCanSign = canSignerSign(signer, request.signers);
                    const canSign = isCurrentUser && signer.status === 'pending' && request.status === 'active' && userCanSign;
                    const isWaiting = signer.status === 'pending' && !userCanSign;
                    const activeSigner = getCurrentActiveSigner(request.signers);
                    const isActive = activeSigner?.id === signer.id;

                    const displayConfig = isWaiting ? statusConfig.waiting : config;
                    const DisplayIcon = displayConfig.icon;

                    return (
                      <div key={signer.id}>
                        <div
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg transition-all",
                            canSign ? "bg-warning/10 border-2 border-warning/50 shadow-sm" : 
                            isActive ? "bg-primary/5 border border-primary/20" :
                            "bg-background/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Order Badge */}
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              signer.status === 'signed' ? "bg-success text-success-foreground" :
                              isActive ? "bg-primary text-primary-foreground" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {signer.order}
                            </div>
                            
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", displayConfig.bg)}>
                              <DisplayIcon className={cn("w-4 h-4", displayConfig.color)} />
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
                          ) : isWaiting ? (
                            <span className="text-xs text-muted-foreground italic">
                              Attend les signatures précédentes
                            </span>
                          ) : (
                            <span className={cn("text-xs", displayConfig.color)}>{displayConfig.label}</span>
                          )}
                        </div>
                        
                        {/* Arrow between signers */}
                        {idx < request.signers.length - 1 && (
                          <div className="flex justify-center py-1">
                            <ArrowDown className={cn(
                              "w-4 h-4",
                              signer.status === 'signed' ? "text-success" : "text-muted-foreground/30"
                            )} />
                          </div>
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

            {/* Signers List - Multiple Signers with Order */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Signataires (par ordre de priorité)
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addSigner}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              <div className="space-y-3">
                {signers.map((signer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <span className="text-xs text-muted-foreground flex-1">
                        {index === 0 ? 'Premier signataire' : `Signataire #${index + 1}`}
                      </span>
                      {signers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeSigner(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Nom *"
                        value={signer.name}
                        onChange={(e) => updateSigner(index, 'name', e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="Email *"
                        type="email"
                        value={signer.email}
                        onChange={(e) => updateSigner(index, 'email', e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="Rôle (ex: Directeur)"
                        value={signer.role}
                        onChange={(e) => updateSigner(index, 'role', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    {index < signers.length - 1 && (
                      <div className="flex justify-center mt-2">
                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Les signataires devront signer dans l'ordre indiqué
              </p>
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
