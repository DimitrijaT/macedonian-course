import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { COURSE_DATA } from "../data/course";
import { useCourse } from "../context/CourseContext";
import { Button } from "../components/UI";
import { QuestionRenderer } from "../components/QuestionTypes";
import {
  X,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { shuffleArray } from "../utils/shuffle";
import type { QuizQuestion } from "../types";

// --- COMPACT MASCOT ---
const Mascot = ({ emotion }: { emotion: "neutral" | "happy" | "sad" }) => (
  <div
    className={`w-14 h-14 bg-white rounded-full border-[3px] border-gray-200 shadow-md flex items-center justify-center text-2xl transition-transform duration-300 ${emotion === "happy" ? "scale-110 border-brand rotate-12" : emotion === "sad" ? "scale-90 border-danger -rotate-12" : ""}`}
  >
    {emotion === "neutral" && "🦁"}
    {emotion === "happy" && "🤩"}
    {emotion === "sad" && "🙈"}
  </div>
);

// --- HELPER: Runtime Recap Generator ---
const generateRecapQuestions = (
  currentModId: string,
  currentLessonId: string,
): QuizQuestion[] => {
  const mod = COURSE_DATA.find((m) => m.id === currentModId);
  if (!mod) return [];
  const lessonIndex = mod.lessons.findIndex((l) => l.id === currentLessonId);
  if (lessonIndex <= 0) return [];
  const recaps: QuizQuestion[] = [];
  if (lessonIndex > 0) {
    const prevLesson = mod.lessons[lessonIndex - 1];
    const candidates = prevLesson.quiz.filter((q) => q.type !== "connect");
    const picked = shuffleArray(candidates).slice(0, 2);
    picked.forEach((q) =>
      recaps.push({ ...q, id: `recap_1_${q.id}_${Date.now()}`, isRecap: true }),
    );
  }
  if (lessonIndex > 1) {
    const prevPrevLesson = mod.lessons[lessonIndex - 2];
    const candidates = prevPrevLesson.quiz.filter((q) => q.type !== "connect");
    const picked = shuffleArray(candidates).slice(0, 1);
    picked.forEach((q) =>
      recaps.push({ ...q, id: `recap_2_${q.id}_${Date.now()}`, isRecap: true }),
    );
  }
  return recaps;
};

export const QuizView = () => {
  const { mid, lid } = useParams();
  const navigate = useNavigate();
  const { finishLesson, updateStats } = useCourse();
  const mod = COURSE_DATA.find((m) => m.id === mid);
  const lesson = mod?.lessons.find((l) => l.id === lid);

  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [totalInitialQuestions, setTotalInitialQuestions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const [sel, setSel] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [complete, setComplete] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const startTime = useRef(Date.now());
  const sessionCorrect = useRef(0);
  const sessionIncorrect = useRef(0);

  // Init
  useEffect(() => {
    if (lesson && mid && lid && !isInitialized) {
      const baseQuestions = [...lesson.quiz];
      const recaps = generateRecapQuestions(mid, lid);
      const finalQueue = [...recaps, ...baseQuestions];
      setQueue(finalQueue);
      setTotalInitialQuestions(finalQueue.length);
      setIsInitialized(true);
    }
  }, [lesson, mid, lid, isInitialized]);

  const currentQ = queue[0];

  useEffect(() => {
    if (currentQ) {
      if (currentQ.options) setShuffledOptions(shuffleArray(currentQ.options));
      setSel(null);
      setStatus("idle");
    }
  }, [currentQ]);

  // Handlers
  const handleResult = (isCorrect: boolean) => {
    if (isCorrect) {
      setStatus("correct");
      sessionCorrect.current += 1;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#58cc02", "#89e219"],
      });
    } else {
      setStatus("wrong");
      sessionIncorrect.current += 1;
    }
  };

  const check = () => {
    if (!sel) return;
    handleResult(sel === currentQ.correctAnswer);
  };

  const handleConnectComplete = (success: boolean) => {
    if (success) handleResult(true);
  };

  const next = () => {
    let nextQueue = [...queue];
    if (status === "wrong") {
      const [current, ...rest] = nextQueue;
      const retryQuestion = { ...current, isRetry: true }; // Mark as retry
      nextQueue = [...rest, retryQuestion];
    } else {
      nextQueue = nextQueue.slice(1);
      setCorrectCount((prev) => prev + 1);
    }

    if (nextQueue.length === 0) {
      finishQuiz();
    } else {
      setQueue(nextQueue);
      setSel(null);
      setStatus("idle");
    }
  };

  const finishQuiz = () => {
    setComplete(true);
    finishLesson(lesson!.id, 20);
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    updateStats(sessionCorrect.current, sessionIncorrect.current, timeSpent);
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
  };

  if (complete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f0fdf4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="animate-pop text-center z-10 w-full max-w-sm">
          <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl shadow-xl border-4 border-yellow-200">
            🏆
          </div>
          <h2 className="text-3xl font-black text-brand-dark mb-2 tracking-tight">
            Lesson Complete!
          </h2>
          <div className="flex items-center justify-center gap-3 bg-yellow-50 px-8 py-3 rounded-2xl text-yellow-700 font-black text-lg mb-8 border-2 border-yellow-200 shadow-sm">
            <Zap className="w-5 h-5 fill-current" /> +20 XP
          </div>
          <Button
            onClick={() => navigate("/")}
            fullWidth
            className="text-lg py-3 shadow-xl"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson || !currentQ)
    return (
      <div className="flex h-screen items-center justify-center font-bold text-gray-400 animate-pulse">
        Loading...
      </div>
    );

  const isConnectType = currentQ.type === "connect";
  const showCheckButton = !isConnectType;
  const progressPercentage = Math.min(
    100,
    (correctCount / totalInitialQuestions) * 100,
  );
  const mistakesCount =
    queue.length > totalInitialQuestions - correctCount
      ? queue.length - (totalInitialQuestions - correctCount)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-4 max-w-md mx-auto w-full z-10 relative bg-slate-50/90 backdrop-blur-sm">
        <X
          className="text-gray-300 cursor-pointer hover:text-gray-500"
          onClick={() => navigate("/")}
        />
        <div className="flex-1">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative transform translate-z-0">
            <div
              className="h-full bg-brand transition-all duration-500 ease-out rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>
        {mistakesCount > 0 && (
          <div className="text-xs font-bold text-orange-400 flex items-center gap-1 animate-pulse">
            <RotateCcw className="w-3 h-3" />
            <span>+{mistakesCount}</span>
          </div>
        )}
      </div>

      {/* Question Area */}
      <div className="flex-1 px-4 flex flex-col max-w-md mx-auto w-full pb-32 relative">
        {/* --- BADGE HEADER (Integrated into layout) --- */}
        <div className="h-8 flex justify-center items-end mb-2">
          {currentQ.isRecap && (
            <div className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 animate-pop">
              <RotateCcw className="w-3 h-3" /> Recap
            </div>
          )}
          {currentQ.isRetry && (
            <div className="bg-red-100 text-red-600 border border-red-200 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 animate-pop">
              <AlertTriangle className="w-3 h-3" /> Fix Mistake
            </div>
          )}
        </div>

        {/* --- QUESTION CONTENT --- */}
        <div
          className={`relative z-10 ${status === "wrong" ? "animate-shake" : ""}`}
        >
          {/* Small Mascot integrated next to question on non-connect types */}
          {!isConnectType && (
            <div className="absolute -top-4 -right-2 z-20 transform rotate-6">
              <Mascot
                emotion={
                  status === "idle"
                    ? "neutral"
                    : status === "correct"
                      ? "happy"
                      : "sad"
                }
              />
            </div>
          )}

          <QuestionRenderer
            key={currentQ.id}
            question={currentQ}
            selectedOption={sel}
            onSelect={setSel}
            status={status}
            shuffledOptions={shuffledOptions}
            onConnectComplete={handleConnectComplete}
          />
        </div>
      </div>

      {/* Footer Action */}
      <div
        className={`
        fixed bottom-0 left-0 w-full px-4 py-6 border-t-2 transition-all duration-300 z-50
        ${status === "correct" ? "bg-brand/5 border-brand" : status === "wrong" ? "bg-danger/5 border-danger" : "bg-white border-gray-100"}
      `}
      >
        <div className="max-w-md mx-auto flex justify-between items-center gap-4">
          <div className="flex-1">
            {status === "idle" && !isConnectType && (
              <div className="hidden sm:block text-gray-400 font-bold text-xs uppercase tracking-wider pl-1">
                Select answer
              </div>
            )}
            {status === "correct" && (
              <div className="flex items-center gap-2 text-brand-dark font-extrabold text-lg animate-pop">
                <div className="bg-white p-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-6 h-6 fill-brand text-white" />
                </div>
                <div>Excellent!</div>
              </div>
            )}
            {status === "wrong" && (
              <div className="animate-shake">
                <div className="flex items-center gap-2 text-danger-dark font-extrabold text-lg mb-0.5">
                  <XCircle className="w-6 h-6 fill-danger text-white" />{" "}
                  Incorrect
                </div>
                <div className="text-danger-dark text-xs font-bold ml-8 opacity-80">
                  Correct: {currentQ.correctAnswer || "Match pairs"}
                </div>
              </div>
            )}
          </div>

          {status === "correct" || status === "wrong" ? (
            <Button
              onClick={next}
              variant={status === "correct" ? "primary" : "danger"}
              className="w-full sm:w-auto min-w-[140px] text-lg shadow-lg py-3"
            >
              CONTINUE
            </Button>
          ) : showCheckButton ? (
            <Button
              onClick={check}
              disabled={!sel}
              variant="secondary"
              className="w-full sm:w-auto min-w-[140px] text-lg shadow-lg py-3"
            >
              CHECK
            </Button>
          ) : (
            <div className="text-gray-400 font-bold text-xs uppercase tracking-widest opacity-50 mr-2">
              Match all pairs
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
