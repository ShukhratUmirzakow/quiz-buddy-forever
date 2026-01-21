export interface QuizAnswer {
  questionIndex: number;
  questionId?: number; // Actual question ID for retry logic
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  questionText: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    text: string;
  }[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  name: string;
  questions: QuizQuestion[];
  createdAt: number;
  lastPlayed?: number;
  totalAttempts: number;
  bestScore: number;
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  fastMode: boolean;
  questionRange: {
    enabled: boolean;
    start: number;
    end: number;
  };
  specificQuestionIds?: number[]; // For retry wrong - specific question IDs to play
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: number;
  answers: QuizAnswer[];
}

export interface UserStats {
  totalScore: number;
  totalQuizzesTaken: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
}

export type BadgeType = 'gold' | 'silver' | 'bronze' | 'participant';

export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  minPercentage: number;
}

export const BADGES: Badge[] = [
  { type: 'gold', name: 'Gold Medal', description: 'Outstanding!', minPercentage: 90 },
  { type: 'silver', name: 'Silver Medal', description: 'Great job!', minPercentage: 70 },
  { type: 'bronze', name: 'Bronze Medal', description: 'Good effort!', minPercentage: 50 },
  { type: 'participant', name: 'Participant', description: 'Keep practicing!', minPercentage: 0 },
];

export const getBadge = (percentage: number): Badge => {
  return BADGES.find(badge => percentage >= badge.minPercentage) || BADGES[BADGES.length - 1];
};