import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Hash,
  Layers,
  RotateCw,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RichText } from "../components/RichText";
import { Button, Card, TableDisplay } from "../components/UI";
import { COURSE_DATA } from "../data/course";

import { useCourse } from "../context/CourseContext";
import type { Vocabulary } from "../types";

// --- COMPONENT: FLASHCARD ---
const Flashcard = ({ word }: { word: Vocabulary }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="h-48 w-full perspective-1000 cursor-pointer group select-none"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-[24px] border-2 border-gray-100 border-b-[6px] p-4 flex flex-col items-center justify-center backface-hidden shadow-sm group-hover:border-brand/30 group-active:scale-[0.98] transition-all z-20">
          <div className="absolute top-3 right-3 text-gray-200 group-hover:text-brand/50 transition-colors">
            <RotateCw className="w-5 h-5" />
          </div>
          <div className="font-black text-gray-800 text-3xl text-center mb-2 tracking-tight">
            {word.mk}
          </div>
          <div className="text-xs text-gray-400 font-extrabold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
            {word.tr}
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 w-full h-full bg-brand-light/10 rounded-[24px] border-2 border-brand/20 border-b-[6px] p-4 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-inner z-10">
          <div className="font-black text-brand-dark text-2xl text-center mb-3">
            {word.en}
          </div>
          {word.gender && (
            <span
              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-sm
                ${
                  word.gender === "m"
                    ? "bg-blue-100 text-blue-600"
                    : word.gender === "f"
                    ? "bg-pink-100 text-pink-600"
                    : "bg-green-100 text-green-600"
                }
            `}
            >
              {word.gender === "m"
                ? "Masculine"
                : word.gender === "f"
                ? "Feminine"
                : "Neuter"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: LIST ITEM ---
const WordListItem = ({ word }: { word: Vocabulary }) => (
  <div className="flex items-center justify-between bg-white p-5 rounded-[20px] border-2 border-gray-100 border-b-[4px] shadow-sm hover:border-brand/30 hover:shadow-md transition-all group">
    <div className="flex flex-col">
      <span className="font-black text-gray-800 text-2xl mb-1 group-hover:text-brand transition-colors">
        {word.mk}
      </span>
      <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">
        {word.tr}
      </span>
    </div>
    <div className="text-right">
      <div className="font-bold text-brand-dark text-lg">{word.en}</div>
      {word.gender && (
        <span
          className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ml-auto inline-block mt-2
                ${
                  word.gender === "m"
                    ? "bg-blue-50 text-blue-600"
                    : word.gender === "f"
                    ? "bg-pink-50 text-pink-600"
                    : "bg-green-50 text-green-600"
                }
            `}
        >
          {word.gender === "m" ? "Masc" : word.gender === "f" ? "Fem" : "Neut"}
        </span>
      )}
    </div>
  </div>
);

export const LessonView = () => {
  const { mid, lid } = useParams();
  const navigate = useNavigate();
  const { setLastViewedLesson } = useCourse(); // Hook

  const mod = COURSE_DATA.find((m) => m.id === mid);
  const lesson = mod?.lessons.find((l) => l.id === lid);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "flashcards">("list");

  // Handle Scroll Effects
  useEffect(() => {
    if (lesson) {
      setLastViewedLesson(lesson.id); // Set state on mount
    }
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = Number(totalScroll / windowHeight);

      setScrollProgress(scroll);
      setShowTopBtn(totalScroll > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!lesson)
    return (
      <div className="flex items-center justify-center h-screen font-bold text-gray-400">
        Lesson Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative selection:bg-brand/20">
      {/* Dynamic Sticky Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrollProgress > 0.05
            ? "bg-white/90 backdrop-blur-xl shadow-sm py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => {
              // Navigate back. The Dashboard will auto-scroll to active.
              // If we want to force scroll to THIS specific lesson (even if done), we'd need complex context state.
              // For now, standard navigate works with the Dashboard's auto-scroll to 'next' lesson.
              navigate("/");
            }}
            className="..."
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>

          <div
            className={`flex-1 transition-opacity duration-300 ${
              scrollProgress > 0.1 ? "opacity-100" : "opacity-0"
            }`}
          >
            <h2 className="font-black text-gray-800 truncate text-sm uppercase tracking-wide">
              {lesson.title}
            </h2>
            <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-brand pb-24 pt-32 px-6 relative overflow-hidden rounded-b-[40px] shadow-xl shadow-brand/20 z-0">
        {/* Background Decor */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-brand-dark/20 rounded-full blur-2xl" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-black/10 text-white/90 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-sm border border-white/10">
            <Hash className="w-3 h-3" /> Lesson Concept
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight drop-shadow-sm">
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 px-4 -mt-14 pb-44 max-w-2xl mx-auto w-full space-y-12 z-10 relative">
        {/* SECTION: THEORY */}
        <section className="space-y-6">
          {lesson.theory.map((t, i) => {
            // Separator Logic
            if (t === "---") {
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 py-4 opacity-40 select-none"
                >
                  <div className="h-0.5 flex-1 bg-gray-300 rounded-full"></div>
                  <Sparkles className="w-5 h-5 text-gray-400 fill-gray-200" />
                  <div className="h-0.5 flex-1 bg-gray-300 rounded-full"></div>
                </div>
              );
            }
            // Theory Card
            return (
              <Card
                key={i}
                className="bg-white border-0 shadow-xl shadow-gray-200/50 rounded-[32px] p-6 sm:p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-brand group-hover:w-3 transition-all" />
                <div className="flex gap-5">
                  <div className="hidden sm:flex mt-1 bg-brand/10 w-12 h-12 rounded-2xl items-center justify-center shrink-0 text-brand">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <RichText
                    text={t}
                    className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium"
                  />
                </div>
              </Card>
            );
          })}
        </section>

        {/* SECTION: GRAMMAR */}
        {lesson.grammarTables.length > 0 && (
          <section className="animate-slide-up">
            <div className="flex items-center gap-4 mb-6 px-2 opacity-80">
              <div className="h-0.5 flex-1 bg-gray-200 rounded-full" />
              <span className="text-gray-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Grammar Rules
              </span>
              <div className="h-0.5 flex-1 bg-gray-200 rounded-full" />
            </div>
            {lesson.grammarTables.map((t, i) => (
              <TableDisplay key={i} data={t} />
            ))}
          </section>
        )}

        {/* SECTION: VOCABULARY */}
        {lesson.vocabulary.length > 0 && (
          <section
            className="animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="text-gray-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Vocabulary
              </span>

              {/* View Toggle */}
              <div className="flex bg-gray-200 p-1 rounded-xl border border-gray-300/50 shadow-inner">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-brand shadow-sm scale-100"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 scale-90"
                  }`}
                  title="List View"
                >
                  <Layers className="w-4 h-4 stroke-[3]" />
                </button>
                <button
                  onClick={() => setViewMode("flashcards")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "flashcards"
                      ? "bg-white text-brand shadow-sm scale-100"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 scale-90"
                  }`}
                  title="Flashcards View"
                >
                  <Smartphone className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Content Grid */}
            {viewMode === "list" ? (
              <div className="grid grid-cols-1 gap-3">
                {lesson.vocabulary.map((v, i) => (
                  <WordListItem key={i} word={v} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {lesson.vocabulary.map((v, i) => (
                  <Flashcard key={i} word={v} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Floating Jump-to-Top Button */}
      <button
        onClick={scrollToTop}
        className={`
            fixed bottom-32 right-6 z-30 bg-white text-gray-400 p-3 rounded-full shadow-xl shadow-brand/10 border-2 border-gray-100 transition-all duration-500
            ${
              showTopBtn
                ? "translate-y-0 opacity-100 rotate-0"
                : "translate-y-10 opacity-0 rotate-180 pointer-events-none"
            }
            hover:text-brand hover:border-brand hover:scale-110 active:scale-90
        `}
      >
        <ArrowUp className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 p-4 pb-8 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(`/quiz/${mid}/${lid}`)}
            className="text-lg py-4 shadow-xl shadow-brand/20"
          >
            Start Practice Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
