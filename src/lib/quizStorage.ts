import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Quiz, QuizAttempt, UserStats } from '@/types/quiz';

interface QuizDB extends DBSchema {
  quizzes: {
    key: string;
    value: Quiz;
    indexes: { 'by-created': number };
  };
  attempts: {
    key: string;
    value: QuizAttempt;
    indexes: { 'by-quiz': string; 'by-completed': number };
  };
  stats: {
    key: string;
    value: UserStats;
  };
}

const DB_NAME = 'quizmaster-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<QuizDB> | null = null;

async function getDB(): Promise<IDBPDatabase<QuizDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<QuizDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Quizzes store
      if (!db.objectStoreNames.contains('quizzes')) {
        const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
        quizStore.createIndex('by-created', 'createdAt');
      }

      // Attempts store
      if (!db.objectStoreNames.contains('attempts')) {
        const attemptStore = db.createObjectStore('attempts', { keyPath: 'id' });
        attemptStore.createIndex('by-quiz', 'quizId');
        attemptStore.createIndex('by-completed', 'completedAt');
      }

      // Stats store
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// Quiz operations
export async function saveQuiz(quiz: Quiz): Promise<void> {
  const db = await getDB();
  await db.put('quizzes', quiz);
}

export async function getQuiz(id: string): Promise<Quiz | undefined> {
  const db = await getDB();
  return db.get('quizzes', id);
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const db = await getDB();
  const quizzes = await db.getAllFromIndex('quizzes', 'by-created');
  return quizzes.reverse(); // Most recent first
}

export async function deleteQuiz(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('quizzes', id);
  
  // Also delete related attempts
  const attempts = await db.getAllFromIndex('attempts', 'by-quiz', id);
  const tx = db.transaction('attempts', 'readwrite');
  await Promise.all(attempts.map(attempt => tx.store.delete(attempt.id)));
  await tx.done;
}

export async function updateQuizStats(quizId: string, score: number): Promise<void> {
  const db = await getDB();
  const quiz = await db.get('quizzes', quizId);
  if (quiz) {
    quiz.totalAttempts += 1;
    quiz.lastPlayed = Date.now();
    if (score > quiz.bestScore) {
      quiz.bestScore = score;
    }
    await db.put('quizzes', quiz);
  }
}

// Attempt operations
export async function saveAttempt(attempt: QuizAttempt): Promise<void> {
  const db = await getDB();
  await db.put('attempts', attempt);
}

export async function getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
  const db = await getDB();
  return db.getAllFromIndex('attempts', 'by-quiz', quizId);
}

export async function getRecentAttempts(limit: number = 10): Promise<QuizAttempt[]> {
  const db = await getDB();
  const attempts = await db.getAllFromIndex('attempts', 'by-completed');
  return attempts.reverse().slice(0, limit);
}

// Stats operations
export async function getUserStats(): Promise<UserStats> {
  const db = await getDB();
  const stats = await db.get('stats', 'user-stats');
  return stats || {
    totalScore: 0,
    totalQuizzesTaken: 0,
    totalCorrectAnswers: 0,
    totalQuestionsAnswered: 0,
  };
}

export async function updateUserStats(correctAnswers: number, totalQuestions: number): Promise<void> {
  const db = await getDB();
  const currentStats = await getUserStats();
  
  const updatedStats: UserStats & { id: string } = {
    id: 'user-stats',
    totalScore: currentStats.totalScore + correctAnswers,
    totalQuizzesTaken: currentStats.totalQuizzesTaken + 1,
    totalCorrectAnswers: currentStats.totalCorrectAnswers + correctAnswers,
    totalQuestionsAnswered: currentStats.totalQuestionsAnswered + totalQuestions,
  };
  
  await db.put('stats', updatedStats);
}
