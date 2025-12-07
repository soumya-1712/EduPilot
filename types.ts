// Data Models for EduPilot

export enum ViewState {
  SETUP = 'SETUP',
  CURRICULUM = 'CURRICULUM',
  LESSON = 'LESSON',
  ASSESSMENT = 'ASSESSMENT',
  REMEDIATION = 'REMEDIATION',
}

export interface ClassConfig {
  gradeLevel: string;
  subject: string;
  topic?: string;
  targetLanguages: string[];
  termWeeks: number;
  classesPerWeek: number;
  constraints: string[];
  syllabusText: string;
}

export interface LessonNode {
  lesson_id: string;
  title: string;
  duration_minutes: number;
  objectives: string[];
  prerequisites: string[];
  difficulty_level: 'easy' | 'medium' | 'hard';
  key_points: string[];
  assessment_checkpoint: string;
}

export interface WeekPlan {
  week_number: number;
  week_theme: string;
  lessons: LessonNode[];
}

export interface CurriculumPlan {
  class_summary: {
    grade_level: string;
    subject: string;
    target_languages: string[];
    overall_objectives: string[];
    assumptions: string[];
  };
  weeks: WeekPlan[];
}

export interface ClassroomActivity {
  name: string;
  description: string;
  resources_required: string[];
  suitable_for_low_resource: boolean;
}

export interface VisualItem {
  type: 'diagram' | 'chart' | 'illustration';
  description: string;
  image_prompt: string;
  intended_use: string;
}

export interface LessonContent {
  lesson_metadata: {
    lesson_id: string;
    title: string;
    duration_minutes: number;
  };
  teacher_script: {
    language: string;
    introduction: string;
    explanation_steps: string[];
    examples: string[];
    summary: string;
  };
  student_handout: {
    language: string;
    key_points: string[];
    worked_examples: string[];
    practice_questions: string[];
  };
  classroom_activities: ClassroomActivity[];
  visuals: VisualItem[];
  board_plan: {
    sections: string[];
  };
}

export interface QuizQuestion {
  question_id: string;
  type: 'mcq' | 'short_answer' | 'numeric';
  prompt: string;
  options?: string[];
  correct_answer: string;
  rubric: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  quiz_metadata: {
    lesson_id: string;
    title: string;
    total_questions: number;
  };
  questions: QuizQuestion[];
}

export interface StudentEvaluation {
  score_obtained: number;
  max_score: number;
  is_correct: boolean;
  error_category: 'conceptual' | 'calculation' | 'misinterpretation' | 'other';
  detailed_feedback: string;
  next_step_hint: string;
}

export interface RemedialAction {
  id: string;
  topic: string;
  duration_minutes: number;
  objective: string;
  outline: string[];
  practice_questions: string[];
}

export interface RemediationPlan {
  class_diagnostics: {
    strength_topics: string[];
    weak_topics: string[];
    common_misconceptions: string[];
  };
  remedial_micro_lessons: RemedialAction[];
  plan_adjustments: {
    original_lesson_id: string;
    recommended_change: string;
    reason: string;
  }[];
  teacher_weekly_brief: string;
}

export interface ChartData {
  name: string;
  score: number;
}
