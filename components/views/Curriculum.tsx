import React, { useState } from 'react';
import { CurriculumPlan, WeekPlan, LessonNode } from '../../types';
import Card from '../Card';
import Button from '../Button';
import { ChevronDown, ChevronRight, Book, Clock, AlertTriangle } from 'lucide-react';

interface CurriculumProps {
  plan: CurriculumPlan;
  onSelectLesson: (lesson: LessonNode) => void;
}

const Curriculum: React.FC<CurriculumProps> = ({ plan, onSelectLesson }) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const toggleWeek = (weekNum: number) => {
    setExpandedWeek(expandedWeek === weekNum ? null : weekNum);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Curriculum Plan: {plan.class_summary.subject}</h2>
        <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{plan.class_summary.grade_level}</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            {plan.class_summary.target_languages.join(', ')}
          </span>
        </div>
        <p className="mt-4 text-gray-700">
          <strong>Objectives:</strong> {plan.class_summary.overall_objectives.join(', ')}
        </p>
      </div>

      <div className="space-y-4">
        {plan.weeks.map((week) => (
          <div key={week.week_number} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button 
              onClick={() => toggleWeek(week.week_number)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {week.week_number}
                </span>
                <span className="font-semibold text-lg text-gray-800">{week.week_theme}</span>
              </div>
              {expandedWeek === week.week_number ? <ChevronDown /> : <ChevronRight />}
            </button>

            {expandedWeek === week.week_number && (
              <div className="p-4 bg-white space-y-3">
                {week.lessons.map((lesson) => (
                  <div 
                    key={lesson.lesson_id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{lesson.lesson_id}: {lesson.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                          lesson.difficulty_level === 'easy' ? 'bg-green-50 border-green-200 text-green-700' :
                          lesson.difficulty_level === 'hard' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-yellow-50 border-yellow-200 text-yellow-700'
                        }`}>
                          {lesson.difficulty_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration_minutes} min</span>
                        <span className="flex items-center gap-1"><Book className="w-3 h-3" /> {lesson.objectives.length} objectives</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => onSelectLesson(lesson)}
                      className="mt-3 md:mt-0 whitespace-nowrap"
                    >
                      Prepare Materials
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Curriculum;