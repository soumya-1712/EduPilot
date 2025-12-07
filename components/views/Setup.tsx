import React, { useState } from 'react';
import { ClassConfig } from '../../types';
import Button from '../Button';
import Card from '../Card';
import { Upload, BookOpen, AlertCircle } from 'lucide-react';
import { fileToGenerativePart } from '../../services/geminiService';

interface SetupProps {
  onComplete: (config: ClassConfig) => void;
  onQuickDemo: () => void;
  isLoading: boolean;
}

const Setup: React.FC<SetupProps> = ({ onComplete, onQuickDemo, isLoading }) => {
  const [formData, setFormData] = useState<ClassConfig>({
    gradeLevel: 'Grade 6',
    subject: '',
    targetLanguages: ['English'],
    termWeeks: 12,
    classesPerWeek: 5,
    constraints: [],
    syllabusText: ''
  });

  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSyllabusFile(e.target.files[0]);
      // In a real app with OCR, we'd process this. 
      // For now, we simulate text extraction by adding a placeholder if text is empty
      if (!formData.syllabusText) {
        setFormData(prev => ({ ...prev, syllabusText: `[File Uploaded: ${e.target.files![0].name}] - Syllabus covers standard curriculum for this grade.` }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to EduPilot</h1>
        <p className="text-xl text-gray-600">Your AI Copilot for Class Planning & Teaching</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-blue-900">New to EduPilot?</h3>
          <p className="text-blue-700 text-sm">Try our demo mode to see generated lesson plans instantly.</p>
        </div>
        <Button onClick={onQuickDemo} variant="secondary">
          🚀 Launch Quick Demo
        </Button>
      </div>

      <Card title="Create New Class Context">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select 
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                value={formData.gradeLevel}
                onChange={e => setFormData({...formData, gradeLevel: e.target.value})}
              >
                {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Mathematics, Science"
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term Length (Weeks)</label>
              <input 
                type="number" 
                min="1" max="52"
                className="w-full rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                value={formData.termWeeks}
                onChange={e => setFormData({...formData, termWeeks: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classes per Week</label>
              <input 
                type="number" 
                min="1" max="10"
                className="w-full rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                value={formData.classesPerWeek}
                onChange={e => setFormData({...formData, classesPerWeek: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Language(s)</label>
            <input 
              type="text" 
              placeholder="e.g. English, Hindi (comma separated)"
              className="w-full rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
              onChange={e => setFormData({...formData, targetLanguages: e.target.value.split(',').map(s => s.trim())})}
              defaultValue={formData.targetLanguages.join(', ')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Syllabus Input</label>
            <div className="flex flex-col gap-4">
              <textarea 
                className="w-full rounded-lg border-gray-300 border p-3 h-32 bg-white text-gray-900"
                placeholder="Paste syllabus topics or learning objectives here..."
                value={formData.syllabusText}
                onChange={e => setFormData({...formData, syllabusText: e.target.value})}
              />
              
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors bg-white">
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <Upload className="text-gray-400 w-8 h-8" />
                  <span className="text-sm text-gray-500">
                    {syllabusFile ? `Selected: ${syllabusFile.name}` : "Or upload syllabus image/PDF"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
             <Button type="submit" isLoading={isLoading}>
               Generate Curriculum Plan <BookOpen className="w-4 h-4" />
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Setup;