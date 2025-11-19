import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSE_DATA } from '../data/course';
import { useCourse } from '../context/CourseContext';
import { Button, ProgressBar } from '../components/UI';
import { QuestionRenderer } from '../components/QuestionTypes';
import { X, Trophy, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle';

export const ExamView = () => {
  const { mid } = useParams();
  const navigate = useNavigate();
  const { passModule, updateStats } = useCourse();
  
  const mod = COURSE_DATA.find(m => m.id === mid);
  const questions = mod?.exam || [];
  const PASS_THRESHOLD = 0.51;

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Session Stats
  const startTime = useRef(Date.now());
  const sessionCorrect = useRef(0);
  const sessionIncorrect = useRef(0);

  const q = questions[idx];

  useEffect(() => {
    if (q) {
        if(q.options) setShuffledOptions(shuffleArray(q.options));
        setSel(null);
        setStatus('idle');
    }
  }, [idx, q]);

  if (!mod || questions.length === 0) return <div>Exam not found</div>;

  // Standard Check
  const checkAnswer = () => {
    if (!sel) return;
    const isCorrect = sel === q.correctAnswer;
    
    if (isCorrect) {
      setStatus('correct');
      setScore(s => s + 1);
      sessionCorrect.current += 1;
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#58cc02', '#89e219'] });
    } else {
      setStatus('wrong');
      sessionIncorrect.current += 1;
    }
  };

  // Connect Question Check
  const handleConnectComplete = (success: boolean) => {
    if (success) {
        setStatus('correct');
        setScore(s => s + 1);
        sessionCorrect.current += 1;
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  const nextQuestion = () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
    } else {
      setIsFinished(true);
      const percentage = score / questions.length; // Score already updated
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      
      updateStats(sessionCorrect.current, sessionIncorrect.current, timeSpent);

      if (percentage > PASS_THRESHOLD) {
        passModule(mod.id, 100);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage > 51;

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-white ring-4 ring-black/5 animate-pop">
          {passed ? (
            <>
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-14 h-14 text-yellow-500 fill-yellow-400 animate-bounce" />
              </div>
              <h1 className="text-3xl font-black text-gray-800 mb-2">Module Passed!</h1>
              <div className="text-5xl font-black text-brand mb-4">{percentage}%</div>
              <p className="text-gray-400 font-bold mb-8 uppercase tracking-wide">Mastery Unlocked</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle className="w-14 h-14 text-red-500" />
              </div>
              <h1 className="text-3xl font-black text-gray-800 mb-2">Don't give up!</h1>
              <div className="text-5xl font-black text-red-500 mb-4">{percentage}%</div>
              <p className="text-gray-400 font-bold mb-8 uppercase tracking-wide">Keep practicing</p>
            </>
          )}
          <Button onClick={() => navigate('/')} className="w-full py-4 text-lg shadow-xl" variant={passed ? 'primary' : 'outline'}>
            {passed ? 'Continue' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  // Logic for footer
  const isConnectType = q.type === 'connect';
  const showCheckButton = !isConnectType;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 max-w-2xl mx-auto w-full z-10 relative">
        <X className="text-gray-300 cursor-pointer hover:text-gray-500" onClick={() => navigate('/')} />
        <div className="flex-1">
           <div className="flex justify-between mb-1">
             <span className="text-xs font-black text-red-400 uppercase tracking-widest">Final Exam</span>
             <span className="text-xs font-bold text-gray-300">{idx + 1} / {questions.length}</span>
           </div>
           <ProgressBar current={idx} total={questions.length} />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 px-6 flex flex-col max-w-md mx-auto w-full pb-40 relative">
        <div className={`mt-4 ${status === 'wrong' ? 'animate-shake' : ''}`}>
            <QuestionRenderer 
                question={q} 
                selectedOption={sel} 
                onSelect={setSel} 
                status={status} 
                shuffledOptions={shuffledOptions}
                onConnectComplete={handleConnectComplete}
            />
        </div>
      </div>

      {/* Footer Feedback Bar */}
      <div className={`
        fixed bottom-0 left-0 w-full p-4 pb-8 border-t-2 transition-colors duration-300 animate-slide-up z-50
        ${status === 'correct' ? 'bg-brand/10 border-brand' : status === 'wrong' ? 'bg-danger/10 border-danger' : 'bg-white border-gray-200'}
      `}>
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
             <div className="flex-1">
                {status === 'correct' && <div className="text-brand-dark font-extrabold text-xl animate-pop">Correct!</div>}
                {status === 'wrong' && (
                    <div className="animate-shake">
                        <div className="text-danger-dark font-extrabold text-xl">Incorrect</div>
                        <div className="text-danger-dark text-xs font-bold">Ans: {q.correctAnswer}</div>
                    </div>
                )}
            </div>

            {status === 'correct' || status === 'wrong' ? (
                <Button onClick={nextQuestion} variant={status === 'correct' ? 'primary' : 'danger'} className="w-auto min-w-[150px] text-lg shadow-lg">
                    CONTINUE
                </Button>
            ) : (
                 showCheckButton ? (
                    <Button onClick={checkAnswer} disabled={!sel} className="w-auto min-w-[150px] text-lg shadow-lg" variant="secondary">
                        CHECK
                    </Button>
                 ) : (
                    <div className="text-gray-400 font-bold text-sm uppercase tracking-widest opacity-50 mr-4">Match all pairs</div>
                 )
            )}
        </div>
      </div>
    </div>
  );
};