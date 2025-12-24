import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DocumentAnnotation } from '@/types/correspondance';
import { cn } from '@/lib/utils';

interface SelectableDocumentContentProps {
  content: string;
  annotations: DocumentAnnotation[];
  onAddAnnotation: (content: string, selectedText: string, startOffset: number, endOffset: number) => void;
}

interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  rect: DOMRect;
}

export function SelectableDocumentContent({
  content,
  annotations,
  onAddAnnotation,
}: SelectableDocumentContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [comment, setComment] = useState('');
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  // Get highlighted ranges from open annotations
  const highlightedRanges = annotations
    .filter(a => a.status === 'open' && a.position.selected_text)
    .map(a => ({
      start: a.position.start_offset,
      end: a.position.end_offset,
      text: a.position.selected_text,
      id: a.id,
    }));

  const handleMouseUp = useCallback(() => {
    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.isCollapsed || !contentRef.current) {
      return;
    }

    const selectedText = windowSelection.toString().trim();
    if (!selectedText || selectedText.length < 2) {
      return;
    }

    const range = windowSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();

    // Calculate offset within the content
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(contentRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preSelectionRange.toString().length;
    const endOffset = startOffset + selectedText.length;

    setSelection({
      text: selectedText,
      startOffset,
      endOffset,
      rect,
    });

    // Position the popover above the selection
    setPopoverPosition({
      top: rect.top - containerRect.top - 10,
      left: rect.left - containerRect.left + rect.width / 2,
    });

    setShowPopover(true);
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.annotation-popover') && !window.getSelection()?.toString()) {
      setShowPopover(false);
      setSelection(null);
      setComment('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSubmit = useCallback(() => {
    if (!selection || !comment.trim()) return;

    onAddAnnotation(comment, selection.text, selection.startOffset, selection.endOffset);
    setShowPopover(false);
    setSelection(null);
    setComment('');
    window.getSelection()?.removeAllRanges();
  }, [selection, comment, onAddAnnotation]);

  const handleCancel = useCallback(() => {
    setShowPopover(false);
    setSelection(null);
    setComment('');
    window.getSelection()?.removeAllRanges();
  }, []);

  // Render content with highlights
  const renderHighlightedContent = () => {
    if (highlightedRanges.length === 0) {
      return content;
    }

    // Sort ranges by start position
    const sortedRanges = [...highlightedRanges].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedRanges.forEach((range, index) => {
      // Add text before this range
      if (range.start > lastEnd) {
        parts.push(content.slice(lastEnd, range.start));
      }

      // Add highlighted text
      const highlightedText = content.slice(range.start, range.end);
      if (highlightedText) {
        parts.push(
          <mark
            key={range.id}
            className="bg-warning/30 text-foreground rounded px-0.5 cursor-pointer hover:bg-warning/50 transition-colors"
            title="Cliquez pour voir l'annotation"
          >
            {highlightedText}
          </mark>
        );
      }

      lastEnd = range.end;
    });

    // Add remaining text
    if (lastEnd < content.length) {
      parts.push(content.slice(lastEnd));
    }

    return parts;
  };

  return (
    <div className="relative">
      {/* Selectable Content */}
      <div
        ref={contentRef}
        onMouseUp={handleMouseUp}
        className="p-4 rounded-lg bg-secondary/30 min-h-[150px] select-text cursor-text"
      >
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {renderHighlightedContent()}
        </p>
      </div>

      {/* Selection hint */}
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquare className="w-3 h-3" />
        <span>Sélectionnez du texte pour ajouter une annotation</span>
      </div>

      {/* Annotation Popover */}
      <AnimatePresence>
        {showPopover && selection && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="annotation-popover absolute z-50"
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-popover border border-border rounded-lg shadow-xl p-3 w-[280px]">
              {/* Selected text preview */}
              <div className="mb-2 p-2 rounded bg-warning/10 border border-warning/20">
                <p className="text-xs text-muted-foreground mb-1">Texte sélectionné :</p>
                <p className="text-xs text-foreground italic line-clamp-2">
                  "{selection.text}"
                </p>
              </div>

              {/* Comment input */}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajouter votre commentaire..."
                className="min-h-[60px] text-sm mb-2"
                autoFocus
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="w-3 h-3 mr-1" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!comment.trim()}
                  className="flex-1"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Annoter
                </Button>
              </div>

              {/* Arrow */}
              <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-border" />
              <div className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-popover" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
