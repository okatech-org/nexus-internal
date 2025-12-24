import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Reply, 
  CheckCircle, 
  Clock,
  Send,
  User,
  MoreHorizontal,
  Trash2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DocumentAnnotation, AnnotationReply } from '@/types/correspondance';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface DocumentAnnotationsProps {
  documentId: string;
  annotations: DocumentAnnotation[];
  currentUserId: string;
  currentUserName: string;
  onAddAnnotation: (content: string, selectedText: string, startOffset: number, endOffset: number) => void;
  onReply: (annotationId: string, content: string) => void;
  onResolve: (annotationId: string) => void;
  onDelete: (annotationId: string) => void;
}

export function DocumentAnnotations({
  documentId,
  annotations,
  currentUserId,
  currentUserName,
  onAddAnnotation,
  onReply,
  onResolve,
  onDelete,
}: DocumentAnnotationsProps) {
  const [newAnnotation, setNewAnnotation] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedAnnotations, setExpandedAnnotations] = useState<Set<string>>(new Set());

  const openAnnotations = annotations.filter(a => a.status === 'open');
  const resolvedAnnotations = annotations.filter(a => a.status === 'resolved');

  const toggleExpanded = useCallback((id: string) => {
    setExpandedAnnotations(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSubmitReply = useCallback((annotationId: string) => {
    if (!replyContent.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }
    onReply(annotationId, replyContent);
    setReplyContent('');
    setReplyingTo(null);
    toast.success('Réponse ajoutée');
  }, [replyContent, onReply]);

  const handleAddQuickAnnotation = useCallback(() => {
    if (!newAnnotation.trim()) {
      toast.error('Veuillez entrer un commentaire');
      return;
    }
    // For quick annotations without text selection
    onAddAnnotation(newAnnotation, '', 0, 0);
    setNewAnnotation('');
    toast.success('Annotation ajoutée');
  }, [newAnnotation, onAddAnnotation]);

  return (
    <div className="space-y-4">
      {/* Quick Add Annotation */}
      <div className="p-3 rounded-lg bg-secondary/30 border border-border">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Ajouter un commentaire général
        </label>
        <Textarea
          value={newAnnotation}
          onChange={(e) => setNewAnnotation(e.target.value)}
          placeholder="Écrivez votre commentaire..."
          className="min-h-[60px] mb-2"
        />
        <Button 
          size="sm" 
          onClick={handleAddQuickAnnotation}
          disabled={!newAnnotation.trim()}
        >
          <Send className="w-3 h-3 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Open Annotations */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-medium text-foreground">
            Discussions ouvertes
          </h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {openAnnotations.length}
          </span>
        </div>

        {openAnnotations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Aucune discussion ouverte</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openAnnotations.map((annotation, index) => (
              <AnnotationCard
                key={annotation.id}
                annotation={annotation}
                index={index}
                currentUserId={currentUserId}
                isExpanded={expandedAnnotations.has(annotation.id)}
                isReplying={replyingTo === annotation.id}
                replyContent={replyContent}
                onToggleExpand={() => toggleExpanded(annotation.id)}
                onStartReply={() => setReplyingTo(annotation.id)}
                onCancelReply={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                onReplyContentChange={setReplyContent}
                onSubmitReply={() => handleSubmitReply(annotation.id)}
                onResolve={() => onResolve(annotation.id)}
                onDelete={() => onDelete(annotation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolved Annotations */}
      {resolvedAnnotations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <h4 className="text-sm font-medium text-foreground">
              Résolues
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
              {resolvedAnnotations.length}
            </span>
          </div>

          <div className="space-y-2 opacity-60">
            {resolvedAnnotations.map((annotation, index) => (
              <AnnotationCard
                key={annotation.id}
                annotation={annotation}
                index={index}
                currentUserId={currentUserId}
                isExpanded={expandedAnnotations.has(annotation.id)}
                isReplying={false}
                replyContent=""
                onToggleExpand={() => toggleExpanded(annotation.id)}
                onStartReply={() => {}}
                onCancelReply={() => {}}
                onReplyContentChange={() => {}}
                onSubmitReply={() => {}}
                onResolve={() => {}}
                onDelete={() => onDelete(annotation.id)}
                isResolved
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AnnotationCardProps {
  annotation: DocumentAnnotation;
  index: number;
  currentUserId: string;
  isExpanded: boolean;
  isReplying: boolean;
  replyContent: string;
  onToggleExpand: () => void;
  onStartReply: () => void;
  onCancelReply: () => void;
  onReplyContentChange: (value: string) => void;
  onSubmitReply: () => void;
  onResolve: () => void;
  onDelete: () => void;
  isResolved?: boolean;
}

function AnnotationCard({
  annotation,
  index,
  currentUserId,
  isExpanded,
  isReplying,
  replyContent,
  onToggleExpand,
  onStartReply,
  onCancelReply,
  onReplyContentChange,
  onSubmitReply,
  onResolve,
  onDelete,
  isResolved = false,
}: AnnotationCardProps) {
  const isOwner = annotation.created_by === currentUserId;
  const hasReplies = annotation.replies.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-lg border overflow-hidden",
        isResolved ? "border-success/30 bg-success/5" : "border-border bg-secondary/20"
      )}
    >
      {/* Selected Text Preview */}
      {annotation.position.selected_text && (
        <div className="px-3 py-2 bg-warning/10 border-b border-warning/20">
          <p className="text-xs text-warning font-medium mb-1">Texte sélectionné :</p>
          <p className="text-xs text-foreground/80 italic line-clamp-2">
            "{annotation.position.selected_text}"
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {annotation.created_by_name}
                {isOwner && <span className="text-xs text-primary ml-1">(vous)</span>}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(annotation.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isResolved && (
                <DropdownMenuItem onClick={onResolve}>
                  <Check className="w-4 h-4 mr-2" />
                  Marquer comme résolu
                </DropdownMenuItem>
              )}
              {isOwner && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-foreground mt-2">
          {annotation.content}
        </p>

        {/* Reply count & actions */}
        <div className="flex items-center gap-2 mt-3">
          {hasReplies && (
            <button
              onClick={onToggleExpand}
              className="text-xs text-primary hover:underline"
            >
              {isExpanded ? 'Masquer' : 'Voir'} {annotation.replies.length} réponse{annotation.replies.length > 1 ? 's' : ''}
            </button>
          )}
          {!isResolved && (
            <button
              onClick={onStartReply}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Reply className="w-3 h-3" />
              Répondre
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {isExpanded && hasReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-3 pl-8 space-y-3 bg-background/50">
              {annotation.replies.map((reply, replyIndex) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: replyIndex * 0.05 }}
                  className="flex gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {reply.created_by_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-0.5">
                      {reply.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Input */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-3 bg-background/50">
              <Textarea
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                placeholder="Votre réponse..."
                className="min-h-[50px] text-sm"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={onCancelReply}>
                  Annuler
                </Button>
                <Button size="sm" onClick={onSubmitReply} disabled={!replyContent.trim()}>
                  <Send className="w-3 h-3 mr-1" />
                  Envoyer
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
