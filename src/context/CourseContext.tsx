import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import type { UserProgress } from "../types";
import {
  getProgress,
  saveProgress as saveToStorage,
} from "../services/storage";

interface ContextType {
  progress: UserProgress;
  isAdmin: boolean;
  toggleAdmin: () => void;
  finishLesson: (lessonId: string, xp: number) => void;
  passModule: (moduleId: string, xp: number) => void;
  resetProgress: () => void;
  updateStats: (correct: number, incorrect: number, timeToAdd: number) => void;

  // NEW: Navigation State
  lastViewedLesson: string | null;
  setLastViewedLesson: (lessonId: string | null) => void;
}

const CourseContext = createContext<ContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [progress, setProgress] = useState<UserProgress>(getProgress());
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem("mk_admin_mode");
    return stored === "true";
  });

  const sessionStartTime = useRef(Date.now());

  // NEW STATE
  const [lastViewedLesson, setLastViewedLesson] = useState<string | null>(null);

  useEffect(() => {
    saveToStorage(progress);
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("mk_admin_mode", String(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStartTime.current) / 1000);
      if (elapsed > 0) {
        updateStats(0, 0, elapsed);
        sessionStartTime.current = now;
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleAdmin = () => setIsAdmin((prev) => !prev);

  const updateStats = (
    correct: number,
    incorrect: number,
    timeToAdd: number,
  ) => {
    setProgress((prev) => ({
      ...prev,
      stats: {
        totalCorrect: prev.stats.totalCorrect + correct,
        totalIncorrect: prev.stats.totalIncorrect + incorrect,
        timeSpentSeconds: prev.stats.timeSpentSeconds + timeToAdd,
      },
    }));
  };

  const finishLesson = (lessonId: string, xp: number) => {
    setProgress((prev) => {
      const isNew = !prev.completedLessons.includes(lessonId);
      return {
        ...prev,
        completedLessons: isNew
          ? [...prev.completedLessons, lessonId]
          : prev.completedLessons,
        xp: prev.xp + (isNew ? xp : Math.floor(xp / 5)),
      };
    });
  };

  const passModule = (moduleId: string, xp: number) => {
    setProgress((prev) => {
      const isNew = !prev.completedModules.includes(moduleId);
      return {
        ...prev,
        completedModules: isNew
          ? [...prev.completedModules, moduleId]
          : prev.completedModules,
        xp: prev.xp + (isNew ? xp : 0),
      };
    });
  };

  const resetProgress = () => {
    const emptyState: UserProgress = {
      completedLessons: [],
      completedModules: [],
      xp: 0,
      stats: { totalCorrect: 0, totalIncorrect: 0, timeSpentSeconds: 0 },
    };
    setProgress(emptyState);
    saveToStorage(emptyState);
    setIsAdmin(false);
    sessionStartTime.current = Date.now();
  };

  return (
    <CourseContext.Provider
      value={{
        progress,
        isAdmin,
        toggleAdmin,
        finishLesson,
        passModule,
        resetProgress,
        updateStats,
        lastViewedLesson,
        setLastViewedLesson, // Exported
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse outside Provider");
  return ctx;
};
