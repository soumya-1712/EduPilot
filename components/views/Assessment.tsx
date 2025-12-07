import React, { useState } from 'react';
import { LessonNode, Quiz, StudentEvaluation } from '../../types';
import Button from '../Button';
import Card from '../Card';
import { generateQuiz, gradeStudentWork } from '../../services/geminiService';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { MOCK_QUIZ } from '../../constants';

interface AssessmentProps {
  lesson: LessonNode;
  onSaveResults: (results: any) => void;
  mockMode?: boolean;
}

const Assessment: React.FC<AssessmentProps> = ({ lesson, onSaveResults, mockMode }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(mockMode ? MOCK_QUIZ : null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Grading State
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [studentText, setStudentText] = useState('');
  const [evaluation, setEvaluation] = useState<StudentEvaluation | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const data = await generateQuiz(lesson.title, 5);
      setQuiz(data);
    } catch (e) {
      console.error(e);
      alert("Error generating quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGrade = async () => {
    if (!quiz || !selectedQuestionId) return;
    const q = quiz.questions.find(q => q.question_id === selectedQuestionId);
    if (!q) return;

    setIsGrading(true);
    try {
      const result = await gradeStudentWork(
        q.prompt, 
        q.correct_answer, 
        q.rubric, 
        studentText, 
        studentFile || undefined
      );
      setEvaluation(result);
    } catch (e) {
      alert("Grading failed");
    } finally {
      setIsGrading(false);
    }
  };

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Quiz for {lesson.title}</h2>
        <p className="text-gray-600 mb-8">Generate a quick check-for-understanding quiz tailored to the lesson objectives.</p>
        <Button onClick={handleGenerateQuiz} isLoading={isGenerating}>
          Generate Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Col: Quiz View */}
      <div className="space-y-6">
        <Card title={`Quiz: ${lesson.title}`}>
           <div className="space-y-6">
             {quiz.questions.map((q, idx) => (
               <div key={q.question_id} className="pb-4 border-b border-gray-100 last:border-0">
                 <div className="flex justify-between mb-2">
                   <span className="font-bold text-gray-700">Q{idx+1} ({q.marks} pts)</span>
                   <span className="text-xs uppercase font-bold text-gray-400">{q.type}</span>
                 </div>
                 <p className="text-gray-900 mb-2">{q.prompt}</p>
                 {q.options && (
                   <ul className="pl-4 space-y-1">
                     {q.options.map(opt => <li key={opt} className="list-disc text-gray-600 text-sm">{opt}</li>)}
                   </ul>
                 )}
                 <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 mt-2">
                   <strong>Answer Key:</strong> {q.correct_answer}
                 </div>
               </div>
             ))}
           </div>
        </Card>
      </div>

      {/* Right Col: Grading Tool */}
      <div className="space-y-6">
        <Card title="AI Grader & Feedback">
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1">Select Question to Grade</label>
               <select 
                 className="w-full p-2 border rounded bg-white text-gray-900"
                 value={selectedQuestionId}
                 onChange={e => { setSelectedQuestionId(e.target.value); setEvaluation(null); }}
               >
                 <option value="">-- Select Question --</option>
                 {quiz.questions.map((q, i) => <option key={q.question_id} value={q.question_id}>Q{i+1}: {q.prompt.substring(0,30)}...</option>)}
               </select>
             </div>

             <div className="border-t pt-4">
               <label className="block text-sm font-medium mb-2">Student Response Input</label>
               <div className="flex gap-2 mb-2 text-sm text-gray-600">
                 <button onClick={() => setStudentFile(null)} className={`underline ${!studentFile && 'font-bold'}`}>Text Input</button> 
                 <span>or</span>
                 <button className={`underline ${studentFile && 'font-bold'}`}>Image Upload</button>
               </div>
               
               <textarea 
                  className="w-full p-2 border rounded h-24 mb-2 bg-white text-gray-900"
                  placeholder="Type student answer here..."
                  value={studentText}
                  onChange={e => setStudentText(e.target.value)}
                  disabled={!!studentFile}
               />
               
               <div className="flex items-center gap-2">
                 <div className="relative overflow-hidden inline-block">
                    <Button variant="secondary" size="sm" type="button">
                      <Upload className="w-4 h-4" /> Upload Photo
                    </Button>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={e => e.target.files && setStudentFile(e.target.files[0])}
                    />
                 </div>
                 {studentFile && <span className="text-sm text-gray-600 truncate">{studentFile.name}</span>}
               </div>
             </div>

             <Button 
                onClick={handleGrade} 
                disabled={!selectedQuestionId || (!studentText && !studentFile)}
                isLoading={isGrading}
                className="w-full"
             >
               Evaluate Response
             </Button>
           </div>
        </Card>

        {evaluation && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 animate-fade-in">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-lg">Result</h3>
               <div className={`flex items-center gap-1 font-bold ${evaluation.is_correct ? 'text-green-600' : 'text-red-500'}`}>
                 {evaluation.is_correct ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                 {evaluation.score_obtained} / {evaluation.max_score} pts
               </div>
             </div>
             
             <div className="space-y-3">
               <div>
                 <span className="text-xs font-bold text-gray-400 uppercase">Error Category</span>
                 <p className="text-gray-800 capitalize">{evaluation.error_category.replace('_', ' ')}</p>
               </div>
               <div>
                 <span className="text-xs font-bold text-gray-400 uppercase">Feedback</span>
                 <p className="text-gray-700 bg-gray-50 p-3 rounded">{evaluation.detailed_feedback}</p>
               </div>
               <div>
                 <span className="text-xs font-bold text-gray-400 uppercase">Next Step</span>
                 <p className="text-indigo-600 font-medium">{evaluation.next_step_hint}</p>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;