import React, { useState, useEffect } from 'react';
import { RemediationPlan, ChartData } from '../../types';
import { generateRemediation } from '../../services/geminiService';
import { MOCK_REMEDIATION } from '../../constants';
import Button from '../Button';
import Card from '../Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface RemediationProps {
  mockMode?: boolean;
}

const Remediation: React.FC<RemediationProps> = ({ mockMode }) => {
  const [plan, setPlan] = useState<RemediationPlan | null>(mockMode ? MOCK_REMEDIATION : null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated Analytics Data
  const data: ChartData[] = [
    { name: 'Variables', score: 85 },
    { name: 'Linear Eq', score: 72 },
    { name: 'Inverse Ops', score: 45 },
    { name: 'Word Problems', score: 60 },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateRemediation(['Inverse Ops', 'Word Problems'], data);
      setPlan(result);
    } catch (e) {
      alert("Failed to generate remediation plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <Card title="Class Performance by Topic" className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Brief */}
        <Card title="Teacher Weekly Brief" className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white">
          {plan ? (
            <div className="space-y-4">
              <p className="text-lg font-light leading-relaxed opacity-90">
                "{plan.teacher_weekly_brief}"
              </p>
              <div className="pt-4 border-t border-indigo-700">
                <h4 className="font-bold text-indigo-200 uppercase text-xs mb-2">Primary Weakness</h4>
                <div className="flex items-center gap-2 text-red-200">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{plan.class_diagnostics.weak_topics.join(', ')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="mb-4 text-indigo-200">Analyze class data to get insights.</p>
              <Button onClick={handleGenerate} isLoading={isLoading} className="bg-white text-indigo-900 hover:bg-gray-100">
                Analyze Performance
              </Button>
            </div>
          )}
        </Card>
      </div>

      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Micro Lessons */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="text-green-600" /> Recommended Actions
            </h3>
            {plan.remedial_micro_lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{lesson.topic}</h4>
                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{lesson.duration_minutes} min</span>
                </div>
                <p className="text-gray-600 mb-4">{lesson.objective}</p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <ul className="list-disc pl-4 space-y-1">
                    {lesson.outline.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Adjustments */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-blue-600" /> Plan Adjustments
            </h3>
            {plan.plan_adjustments.map((adj, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">For Lesson {adj.original_lesson_id}</div>
                <h4 className="font-bold text-gray-900 mb-2">{adj.recommended_change}</h4>
                <p className="text-sm text-gray-600 italic">Why? {adj.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Remediation;