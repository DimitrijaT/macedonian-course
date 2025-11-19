
// --- HELPERS ---

import type { GrammarTable, QuizQuestion, Vocabulary } from "../types";

const cleanText = (text: string) => text.replace(/\(.*\)/, '').trim();

// --- GENERATORS ---

/**
 * Generates a 'connect' question from a lesson's vocabulary
 */
export const createConnectQuestion = (vocab: Vocabulary[], lessonId: string): QuizQuestion | null => {
  if (vocab.length < 4) return null;
  
  // Filter out duplicates if any
  const uniqueVocab = Array.from(new Map(vocab.map(v => [v.mk, v])).values());
  
  if (uniqueVocab.length < 4) return null;

  const shuffledVocab = [...uniqueVocab].sort(() => Math.random() - 0.5).slice(0, 4);
  
  return {
    id: `${lessonId}_connect_auto`,
    type: 'connect',
    question: 'Match the words',
    pairs: shuffledVocab.map(v => ({
      left: v.mk,
      right: v.en
    }))
  };
};

/**
 * Smartly generates questions from Grammar Tables
 */
export const createGrammarQuestions = (tables: GrammarTable[], lessonId: string): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];

  tables.forEach((table, tIndex) => {
    const headers = table.headers.map(h => h.toLowerCase());
    const rows = table.rows;

    rows.forEach((row, rIndex) => {
      const qId = `${lessonId}_gram_${tIndex}_${rIndex}`;

      // 1. CONJUGATION (Person + Verb/Suffix)
      // e.g. "Jas", "-m", "Gledam"
      if (headers.some(h => h.includes('person')) && 
         (headers.some(h => h.includes('verb')) || headers.some(h => h.includes('suffix')) || headers.some(h => h.includes('full verb')))) {
        
        const personIdx = headers.findIndex(h => h.includes('person'));
        // Find the column that has the FULL verb or the main verb form
        const verbIdx = headers.findIndex(h => h.includes('full verb') || (h.includes('verb') && !h.includes('suffix')));
        
        // Fallback to suffix if no full verb, but tricky to question. Prefer full verb columns.
        
        if (personIdx !== -1 && verbIdx !== -1) {
           const personText = cleanText(row[personIdx]);
           const correctVerb = cleanText(row[verbIdx]);

           // Distractors: verbs from other rows
           const distractors = rows
              .filter((_, i) => i !== rIndex)
              .map(r => cleanText(r[verbIdx]))
              .filter(v => v !== correctVerb) // Ensure uniqueness
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);

           if (distractors.length >= 1) {
               questions.push({
                 id: qId,
                 type: 'fill-gap',
                 question: `${personText} ___`,
                 options: [correctVerb, ...distractors],
                 correctAnswer: correctVerb
               });
           }
        }
      }

      // 2. COMPARISON (e.g. "Person", "Verb A", "Verb B")
      // e.g. Jas, Jadam, Mislam
      else if (headers.some(h => h.includes('person')) && headers.length > 2) {
         const personIdx = headers.findIndex(h => h.includes('person'));
         
         // Pick a random verb column (not the person column)
         const verbCols = headers.map((h, i) => i).filter(i => i !== personIdx);
         const randomVerbColIdx = verbCols[Math.floor(Math.random() * verbCols.length)];
         
         if (personIdx !== -1 && randomVerbColIdx !== undefined) {
             const personText = cleanText(row[personIdx]);
             const verbName = cleanText(table.headers[randomVerbColIdx]); // The header name e.g. "Jade" or "Misli"
             const correctForm = cleanText(row[randomVerbColIdx]);

             // Distractors from same column
             const distractors = rows
                .filter((_, i) => i !== rIndex)
                .map(r => cleanText(r[randomVerbColIdx]))
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

             questions.push({
                 id: qId,
                 type: 'fill-gap',
                 question: `${personText} ___ (${verbName})`, // e.g. "Jas ___ (Jade)"
                 options: [correctForm, ...distractors],
                 correctAnswer: correctForm
             });
         }
      }

      // 3. GENDER RULES (Gender + Example)
      else if (headers.includes('gender') && (headers.includes('example') || headers.includes('word'))) {
          const genderIdx = headers.findIndex(h => h.includes('gender'));
          const exampleIdx = headers.findIndex(h => h.includes('example') || h.includes('word'));

          if (genderIdx !== -1 && exampleIdx !== -1) {
              const gender = cleanText(row[genderIdx]);
              const example = cleanText(row[exampleIdx]).split('(')[0].trim(); // Take just the MK word

              const distractors = rows
                  .filter((_, i) => i !== rIndex)
                  .map(r => cleanText(r[genderIdx]))
                  .filter(g => g !== gender); // Filter unique wrong genders
              
              // If we don't have enough distractors (only 3 genders exist), hardcode them
              const allGenders = ['Masculine', 'Feminine', 'Neuter'];
              const finalDistractors = allGenders.filter(g => !g.toLowerCase().includes(gender.toLowerCase().substring(0, 3)));

              questions.push({
                  id: qId,
                  type: 'multiple-choice',
                  question: `What gender is "${example}"?`,
                  options: [gender, ...finalDistractors],
                  correctAnswer: gender
              });
          }
      }

      // 4. PLURALS (Singular + Plural)
      else if (headers.includes('singular') && headers.includes('plural')) {
          const singIdx = headers.indexOf('singular');
          const plurIdx = headers.indexOf('plural');

          const singular = cleanText(row[singIdx]);
          const plural = cleanText(row[plurIdx]);
          
          // Distractors: other plurals
          const distractors = rows
              .filter((_, i) => i !== rIndex)
              .map(r => cleanText(r[plurIdx]))
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);

          questions.push({
              id: qId,
              type: 'fill-gap',
              question: `Plural of "${singular}" is ___`,
              options: [plural, ...distractors],
              correctAnswer: plural
          });
      }

      // 5. TRANSLATION (Macedonian + English)
      else if ((headers.includes('macedonian') || headers.includes('question')) && headers.includes('english')) {
          const mkIdx = headers.findIndex(h => h.includes('macedonian') || h.includes('question'));
          const enIdx = headers.indexOf('english');

          const isMkToEn = Math.random() > 0.5;
          const source = cleanText(row[isMkToEn ? mkIdx : enIdx]);
          const target = cleanText(row[isMkToEn ? enIdx : mkIdx]);

          const distractors = rows
              .filter((_, i) => i !== rIndex)
              .map(r => cleanText(r[isMkToEn ? enIdx : mkIdx]))
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);

          if (distractors.length > 0) {
               questions.push({
                  id: qId,
                  type: 'translate',
                  question: source,
                  options: [target, ...distractors],
                  correctAnswer: target
               });
          }
      }

    });
  });

  // Shuffle and return max 3 to avoid overwhelming the manual quiz
  return questions.sort(() => Math.random() - 0.5).slice(0, 2);
};