import { GoogleGenAI, Schema, Type } from "@google/genai";
import { 
  AI_MODELS, 
  PROMPTS 
} from '../constants';
import { 
  CurriculumPlan, 
  LessonContent, 
  Quiz, 
  StudentEvaluation, 
  RemediationPlan 
} from '../types';

// Helper to safely get the AI client at runtime
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// --- Helper for File to Base64 ---
export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

// --- Agent: Curriculum Planner ---
export const generateCurriculum = async (
  grade: string, 
  subject: string, 
  languages: string[], 
  weeks: number, 
  syllabusText: string
): Promise<CurriculumPlan> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing. Please check your configuration.");

  console.log(`Generating curriculum for ${grade} ${subject}, ${weeks} weeks...`);

  const prompt = `
    Create a ${weeks}-week curriculum for ${grade} ${subject}.
    Target Languages: ${languages.join(', ')}.
    Syllabus Context: ${syllabusText ? syllabusText.substring(0, 5000) : "Standard curriculum"}.
    
    Return strict JSON matching the schema provided.
  `;

  // Define strict schema for the response
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      class_summary: {
        type: Type.OBJECT,
        properties: {
          grade_level: { type: Type.STRING },
          subject: { type: Type.STRING },
          target_languages: { type: Type.ARRAY, items: { type: Type.STRING } },
          overall_objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      },
      weeks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week_number: { type: Type.INTEGER },
            week_theme: { type: Type.STRING },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lesson_id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  duration_minutes: { type: Type.INTEGER },
                  objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                  difficulty_level: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                  key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                  assessment_checkpoint: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: AI_MODELS.PLANNER,
      contents: prompt,
      config: {
        systemInstruction: PROMPTS.CURRICULUM_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (!response.text) throw new Error("No response text received from AI");
    console.log("Curriculum generated successfully.");
    return JSON.parse(response.text) as CurriculumPlan;
  } catch (error) {
    console.error("Error in generateCurriculum:", error);
    throw error;
  }
};

// --- Agent: Lesson Generator ---
export const generateLesson = async (
  lessonTitle: string, 
  objectives: string[], 
  languages: string[]
): Promise<LessonContent> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    Generate lesson materials for: "${lessonTitle}".
    Objectives: ${objectives.join(', ')}.
    Languages: ${languages.join(', ')}.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      lesson_metadata: {
        type: Type.OBJECT,
        properties: {
          lesson_id: { type: Type.STRING },
          title: { type: Type.STRING },
          duration_minutes: { type: Type.INTEGER }
        }
      },
      teacher_script: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          introduction: { type: Type.STRING },
          explanation_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        }
      },
      student_handout: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING },
          key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          worked_examples: { type: Type.ARRAY, items: { type: Type.STRING } },
          practice_questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      classroom_activities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            resources_required: { type: Type.ARRAY, items: { type: Type.STRING } },
            suitable_for_low_resource: { type: Type.BOOLEAN }
          }
        }
      },
      visuals: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['diagram', 'chart', 'illustration'] },
            description: { type: Type.STRING },
            image_prompt: { type: Type.STRING },
            intended_use: { type: Type.STRING }
          }
        }
      },
      board_plan: {
        type: Type.OBJECT,
        properties: {
          sections: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: AI_MODELS.LESSON,
    contents: prompt,
    config: {
      systemInstruction: PROMPTS.LESSON_SYSTEM,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as LessonContent;
};

// --- Agent: Assessment ---
export const generateQuiz = async (
  lessonTitle: string, 
  numQuestions: number
): Promise<Quiz> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `Create a ${numQuestions}-question quiz for "${lessonTitle}". Mix MCQs and Short Answers.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      quiz_metadata: {
        type: Type.OBJECT,
        properties: {
            lesson_id: { type: Type.STRING },
            title: { type: Type.STRING },
            total_questions: { type: Type.INTEGER }
        }
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question_id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['mcq', 'short_answer', 'numeric'] },
            prompt: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct_answer: { type: Type.STRING },
            rubric: { type: Type.STRING },
            marks: { type: Type.INTEGER },
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
          }
        }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: AI_MODELS.ASSESSMENT,
    contents: prompt,
    config: {
      systemInstruction: PROMPTS.ASSESSMENT_SYSTEM,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as Quiz;
};

// --- Agent: Grader (Multimodal) ---
export const gradeStudentWork = async (
  question: string, 
  correctAnswer: string, 
  rubric: string, 
  studentInput: string,
  imageFile?: File
): Promise<StudentEvaluation> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const parts: any[] = [];
  
  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    parts.push(imagePart);
    parts.push({ text: "Analyze the handwritten answer in this image." });
  } else {
    parts.push({ text: `Student Answer: ${studentInput}` });
  }

  parts.push({ text: `Question: ${question}` });
  parts.push({ text: `Correct Answer: ${correctAnswer}` });
  parts.push({ text: `Rubric: ${rubric}` });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score_obtained: { type: Type.NUMBER },
      max_score: { type: Type.NUMBER },
      is_correct: { type: Type.BOOLEAN },
      error_category: { type: Type.STRING, enum: ['conceptual', 'calculation', 'misinterpretation', 'other'] },
      detailed_feedback: { type: Type.STRING },
      next_step_hint: { type: Type.STRING }
    }
  };

  const response = await ai.models.generateContent({
    model: AI_MODELS.GRADER,
    contents: { parts },
    config: {
      systemInstruction: PROMPTS.GRADER_SYSTEM,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as StudentEvaluation;
};

// --- Agent: Remediation ---
export const generateRemediation = async (
  weakTopics: string[], 
  scores: any[]
): Promise<RemediationPlan> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    Analyze these weak topics: ${weakTopics.join(', ')}.
    Class average scores provided.
    Suggest remedial micro-lessons and adjustments.
  `;

  // Schema for Remediation
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      class_diagnostics: {
        type: Type.OBJECT,
        properties: {
          strength_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
          weak_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
          common_misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      remedial_micro_lessons: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            duration_minutes: { type: Type.INTEGER },
            objective: { type: Type.STRING },
            outline: { type: Type.ARRAY, items: { type: Type.STRING } },
            practice_questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      plan_adjustments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original_lesson_id: { type: Type.STRING },
            recommended_change: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      },
      teacher_weekly_brief: { type: Type.STRING }
    }
  };

  const response = await ai.models.generateContent({
    model: AI_MODELS.REMEDIATION,
    contents: prompt,
    config: {
      systemInstruction: PROMPTS.REMEDIATION_SYSTEM,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as RemediationPlan;
};