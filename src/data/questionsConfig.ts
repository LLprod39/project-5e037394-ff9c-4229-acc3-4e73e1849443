import questionsData from "./questionsData.json";
import { Question, QuestionBlock } from "@/types/quiz";

const typedQuestionsData = questionsData as {
  questionBlocks: QuestionBlock[];
  questions: Question[];
};

export const questionBlocks = typedQuestionsData.questionBlocks;
export const questions = typedQuestionsData.questions;

export const getQuestionsByBlock = (blockId: string): Question[] =>
  questions.filter((question) => question.blockId === blockId);
