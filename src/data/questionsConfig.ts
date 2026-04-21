import quizDefinition from "./quiz-definition.js";
import { Question, QuestionBlock } from "@/types/quiz";

const definition = quizDefinition as {
  questionBlocks: QuestionBlock[];
  questions: Question[];
  questionsById: Record<string, Question>;
};

export const questionBlocks = definition.questionBlocks;
export const questions = definition.questions;
export const questionsById = definition.questionsById;

export const getQuestionsByBlock = (blockId: string): Question[] =>
  questions.filter((question) => question.blockId === blockId);
