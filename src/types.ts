export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'squares' | 'roots' | 'algebra';

export interface MathQuestion {
  id: string;
  num1: number;
  num2: number;
  operation: OperationType;
  operandSymbol: string;
  correctAnswer: number;
  difficultyLevel: number;
  createdAt: number;
  formula?: string; // Preformatted representation for complex formats (e.g. algebra, superscripts)
}

export interface QuestionResult {
  question: MathQuestion;
  typedAnswer: string;
  isCorrect: boolean;
  timeTakenMs: number; // in milliseconds
  xpGained: number;
  newRating: number;
  ratingChange: number;
}

export interface OperationConfig {
  name: string;
  symbol: string;
  color: string; // Tailwind class color
  borderColor: string;
  accentBg: string;
  textColor: string;
}

export interface UserStats {
  ratings: Record<OperationType, number>; // ELO-like ratings, e.g., Addition: 1200
  bestStreak: number;
  totalXP: number;
  totalCorrect: number;
  totalAsked: number;
  totalTimeSpentMs: number;
  recentSessions: {
    id: string;
    timestamp: number;
    totalXP: number;
    correctCount: number;
    totalCount: number;
    avgTimeMs: number;
    accuracy: number;
    operations: OperationType[];
    ratingsSnapshot?: Record<OperationType, number>;
  }[];
}
