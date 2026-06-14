
export interface Option {
  id: string;
  text: string;
  points: Record<string, number>; // Maps archetype ID to points
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface FullReport {
  challenges: string;
  growthPath: string;
  strategy: string;
}

export interface Archetype {
  id: string;
  name: string;
  title: string;
  description: string;
  characteristics: string[];
  advice: string;
  ctaLink: string;
  image: string; // Path to the archetype icon/image
  videoUrl: string; // Path to the archetype video
  fullReport: FullReport; // New detailed report content
}

export interface QuizState {
  currentStep: 'intro' | 'quiz' | 'email' | 'analyzing' | 'result';
  currentQuestionIndex: number;
  answers: Record<number, string>; // questionId -> optionId
  scores: Record<string, number>;
  userEmail: string;
  userName: string;
}
