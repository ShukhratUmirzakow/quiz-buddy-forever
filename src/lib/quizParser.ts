import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { Quiz, QuizQuestion } from '@/types/quiz';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parseQuizFile(file: File): Promise<Quiz> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let content = '';

  switch (extension) {
    case 'txt':
      content = await file.text();
      break;
    case 'docx':
      content = await parseDocx(file);
      break;
    case 'pdf':
      content = await parsePdf(file);
      break;
    default:
      throw new Error(`Unsupported file format: ${extension}. Please use .txt, .docx, or .pdf`);
  }

  return parseQuizContent(content);
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    text += pageText + '\n';
  }

  return text;
}

function parseQuizContent(content: string): Quiz {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  // Find quiz name
  const quizNameLine = lines.find(line => line.startsWith('# QUIZ:') || line.startsWith('#QUIZ:'));
  if (!quizNameLine) {
    throw new Error('Quiz name not found. Please start your quiz with "# QUIZ: Your Quiz Name"');
  }
  
  const quizName = quizNameLine.replace(/^#\s*QUIZ:\s*/i, '').trim();
  if (!quizName) {
    throw new Error('Quiz name is empty. Please provide a quiz name after "# QUIZ:"');
  }

  const questions: QuizQuestion[] = [];
  let currentQuestion: Partial<QuizQuestion> | null = null;
  let currentOptions: { label: string; text: string }[] = [];
  let questionId = 1;

  for (const line of lines) {
    // Skip quiz title line
    if (line.startsWith('# QUIZ:') || line.startsWith('#QUIZ:')) continue;

    // Check for question
    const questionMatch = line.match(/^Q(\d+):\s*(.+)/i);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question && currentOptions.length > 0) {
        questions.push({
          id: questionId++,
          question: currentQuestion.question,
          options: currentOptions,
          correctAnswer: currentQuestion.correctAnswer || 'A',
        });
      }
      
      currentQuestion = { question: questionMatch[2].trim() };
      currentOptions = [];
      continue;
    }

    // Check for options (A, B, C, D)
    const optionMatch = line.match(/^([A-D])\)\s*(.+)/i);
    if (optionMatch && currentQuestion) {
      currentOptions.push({
        label: optionMatch[1].toUpperCase(),
        text: optionMatch[2].trim(),
      });
      continue;
    }

    // Check for answer
    const answerMatch = line.match(/^ANSWER:\s*([A-D])/i);
    if (answerMatch && currentQuestion) {
      currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
      continue;
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.question && currentOptions.length > 0) {
    questions.push({
      id: questionId,
      question: currentQuestion.question,
      options: currentOptions,
      correctAnswer: currentQuestion.correctAnswer || 'A',
    });
  }

  if (questions.length === 0) {
    throw new Error('No valid questions found. Please check your quiz format.');
  }

  return {
    id: crypto.randomUUID(),
    name: quizName,
    questions,
    createdAt: Date.now(),
    totalAttempts: 0,
    bestScore: 0,
  };
}

export function validateQuestionRange(
  start: number,
  end: number,
  totalQuestions: number
): { valid: boolean; error?: string } {
  if (start < 1) {
    return { valid: false, error: 'Start must be at least 1' };
  }
  if (end > totalQuestions) {
    return { valid: false, error: `End cannot exceed total questions (${totalQuestions})` };
  }
  if (start > end) {
    return { valid: false, error: 'Start cannot be greater than end' };
  }
  if (start === end) {
    return { valid: false, error: 'Range must include at least 2 questions' };
  }
  return { valid: true };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function prepareQuizQuestions(
  questions: QuizQuestion[],
  settings: {
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    range?: { start: number; end: number };
  }
): QuizQuestion[] {
  let prepared = [...questions];

  // Apply range first
  if (settings.range) {
    prepared = prepared.slice(settings.range.start - 1, settings.range.end);
  }

  // Shuffle questions if enabled
  if (settings.shuffleQuestions) {
    prepared = shuffleArray(prepared);
  }

  // Shuffle answers for each question if enabled (default on)
  if (settings.shuffleAnswers) {
    prepared = prepared.map(q => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  }

  return prepared;
}
