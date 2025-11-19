export type QuestionType = 'multiple-choice' | 'translate' | 'fill-gap'| 'connect';;

export interface Vocabulary {
  mk: string;
  tr: string;
  en: string;
  gender?: 'm' | 'f' | 'n';
}

export interface GrammarTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; 
  correctAnswer?: string;
  pairs?: { left: string; right: string }[]; 
  isRecap?: boolean;
   isRetry?: boolean; 
}

export interface Lesson {
  id: string;
  title: string;
  theory: string[];
  vocabulary: Vocabulary[];
  grammarTables: GrammarTable[];
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  exam: QuizQuestion[];
}

// --- NEW STATS TYPE ---
export interface UserStats {
  totalCorrect: number;
  totalIncorrect: number;
  timeSpentSeconds: number; // Total time in app learning
}

export interface UserProgress {
  completedLessons: string[];
  completedModules: string[];
  xp: number;
  stats: UserStats; // Added stats here
}