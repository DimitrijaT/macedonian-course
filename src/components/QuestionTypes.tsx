import {
    Check,
    GripHorizontal,
    MessageCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { QuizQuestion } from "../types";

interface QuestionProps {
  question: QuizQuestion;
  selectedOption: string | null;
  onSelect: (opt: string) => void;
  status: "idle" | "correct" | "wrong";
  shuffledOptions: string[];
}

// --- SHARED: OPTION BUTTON ---
const OptionButton = ({
  label,
  selected,
  correct,
  wrong,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
            relative w-full p-4 rounded-2xl border-[3px] border-b-[6px] text-lg font-bold text-left transition-all duration-200 group
            ${
              selected
                ? "border-primary bg-primary/5 text-primary-dark"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:border-b-[3px] active:translate-y-[3px]"
            }
            ${
              correct
                ? "!bg-brand !border-brand-dark !text-white shadow-lg shadow-brand/20 scale-[1.02] !border-b-[6px]"
                : ""
            }
            ${
              wrong
                ? "!bg-danger !border-danger-dark !text-white shadow-lg shadow-danger/20 !border-b-[6px]"
                : ""
            }
            ${
              disabled && !selected && !correct
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
        `}
  >
    <div className="flex items-center justify-between">
      <span className="z-10">{label}</span>

      {/* Selection Indicator Dot */}
      {selected && !correct && !wrong && (
        <div className="w-3 h-3 rounded-full bg-primary shadow-sm animate-pop" />
      )}

      {/* Success Checkmark */}
      {correct && (
        <div className="bg-white/20 p-1 rounded-full animate-pop">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  </button>
);

// --- COMPONENT: CONNECT (MATCHING) ---
const ConnectQuestion = ({
  question,
  onComplete,
}: {
  question: QuizQuestion;
  onComplete: (isSuccess: boolean) => void;
}) => {
  const [leftItems, setLeftItems] = useState<{ text: string; id: number }[]>(
    []
  );
  const [rightItems, setRightItems] = useState<{ text: string; id: number }[]>(
    []
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);

  const [matchedIds, setMatchedIds] = useState<number[]>([]); // IDs of matched pairs
  const [wrongPair, setWrongPair] = useState<{
    left: number;
    right: number;
  } | null>(null);

  // Initialize
  useEffect(() => {
    if (question.pairs) {
      const labeledPairs = question.pairs.map((p, i) => ({ ...p, id: i }));
      // Independent shuffle
      setLeftItems(
        [...labeledPairs]
          .sort(() => Math.random() - 0.5)
          .map((p) => ({ text: p.left, id: p.id }))
      );
      setRightItems(
        [...labeledPairs]
          .sort(() => Math.random() - 0.5)
          .map((p) => ({ text: p.right, id: p.id }))
      );
      setMatchedIds([]);
    }
  }, [question]);

  // Selection Logic
  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      if (selectedLeft === selectedRight) {
        // Correct
        setMatchedIds((prev) => [...prev, selectedLeft]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        // Wrong
        setWrongPair({ left: selectedLeft, right: selectedRight });
        setTimeout(() => {
          setWrongPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 600);
      }
    }
  }, [selectedLeft, selectedRight]);

  // Completion
  useEffect(() => {
    if (leftItems.length > 0 && matchedIds.length === leftItems.length) {
      setTimeout(() => onComplete(true), 500);
    }
  }, [matchedIds]);

  return (
    <div className="w-full animate-slide-up">
      <div className="bg-white border-2 border-gray-100 p-4 rounded-[24px] shadow-lg mb-6 text-center relative z-10">
        <h2 className="text-lg font-black text-gray-800">
          {question.question}
        </h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Tap matching pairs
        </p>
      </div>

      <div className="flex justify-between gap-4 w-full">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft === item.id;
            const isWrong = wrongPair?.left === item.id;

            return (
              <button
                key={item.id}
                disabled={isMatched}
                onClick={() =>
                  !isMatched && !isWrong && setSelectedLeft(item.id)
                }
                className={`
                                    h-16 w-full p-2 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center text-center relative
                                    ${
                                      isMatched
                                        ? "bg-gray-100 border-gray-200 text-gray-300 shadow-none cursor-default opacity-60 scale-95"
                                        : "bg-white border-gray-200 text-gray-700 border-b-4 active:scale-95"
                                    }
                                    ${
                                      isSelected
                                        ? "!bg-brand !border-brand-dark !text-white !border-b-4 z-20 scale-105 shadow-md"
                                        : ""
                                    }
                                    ${
                                      isWrong
                                        ? "!bg-danger !border-danger-dark !text-white !border-b-4 animate-shake z-20"
                                        : ""
                                    }
                                `}
              >
                {item.text}
                {isMatched && (
                  <div className="absolute -top-2 -right-2 bg-green-100 p-1 rounded-full shadow-sm">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-3">
          {rightItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedRight === item.id;
            const isWrong = wrongPair?.right === item.id;

            return (
              <button
                key={item.id}
                disabled={isMatched}
                onClick={() =>
                  !isMatched && !isWrong && setSelectedRight(item.id)
                }
                className={`
                                    h-16 w-full p-2 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center text-center relative
                                    ${
                                      isMatched
                                        ? "bg-gray-100 border-gray-200 text-gray-300 shadow-none cursor-default opacity-60 scale-95"
                                        : "bg-white border-gray-200 text-gray-700 border-b-4 active:scale-95"
                                    }
                                    ${
                                      isSelected
                                        ? "!bg-primary !border-primary-dark !text-white !border-b-4 z-20 scale-105 shadow-md"
                                        : ""
                                    }
                                    ${
                                      isWrong
                                        ? "!bg-danger !border-danger-dark !text-white !border-b-4 animate-shake z-20"
                                        : ""
                                    }
                                `}
              >
                {item.text}
                {isMatched && (
                  <div className="absolute -top-2 -left-2 bg-green-100 p-1 rounded-full shadow-sm">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: FILL IN THE GAP ---
const FillGapQuestion: React.FC<QuestionProps> = ({
  question,
  selectedOption,
  onSelect,
  status,
  shuffledOptions,
}) => {
  const parts = question.question.split("___");
  const isFinished = status !== "idle";

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
      {/* Question Card */}
      <div className="bg-white border-2 border-gray-100 p-8 rounded-[32px] shadow-xl shadow-gray-100/50 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100" />

        <div className="text-2xl sm:text-3xl font-black text-gray-800 leading-relaxed flex flex-wrap justify-center items-center gap-2">
          <span>{parts[0]}</span>

          {/* The Gap Slot */}
          <div
            className={`
                relative min-w-[100px] h-12 px-4 rounded-xl border-b-4 flex items-center justify-center transition-all duration-300
                ${
                  selectedOption
                    ? "bg-brand text-white border-brand-dark shadow-md transform -translate-y-1"
                    : "bg-gray-100 border-gray-200 text-transparent"
                }
                ${status === "wrong" ? "!bg-danger !border-danger-dark" : ""}
            `}
          >
            <span className="font-black text-xl">{selectedOption || "?"}</span>
            {!selectedOption && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-1 bg-gray-300 rounded-full opacity-50" />
              </div>
            )}
          </div>

          <span>{parts[1]}</span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest opacity-60">
          <GripHorizontal className="w-4 h-4" /> Fill the gap
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {shuffledOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => status === "idle" && onSelect(opt)}
            disabled={isFinished}
            className={`
                p-4 rounded-2xl font-bold text-lg text-center transition-all border-[3px] border-b-[6px] active:scale-95
                ${
                  selectedOption === opt
                    ? "opacity-0 pointer-events-none scale-90"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-1"
                }
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT: TRANSLATE ---
const TranslateQuestion: React.FC<QuestionProps> = ({
  question,
  selectedOption,
  onSelect,
  status,
  shuffledOptions,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
      {/* Prompt Bubble */}
      <div className="relative mb-8 group perspective-1000">
        <div className="relative bg-white border-2 border-blue-100 p-8 rounded-[32px] shadow-xl shadow-blue-50 text-center transform transition-transform duration-500 hover:scale-[1.02]">
          <div className="absolute -top-4 -left-4 bg-blue-50 text-blue-400 p-3 rounded-2xl border-2 border-white shadow-sm rotate-[-6deg]">
            <MessageCircle className="w-6 h-6" />
          </div>

          <div className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight leading-tight">
            {question.question}
          </div>

          <div className="mt-4 text-blue-300 text-xs font-bold uppercase tracking-widest">
            Translate to English
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3">
        {shuffledOptions.map((opt) => (
          <OptionButton
            key={opt}
            label={opt}
            selected={selectedOption === opt}
            correct={status === "correct" && opt === question.correctAnswer}
            wrong={status === "wrong" && opt === selectedOption}
            disabled={status !== "idle"}
            onClick={() => onSelect(opt)}
          />
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT: MULTIPLE CHOICE ---
const MultipleChoiceQuestion: React.FC<QuestionProps> = ({
  question,
  selectedOption,
  onSelect,
  status,
  shuffledOptions,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
      {/* Question Card */}
      <div className="bg-white border-2 border-gray-100 p-6 rounded-[32px] shadow-lg mb-8 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white">
          Question
        </div>
        <h2 className="text-2xl font-black text-gray-800 text-center leading-snug mt-2">
          {question.question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3">
        {shuffledOptions.map((opt) => (
          <OptionButton
            key={opt}
            label={opt}
            selected={selectedOption === opt}
            correct={status === "correct" && opt === question.correctAnswer}
            wrong={status === "wrong" && opt === selectedOption}
            disabled={status !== "idle"}
            onClick={() => onSelect(opt)}
          />
        ))}
      </div>
    </div>
  );
};

// --- MAIN EXPORT ---
export const QuestionRenderer: React.FC<
  QuestionProps & { onConnectComplete?: (success: boolean) => void }
> = (props) => {
  switch (props.question.type) {
    case "connect":
      return (
        <ConnectQuestion
          question={props.question}
          onComplete={props.onConnectComplete!}
        />
      );
    case "fill-gap":
      return <FillGapQuestion {...props} />;
    case "translate":
      return <TranslateQuestion {...props} />;
    case "multiple-choice":
    default:
      return <MultipleChoiceQuestion {...props} />;
  }
};
