import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { COURSE_DATA } from "../data/course";
import { useCourse } from "../context/CourseContext";
import {
  Check,
  Lock,
  Star,
  Zap,
  Play,
  Settings,
  X,
  Trash2,
  Crown,
  ShieldCheck,
  Unlock,
  Clock,
  Target,
  LocateIcon,
} from "lucide-react";
import { Button } from "../components/UI";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const Dashboard = () => {
  const {
    progress,
    isAdmin,
    toggleAdmin,
    resetProgress,
    lastViewedLesson,
    setLastViewedLesson,
  } = useCourse();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const lessonRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const totalAttempts =
    progress.stats.totalCorrect + progress.stats.totalIncorrect;
  const accuracy =
    totalAttempts > 0
      ? Math.round((progress.stats.totalCorrect / totalAttempts) * 100)
      : 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowJumpBtn(currentScrollY > 300);

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Use a small timeout to allow the DOM to render
    const timer = setTimeout(() => {
      let targetId = null;

      if (lastViewedLesson) {
        targetId = lastViewedLesson;
        setLastViewedLesson(null);
      } else {
        // Find active lesson
        for (const mod of COURSE_DATA) {
          for (const l of mod.lessons) {
            if (!progress.completedLessons.includes(l.id)) {
              targetId = l.id;
              break;
            }
          }
          if (targetId) break;
        }
      }

      if (targetId) {
        const el = lessonRefs.current.get(targetId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAdmin]);

  const jumpToCurrent = () => {
    let targetId = null;
    for (const mod of COURSE_DATA) {
      for (const l of mod.lessons) {
        if (!progress.completedLessons.includes(l.id)) {
          targetId = l.id;
          break;
        }
      }
      if (targetId) break;
    }
    if (targetId) {
      const el = lessonRefs.current.get(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="max-w-md mx-auto pb-40 min-h-screen relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[30%] bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-10%] w-[60%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <header
        className={`
            fixed top-4 left-0 right-0 z-50 mx-4 max-w-md md:mx-auto transition-transform duration-300 ease-in-out
            ${isHeaderVisible ? "translate-y-0" : "-translate-y-[150%]"}
        `}
      >
        <div className="bg-white/90 backdrop-blur-xl border-2 border-gray-100/50 rounded-2xl px-4 py-3 flex justify-between items-center shadow-xl shadow-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 bg-red-600 rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-white shadow-md shrink-0 ring-1 ring-gray-200">
              <div className="absolute bg-yellow-400 w-12 h-1.5 rounded-full rotate-90 shadow-sm"></div>
              <div className="absolute bg-yellow-400 w-12 h-1.5 rounded-full shadow-sm"></div>
              <div className="absolute bg-yellow-400 w-12 h-1.5 rounded-full rotate-45 shadow-sm"></div>
              <div className="absolute bg-yellow-400 w-12 h-1.5 rounded-full -rotate-45 shadow-sm"></div>
              <div className="bg-yellow-400 w-3.5 h-3.5 rounded-full z-10 relative shadow-sm"></div>
            </div>
            {isAdmin && (
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200 text-yellow-600 font-black">
              <Crown className="w-5 h-5 fill-current" />
              <span>{progress.completedModules.length}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-brand/5 px-3 py-1 rounded-xl border border-brand/20 text-brand font-black">
              <Zap className="w-5 h-5 fill-current" />
              <span>{progress.xp}</span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-xl transition-all active:scale-90"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-6 shadow-2xl border-2 border-gray-100 relative animate-pop mb-4 sm:mb-0 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-black text-gray-800 mb-8 text-center tracking-tight">
              Profile
            </h2>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-brand/5 border-2 border-brand/10 p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-brand uppercase tracking-widest mb-1">
                      Total XP
                    </div>
                    <div className="text-4xl font-black text-brand-dark">
                      {progress.xp}
                    </div>
                  </div>
                  <div className="bg-brand text-white p-3 rounded-2xl">
                    <Zap className="w-8 h-8 fill-current" />
                  </div>
                </div>

                <div className="bg-gray-50 border-2 border-gray-100 p-4 rounded-3xl">
                  <Target className="w-6 h-6 text-blue-500 mb-2" />
                  <div className="text-2xl font-black text-gray-800">
                    {accuracy}%
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Accuracy
                  </div>
                </div>

                <div className="bg-gray-50 border-2 border-gray-100 p-4 rounded-3xl">
                  <Clock className="w-6 h-6 text-orange-500 mb-2" />
                  <div className="text-2xl font-black text-gray-800">
                    {formatTime(progress.stats.timeSpentSeconds)}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Time Spent
                  </div>
                </div>

                <div className="col-span-2 flex gap-4 bg-gray-50 border-2 border-gray-100 p-4 rounded-3xl justify-around">
                  <div className="text-center">
                    <div className="text-green-500 font-black text-xl">
                      {progress.stats.totalCorrect}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Correct
                    </div>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-red-500 font-black text-xl">
                      {progress.stats.totalIncorrect}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Mistakes
                    </div>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-gray-700 font-black text-xl">
                      {progress.completedLessons.length}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Lessons
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isAdmin
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-gray-800">Admin Mode</div>
                    <div className="text-xs text-gray-400 font-bold">
                      Unlock all content
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isAdmin) {
                      toggleAdmin();
                    } else {
                      const p = prompt("Password");
                      if (p === "#DimiKimi12345!") toggleAdmin();
                      else if (p !== null) alert("Wrong password");
                    }
                  }}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    isAdmin ? "bg-black" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      isAdmin ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure? This will delete all progress and stats.",
                      )
                    ) {
                      resetProgress();
                      setIsSettingsOpen(false);
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-4"
                >
                  <Trash2 className="w-5 h-5" /> Reset All Progress
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={jumpToCurrent}
        className={`
            fixed bottom-6 right-6 z-40 bg-brand text-white p-4 rounded-full shadow-xl shadow-brand/30 border-4 border-white transition-all duration-500
            ${
              showJumpBtn
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-20 opacity-0 scale-0"
            }
            hover:scale-110 active:scale-90
        `}
      >
        <LocateIcon className="w-6 h-6 stroke-[4]" />
      </button>

      <div className="p-4 space-y-20 mt-24">
        {COURSE_DATA.map((mod, modIndex) => {
          const isModLocked =
            !isAdmin &&
            modIndex > 0 &&
            !progress.completedModules.includes(COURSE_DATA[modIndex - 1].id);
          const isModCompleted = progress.completedModules.includes(mod.id);

          return (
            <div
              key={mod.id}
              className={`relative transition-all duration-500 ${
                isModLocked ? "opacity-50 grayscale" : "opacity-100"
              }`}
            >
              <div
                className={`mb-12 p-6 rounded-[32px] text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] transform transition-transform border-b-8 ${
                  isModLocked
                    ? "bg-gray-400 border-gray-500"
                    : "bg-brand border-brand-dark"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight leading-none mb-2">
                      {mod.title}
                    </h2>
                    <p className="opacity-90 text-sm font-bold leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                  {isModCompleted && (
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Crown className="w-6 h-6 text-white fill-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-8 relative">
                {mod.lessons.map((lesson, lessonIndex) => {
                  const isDone = progress.completedLessons.includes(lesson.id);
                  const prevLessonDone =
                    lessonIndex === 0 ||
                    progress.completedLessons.includes(
                      mod.lessons[lessonIndex - 1].id,
                    );
                  const isStandardLocked = isModLocked || !prevLessonDone;
                  const isLocked = !isAdmin && isStandardLocked;
                  const isActive = !isLocked && !isDone;
                  const offset =
                    lessonIndex % 2 === 0
                      ? "0px"
                      : lessonIndex % 4 === 1
                        ? "40px"
                        : "-40px";

                  return (
                    <Link
                      key={lesson.id}
                      to={isLocked ? "#" : `/lesson/${mod.id}/${lesson.id}`}
                      ref={(el) => {
                        if (el) lessonRefs.current.set(lesson.id, el);
                      }}
                      className={`relative group z-10 flex flex-col items-center ${
                        isLocked ? "cursor-default" : "cursor-pointer"
                      }`}
                      style={{ transform: `translateX(${offset})` }}
                    >
                      {lessonIndex < mod.lessons.length - 1 && (
                        <div
                          className={`absolute top-10 left-1/2 w-4 h-24 -ml-2 -z-10 rounded-full border-x-2 border-black/5 ${
                            isDone ? "bg-brand" : "bg-gray-200"
                          }`}
                        />
                      )}
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-b-[6px] transition-all duration-200 shadow-xl relative ${
                          isDone
                            ? "bg-brand border-brand-dark ring-4 ring-brand/20"
                            : isLocked
                              ? "bg-gray-100 border-gray-300"
                              : "bg-white border-gray-200 hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-1.5"
                        }`}
                      >
                        {isDone ? (
                          <Check className="text-white w-10 h-10 stroke-[4]" />
                        ) : isLocked ? (
                          <Lock className="text-gray-300 w-8 h-8" />
                        ) : (
                          <div className="relative">
                            {isAdmin && isStandardLocked && (
                              <div className="absolute -top-3 -right-3 bg-black text-white rounded-full p-1 z-10">
                                <Unlock className="w-3 h-3" />
                              </div>
                            )}
                            <Star
                              className={`w-10 h-10 transition-colors ${
                                isAdmin && isStandardLocked
                                  ? "text-gray-400 fill-gray-200"
                                  : "text-brand fill-brand"
                              }`}
                            />
                            {!isAdmin && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                              </div>
                            )}
                          </div>
                        )}
                        {isActive && !isAdmin && (
                          <div className="absolute -inset-4 border-[3px] border-brand/40 border-dashed rounded-full animate-spin-slow pointer-events-none"></div>
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 transition-all ${
                          isActive
                            ? "translate-y-0"
                            : "group-hover:translate-y-0 translate-y-1 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg border-b-4 transition-colors ${
                            isActive
                              ? "bg-brand text-white border-brand-dark"
                              : "bg-white text-gray-400 border-gray-200"
                          }`}
                        >
                          Level {lessonIndex + 1}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-24 px-4 relative z-20">
                <Button
                  variant={
                    !isAdmin && isModLocked
                      ? "locked"
                      : isModCompleted
                        ? "outline"
                        : "danger"
                  }
                  fullWidth
                  onClick={() =>
                    (isAdmin || !isModLocked) && navigate(`/exam/${mod.id}`)
                  }
                  className="py-5 text-lg shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group"
                  disabled={!isAdmin && isModLocked}
                >
                  {!isAdmin && isModLocked ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  )}
                  <span className="relative z-10">
                    {isModCompleted ? "Practice Mastered" : "Prove Mastery"}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
