import React, { useState } from 'react';
import { 
  ViewState, 
  ClassConfig, 
  CurriculumPlan, 
  LessonNode 
} from './types';
import { 
  MOCK_CURRICULUM, 
  MOCK_LESSON 
} from './constants';
import { generateCurriculum } from './services/geminiService';

// Layout
import { LayoutDashboard, BookOpen, GraduationCap, LineChart, Settings, AlertCircle } from 'lucide-react';

// Views
import Setup from './components/views/Setup';
import Curriculum from './components/views/Curriculum';
import Lesson from './components/views/Lesson';
import Assessment from './components/views/Assessment';
import Remediation from './components/views/Remediation';

const App: React.FC = () => {
  // Global App State
  const [view, setView] = useState<ViewState>(ViewState.SETUP);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Domain State
  const [classConfig, setClassConfig] = useState<ClassConfig | null>(null);
  const [plan, setPlan] = useState<CurriculumPlan | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonNode | null>(null);

  // Handlers
  const handleSetupComplete = async (config: ClassConfig) => {
    setClassConfig(config);
    setIsLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateCurriculum(
        config.gradeLevel,
        config.subject,
        config.targetLanguages,
        config.termWeeks,
        config.syllabusText
      );
      setPlan(generatedPlan);
      setView(ViewState.CURRICULUM);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setIsDemo(true);
    setError(null);
    setClassConfig({
      gradeLevel: MOCK_CURRICULUM.class_summary.grade_level,
      subject: MOCK_CURRICULUM.class_summary.subject,
      targetLanguages: MOCK_CURRICULUM.class_summary.target_languages,
      termWeeks: 4,
      classesPerWeek: 5,
      constraints: ['No Internet', 'Blackboard Only'],
      syllabusText: 'Linear Equations'
    });
    setPlan(MOCK_CURRICULUM);
    setView(ViewState.CURRICULUM);
  };

  const handleLessonSelect = (lesson: LessonNode) => {
    setSelectedLesson(lesson);
    setView(ViewState.LESSON);
  };

  // Sidebar Navigation Component
  const NavItem = ({ icon: Icon, label, target, active }: any) => (
    <button
      onClick={() => setView(target)}
      disabled={!plan && target !== ViewState.SETUP}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-blue-100 hover:bg-blue-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* Sidebar */}
      <aside className="bg-blue-900 text-white w-full md:w-64 flex-shrink-0 p-6 flex flex-col no-print">
        <div className="mb-8 flex items-center gap-2">
           <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
             <BookOpen className="text-white w-5 h-5" />
           </div>
           <h1 className="text-xl font-bold tracking-tight">EduPilot</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={Settings} label="Class Setup" target={ViewState.SETUP} active={view === ViewState.SETUP} />
          <NavItem icon={LayoutDashboard} label="Curriculum" target={ViewState.CURRICULUM} active={view === ViewState.CURRICULUM} />
          <NavItem icon={BookOpen} label="Lesson" target={ViewState.LESSON} active={view === ViewState.LESSON} />
          <NavItem icon={GraduationCap} label="Assessments" target={ViewState.ASSESSMENT} active={view === ViewState.ASSESSMENT} />
          <NavItem icon={LineChart} label="Remediation" target={ViewState.REMEDIATION} active={view === ViewState.REMEDIATION} />
        </nav>

        {classConfig && (
          <div className="mt-8 p-4 bg-blue-800 rounded-lg text-sm text-blue-200">
            <p className="font-semibold text-white">{classConfig.gradeLevel}</p>
            <p>{classConfig.subject}</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {view === ViewState.SETUP && (
            <Setup 
              onComplete={handleSetupComplete} 
              onQuickDemo={handleQuickDemo} 
              isLoading={isLoading} 
            />
          )}

          {view === ViewState.CURRICULUM && plan && (
            <Curriculum plan={plan} onSelectLesson={handleLessonSelect} />
          )}

          {view === ViewState.LESSON && (
            selectedLesson ? (
              <Lesson 
                lesson={selectedLesson} 
                languages={classConfig?.targetLanguages || ['English']}
                mockData={isDemo && selectedLesson.lesson_id === 'L1.1' ? MOCK_LESSON : null}
              />
            ) : (
              <EmptyState message="Please select a lesson from the Curriculum tab first." />
            )
          )}

          {view === ViewState.ASSESSMENT && (
             selectedLesson ? (
               <Assessment 
                 lesson={selectedLesson} 
                 onSaveResults={() => {}} 
                 mockMode={isDemo}
               />
             ) : (
               <EmptyState message="Please select a lesson to create an assessment for." />
             )
          )}

          {view === ViewState.REMEDIATION && (
            <Remediation mockMode={isDemo} />
          )}
        </div>
      </main>

    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-500">
    <div className="bg-gray-200 p-6 rounded-full mb-4">
      <LayoutDashboard className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-medium text-gray-700">Ready to Start</h3>
    <p className="mt-2">{message}</p>
  </div>
);

export default App;