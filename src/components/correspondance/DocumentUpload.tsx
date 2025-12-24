import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'uploading' | 'complete' | 'error';
  progress: number;
}

interface DocumentUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return FileImage;
  if (type === 'application/pdf' || type.includes('document')) return FileText;
  return File;
};

export function DocumentUpload({ 
  onFilesUploaded, 
  maxFiles = 10,
  acceptedTypes = ['application/pdf', 'image/*', '.doc', '.docx', '.txt']
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];
    const filesToProcess = Array.from(fileList).slice(0, maxFiles - files.length);

    filesToProcess.forEach(file => {
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, preview: e.target?.result as string }
              : f
          ));
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'complete', progress: 100 }
              : f
          ));
          toast.success(`${file.name} téléchargé`);
        } else {
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: Math.min(progress, 99) }
              : f
          ));
        }
      }, 200);
    });
  }, [files.length, maxFiles]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleConfirm = useCallback(() => {
    const completedFiles = files.filter(f => f.status === 'complete');
    onFilesUploaded(completedFiles);
    setFiles([]);
    toast.success(`${completedFiles.length} document(s) ajouté(s)`);
  }, [files, onFilesUploaded]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
        animate={{ 
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'hsl(var(--primary))' : undefined
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <motion.div
          animate={{ y: isDragging ? -5 : 0 }}
          className="flex flex-col items-center"
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
            isDragging ? "bg-primary/20" : "bg-secondary"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <p className="text-sm font-medium text-foreground mb-1">
            {isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos documents'}
          </p>
          <p className="text-xs text-muted-foreground">
            ou cliquez pour parcourir • PDF, Images, Documents
          </p>
        </motion.div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  {/* Preview or Icon */}
                  {file.preview ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background">
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      {file.status === 'uploading' && (
                        <div className="flex-1 max-w-[100px] h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(file.progress)}%
                      </span>
                    )}
                    {file.status === 'complete' && (
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                    )}
                    {file.status === 'error' && (
                      <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Confirm Button */}
            {files.some(f => f.status === 'complete') && (
              <Button
                variant="default"
                className="w-full mt-3"
                onClick={handleConfirm}
              >
                <Check className="w-4 h-4 mr-2" />
                Ajouter {files.filter(f => f.status === 'complete').length} document(s)
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
