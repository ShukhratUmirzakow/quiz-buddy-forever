import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseQuizFile } from '@/lib/quizParser';
import { saveQuiz } from '@/lib/quizStorage';
import { Quiz } from '@/types/quiz';
import { toast } from 'sonner';

interface FileUploadProps {
  onQuizUploaded: (quiz: Quiz) => void;
}

export function FileUpload({ onQuizUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const validExtensions = ['txt', 'docx', 'pdf'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !validExtensions.includes(extension)) {
      toast.error('Invalid file format', {
        description: 'Please upload a .txt, .docx, or .pdf file',
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const quiz = await parseQuizFile(file);
      await saveQuiz(quiz);
      onQuizUploaded(quiz);
      toast.success('Quiz uploaded!', {
        description: `"${quiz.name}" with ${quiz.questions.length} questions`,
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error parsing quiz:', error);
      toast.error('Failed to parse quiz', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.docx,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="quiz-file-input"
      />
      
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        }}
        className={`
          relative rounded-2xl border-2 border-dashed p-8
          transition-colors duration-200 cursor-pointer
          ${isDragging ? 'bg-primary/5' : 'bg-muted/30 hover:bg-muted/50'}
        `}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-foreground">Processing quiz...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedFile?.name}
                </p>
              </div>
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <FileText className="w-12 h-12 text-primary" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  Drop your quiz file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • .txt, .docx, .pdf
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
