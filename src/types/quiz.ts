export type RiskLevel = 'low' | 'medium' | 'high';

export interface QuestionOption {
  id: string;
  label: string;
  riskLevel: RiskLevel;
  riskWeight: number;
}

export interface Question {
  id: string;
  blockId: string;
  text: string;
  type: 'single' | 'multiple';
  options: QuestionOption[];
}

export interface QuestionBlock {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface UserInfo {
  childName: string;
  childAge: string;
  parentName: string;
  phone: string;
  consentGiven: boolean;
}

export interface QuizAnswers {
  [questionId: string]: string[];
}

export interface SubmissionInput {
  userInfo: UserInfo;
  answers: QuizAnswers;
}

export type RecommendationLevel = 
  | 'no_risk'
  | 'attention'
  | 'consultation'
  | 'diagnosis';

export interface QuizResult {
  level: RecommendationLevel;
  title: string;
  description: string;
  factors: string[];
  totalScore: number;
  maxScore: number;
  detailedExplanation: string;
  adminNote: string;
}

export interface Submission {
  id: string;
  date: string;
  userInfo: UserInfo;
  answers: QuizAnswers;
  result: QuizResult;
}
