import { CurriculumPlan, LessonContent, Quiz, RemediationPlan } from './types';

export const AI_MODELS = {
  PLANNER: 'gemini-2.5-flash', // Switched to Flash for faster JSON generation
  LESSON: 'gemini-2.5-flash',
  ASSESSMENT: 'gemini-2.5-flash',
  GRADER: 'gemini-2.5-flash', // Multimodal capable
  REMEDIATION: 'gemini-3-pro-preview', // Deep reasoning for analytics
};

export const PROMPTS = {
  CURRICULUM_SYSTEM: `You are a master curriculum designer specializing in K-12 education in low-resource environments (e.g., rural schools with limited tech). Create realistic plans that assume limited printing, intermittent connectivity, and large class sizes. Use age-appropriate explanations.`,
  
  LESSON_SYSTEM: `You are an expert teacher and instructional designer for low-resource contexts. Produce content that can be delivered in a 30-60 minute session with minimal technology (blackboard, oral recitation). Adapt language to be simple and clear.`,
  
  ASSESSMENT_SYSTEM: `You are an expert educational assessment creator. Create balanced assessments that test understanding, not just rote memorization.`,
  
  GRADER_SYSTEM: `You are a patient and encouraging teacher. Evaluate student answers (text or handwritten images) strictly but fairly. Provide constructive feedback that explains *why* an answer is wrong.`,

  REMEDIATION_SYSTEM: `You are an adaptive learning specialist. Analyze class performance data to identify specific misconceptions. Suggest high-impact, low-resource remedial actions.`
};

// --- MOCK DATA FOR "QUICK DEMO" ---

export const MOCK_CURRICULUM: CurriculumPlan = {
  class_summary: {
    grade_level: "Grade 9",
    subject: "Mathematics",
    target_languages: ["English"],
    overall_objectives: ["Understand linear equations", "Graphing lines", "Solving systems"],
    assumptions: ["Basic arithmetic known", "Chalkboard available"]
  },
  weeks: [
    {
      week_number: 1,
      week_theme: "Introduction to Linear Equations",
      lessons: [
        {
          lesson_id: "L1.1",
          title: "Variables and Constants",
          duration_minutes: 40,
          objectives: ["Define variable", "Identify terms"],
          prerequisites: ["Arithmetic"],
          difficulty_level: "easy",
          key_points: ["x represents unknown", "constant is fixed"],
          assessment_checkpoint: "Oral quiz"
        },
        {
          lesson_id: "L1.2",
          title: "The Standard Form ax + b = 0",
          duration_minutes: 40,
          objectives: ["Recognize linear form"],
          prerequisites: ["L1.1"],
          difficulty_level: "medium",
          key_points: ["Linear means power 1", "Equality sign"],
          assessment_checkpoint: "Worksheet Q1-5"
        }
      ]
    },
    {
      week_number: 2,
      week_theme: "Solving Basic Equations",
      lessons: [
        {
          lesson_id: "L2.1",
          title: "Balancing the Equation",
          duration_minutes: 40,
          objectives: ["Operation inversion"],
          prerequisites: ["L1.2"],
          difficulty_level: "medium",
          key_points: ["What you do to one side, do to other"],
          assessment_checkpoint: "Board work"
        }
      ]
    }
  ]
};

export const MOCK_LESSON: LessonContent = {
  lesson_metadata: {
    lesson_id: "L1.1",
    title: "Variables and Constants",
    duration_minutes: 40
  },
  teacher_script: {
    language: "English",
    introduction: "Good morning class. Imagine I have a bag of marbles, but I won't tell you how many are inside. We call this unknown number 'x'.",
    explanation_steps: [
      "Step 1: Write 'x + 5 = 10' on the board.",
      "Step 2: Ask students what 'x' must be.",
      "Step 3: Define 'Variable' as a placeholder for a number."
    ],
    examples: ["x + 2 = 5", "3y = 12"],
    summary: "Today we learned that letters can represent numbers in math."
  },
  student_handout: {
    language: "English",
    key_points: ["Variable: A letter for an unknown number.", "Constant: A fixed number."],
    worked_examples: ["If x + 2 = 5, then x = 3."],
    practice_questions: ["What is x if x - 1 = 9?", "Identify the variable in 4z + 2"]
  },
  classroom_activities: [
    {
      name: "Mystery Bag",
      description: "Put stones in a bag. Have students guess the count. Write equation on board.",
      resources_required: ["Bag", "Stones/pebbles"],
      suitable_for_low_resource: true
    }
  ],
  visuals: [
    {
      type: "illustration",
      description: "Balance Scale",
      image_prompt: "Simple line drawing of a balance scale with a box labeled x on one side and weights on the other",
      intended_use: "Draw on blackboard to show equality"
    }
  ],
  board_plan: {
    sections: ["Definition of Variable", "Example 1", "Practice Problems"]
  }
};

export const MOCK_QUIZ: Quiz = {
  quiz_metadata: {
    lesson_id: "L1.1",
    title: "Variables Quiz",
    total_questions: 3
  },
  questions: [
    {
      question_id: "q1",
      type: "mcq",
      prompt: "In the equation 2x + 5 = 15, what is the variable?",
      options: ["2", "x", "5", "15"],
      correct_answer: "x",
      rubric: "Variable is the letter.",
      marks: 1,
      difficulty: "easy"
    },
    {
      question_id: "q2",
      type: "short_answer",
      prompt: "Solve for y: y - 4 = 10",
      correct_answer: "14",
      rubric: "Add 4 to both sides.",
      marks: 2,
      difficulty: "medium"
    }
  ]
};

export const MOCK_REMEDIATION: RemediationPlan = {
  class_diagnostics: {
    strength_topics: ["Identification of variables"],
    weak_topics: ["Inverse operations (subtraction vs addition)"],
    common_misconceptions: ["Students often subtract when they should add to isolate variable."]
  },
  remedial_micro_lessons: [
    {
      id: "R1",
      topic: "Inverse Operations Drill",
      duration_minutes: 15,
      objective: "Master addition/subtraction inversion",
      outline: ["Use physical objects (stones) to show adding/removing", "Rapid fire board quiz"],
      practice_questions: ["x - 5 = 10", "x + 3 = 7"]
    }
  ],
  plan_adjustments: [
    {
      original_lesson_id: "L2.1",
      recommended_change: "Add 10 mins review of inverse ops",
      reason: "High error rate in homework"
    }
  ],
  teacher_weekly_brief: "Class is grasping the concept of variables well, but struggles with the mechanics of moving numbers across the equals sign. Focus on 'balancing' visuals next week."
};