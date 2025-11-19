import { HashRouter, Routes, Route } from 'react-router-dom';
import { CourseProvider } from './context/CourseContext';
import { Dashboard } from './pages/Dashboard';
import { LessonView } from './pages/LessonView';
import { QuizView } from './pages/QuizView';
import { ExamView } from './pages/ExamView';

export default function App() {
  return (
    <CourseProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lesson/:mid/:lid" element={<LessonView />} />
          <Route path="/quiz/:mid/:lid" element={<QuizView />} />
          <Route path="/exam/:mid" element={<ExamView />} />
        </Routes>
      </HashRouter>
    </CourseProvider>
  );
}