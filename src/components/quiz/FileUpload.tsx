import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import { parseQuizFile } from '@/lib/quizParser';
import { saveQuiz } from '@/lib/quizStorage';
import { Quiz } from '@/types/quiz';
import { toast } from 'sonner';
import { GlowIcon } from '@/components/GlowIcon';

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
        }}
        className={`
          relative rounded-2xl border-2 border-dashed p-8 cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/20 bg-white/5 hover:border-violet-400/50 hover:bg-violet-500/5'}
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
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Processing quiz...</p>
                <p className="text-sm text-white/40 mt-1">
                  {selectedFile?.name}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <GlowIcon icon={Upload} color="violet" size="lg" />
              <div className="text-center">
                <p className="font-semibold text-white">
                  Drop your quiz file here
                </p>
                <p className="text-sm text-white/40 mt-1">
                  or tap to browse
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="px-2 py-1 rounded-lg bg-white/10 text-xs font-medium text-white/50">.txt</span>
                  <span className="px-2 py-1 rounded-lg bg-white/10 text-xs font-medium text-white/50">.docx</span>
                  <span className="px-2 py-1 rounded-lg bg-white/10 text-xs font-medium text-white/50">.pdf</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
