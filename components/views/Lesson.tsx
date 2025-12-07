import React, { useState, useEffect } from 'react';
import { LessonNode, LessonContent } from '../../types';
import Button from '../Button';
import { Printer, Download, Users, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { generateLesson } from '../../services/geminiService';

interface LessonProps {
  lesson: LessonNode;
  languages: string[];
  mockData?: LessonContent | null; // For demo purposes
}

const Lesson: React.FC<LessonProps> = ({ lesson, languages, mockData }) => {
  const [content, setContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'handout' | 'activities'>('script');

  useEffect(() => {
    if (mockData && mockData.lesson_metadata.lesson_id === lesson.lesson_id) {
      setContent(mockData);
    } else {
      loadContent();
    }
  }, [lesson, mockData]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const data = await generateLesson(lesson.title, lesson.objectives, languages);
      setContent(data);
    } catch (e) {
      console.error(e);
      alert("Failed to generate lesson content. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Drafting lesson materials with AI...</p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{content.lesson_metadata.title}</h1>
          <p className="text-gray-600">Duration: {content.lesson_metadata.duration_minutes} mins</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 no-print">
        <button 
          onClick={() => setActiveTab('script')}
          className={`px-4 py-2 font-medium ${activeTab === 'script' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          Teacher Script
        </button>
        <button 
          onClick={() => setActiveTab('handout')}
          className={`px-4 py-2 font-medium ${activeTab === 'handout' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          Student Handout
        </button>
        <button 
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 font-medium ${activeTab === 'activities' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          Activities & Visuals
        </button>
      </div>

      <div className="print-only">
        {/* Print everything */}
        <div className="mb-8">
           <h2 className="text-xl font-bold mb-4 border-b">Teacher Script</h2>
           <ScriptView data={content.teacher_script} board={content.board_plan} />
        </div>
        <div className="page-break-before">
           <h2 className="text-xl font-bold mb-4 border-b">Student Handout</h2>
           <HandoutView data={content.student_handout} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px] no-print">
        {activeTab === 'script' && <ScriptView data={content.teacher_script} board={content.board_plan} />}
        {activeTab === 'handout' && <HandoutView data={content.student_handout} />}
        {activeTab === 'activities' && <ActivitiesView activities={content.classroom_activities} visuals={content.visuals} />}
      </div>
    </div>
  );
};

const ScriptView = ({ data, board }: { data: LessonContent['teacher_script'], board: LessonContent['board_plan'] }) => (
  <div className="space-y-6 text-gray-800">
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">Introduction</h3>
      <p>{data.introduction}</p>
    </div>
    
    <div>
      <h3 className="font-semibold text-lg mb-2">Step-by-Step Explanation</h3>
      <ul className="space-y-2 list-disc pl-5">
        {data.explanation_steps.map((step, i) => <li key={i}>{step}</li>)}
      </ul>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Blackboard Plan</h3>
        <div className="bg-gray-800 text-white p-4 rounded font-mono text-sm space-y-2 h-40 overflow-y-auto">
          {board.sections.map((s, i) => <div key={i}>• {s}</div>)}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Examples to use</h3>
        <ul className="list-disc pl-5 space-y-1">
          {data.examples.map((ex, i) => <li key={i}>{ex}</li>)}
        </ul>
      </div>
    </div>
  </div>
);

const HandoutView = ({ data }: { data: LessonContent['student_handout'] }) => (
  <div className="space-y-6">
    <div className="border-2 border-gray-800 p-6 rounded-lg bg-white">
      <h3 className="text-center font-bold text-xl uppercase tracking-wide mb-6 underline">Class Notes</h3>
      
      <div className="mb-6">
        <h4 className="font-bold mb-2">Key Concepts</h4>
        <ul className="list-disc pl-5 space-y-1">
          {data.key_points.map((pt, i) => <li key={i}>{pt}</li>)}
        </ul>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded">
        <h4 className="font-bold mb-2">Worked Examples</h4>
        <div className="space-y-2 font-mono text-sm">
          {data.worked_examples.map((ex, i) => <div key={i}>{ex}</div>)}
        </div>
      </div>

      <div>
        <h4 className="font-bold mb-2">Practice Questions</h4>
        <ol className="list-decimal pl-5 space-y-4">
          {data.practice_questions.map((q, i) => (
             <li key={i} className="pb-4 border-b border-dashed border-gray-300 last:border-0">{q}</li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

const ActivitiesView = ({ activities, visuals }: { activities: LessonContent['classroom_activities'], visuals: LessonContent['visuals'] }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-accent" /> Classroom Activities
      </h3>
      <div className="grid gap-4">
        {activities.map((act, i) => (
          <div key={i} className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
            <h4 className="font-bold text-orange-900">{act.name}</h4>
            <p className="text-sm text-gray-700 mt-1">{act.description}</p>
            <div className="mt-2 text-xs text-gray-500 font-medium">
              Requires: {act.resources_required.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-indigo-500" /> Suggested Visuals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visuals.map((vis, i) => (
          <div key={i} className="border border-gray-200 p-5 rounded-lg bg-gray-50/50">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm uppercase text-gray-500 tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> {vis.type}
              </h4>
            </div>
            
            <p className="text-base font-medium text-gray-900 mt-1 mb-3">{vis.description}</p>
            
            <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-600 font-mono break-words shadow-sm">
              <span className="select-all block"><span className="text-indigo-600 font-bold select-none">Prompt: </span>{vis.image_prompt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Lesson;