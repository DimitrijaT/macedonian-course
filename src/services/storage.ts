import type { UserProgress } from '../types';

const KEY = 'mk_course_v3'; // Increment version to force reset for new structure if needed

const defaultProgress: UserProgress = { 
  completedLessons: [], 
  completedModules: [],
  xp: 0,
  stats: {
    totalCorrect: 0,
    totalIncorrect: 0,
    timeSpentSeconds: 0
  }
};

export const getProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress;
    
    const parsed = JSON.parse(raw);
    // Merge with default to ensure stats object exists if upgrading from old version
    return { ...defaultProgress, ...parsed, stats: { ...defaultProgress.stats, ...(parsed.stats || {}) } };
  } catch {
    return defaultProgress;
  }
};

export const saveProgress = (data: UserProgress) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};