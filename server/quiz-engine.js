import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionsDataPath = path.resolve(__dirname, "..", "src", "data", "questionsData.json");

const { questions } = JSON.parse(readFileSync(questionsDataPath, "utf8"));
const questionsById = new Map(questions.map((question) => [question.id, question]));

const userInfoSchema = z.object({
  childName: z.string().trim().min(1).max(120),
  childAge: z.string().trim().min(1).max(120),
  parentName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  consentGiven: z.boolean().refine((value) => value === true, {
    message: "Необходимо согласие на обработку данных.",
  }),
});

const submissionInputSchema = z.object({
  userInfo: userInfoSchema,
  answers: z.record(z.array(z.string().trim().min(1)).min(1)),
});

export class SubmissionValidationError extends Error {
  constructor(issues) {
    super("Некорректные данные анкеты.");
    this.name = "SubmissionValidationError";
    this.issues = issues;
  }
}

export function parseSubmissionInput(payload) {
  const parsed = submissionInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new SubmissionValidationError(parsed.error.issues.map((issue) => issue.message));
  }

  const { userInfo, answers } = parsed.data;
  const issues = [];
  const normalizedAnswers = {};

  for (const questionId of Object.keys(answers)) {
    if (!questionsById.has(questionId)) {
      issues.push(`Неизвестный вопрос: ${questionId}`);
    }
  }

  for (const question of questions) {
    const submittedAnswerIds = [...new Set(answers[question.id] ?? [])];

    if (submittedAnswerIds.length === 0) {
      issues.push(`Нет ответа на вопрос: ${question.text}`);
      continue;
    }

    if (question.type === "single" && submittedAnswerIds.length !== 1) {
      issues.push(`Для вопроса "${question.text}" нужен ровно один ответ.`);
      continue;
    }

    const allowedOptionIds = new Set(question.options.map((option) => option.id));
    const invalidOptionIds = submittedAnswerIds.filter((optionId) => !allowedOptionIds.has(optionId));

    if (invalidOptionIds.length > 0) {
      issues.push(
        `В вопросе "${question.text}" переданы неизвестные варианты: ${invalidOptionIds.join(", ")}.`
      );
      continue;
    }

    normalizedAnswers[question.id] = submittedAnswerIds;
  }

  if (issues.length > 0) {
    throw new SubmissionValidationError(issues);
  }

  return {
    userInfo,
    answers: normalizedAnswers,
  };
}

export function calculateResult(answers) {
  let totalScore = 0;
  let maxScore = 0;
  const factors = [];

  for (const question of questions) {
    const selectedIds = answers[question.id] || [];
    const maxOptionWeight = Math.max(...question.options.map((option) => option.riskWeight));
    maxScore +=
      question.type === "multiple"
        ? question.options.reduce((sum, option) => sum + option.riskWeight, 0)
        : maxOptionWeight;

    for (const optionId of selectedIds) {
      const option = question.options.find((item) => item.id === optionId);
      if (!option) {
        continue;
      }

      totalScore += option.riskWeight;
      if (option.riskLevel !== "low" && option.riskWeight > 0) {
        const existingFactor = factors.find((factor) => factor.questionText === question.text);
        if (existingFactor) {
          existingFactor.selectedLabels.push(option.label);
          existingFactor.weight += option.riskWeight;
          if (option.riskLevel === "high") {
            existingFactor.level = "high";
          }
        } else {
          factors.push({
            questionText: question.text,
            selectedLabels: [option.label],
            weight: option.riskWeight,
            level: option.riskLevel,
          });
        }
      }
    }
  }

  const highFactors = factors.filter((factor) => factor.level === "high");
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  let level;
  let title;
  let description;
  let adminNote;

  if (percentage >= 45 || highFactors.length >= 3) {
    level = "diagnosis";
    title = "Рекомендуем пройти диагностику";
    description =
      "По результатам теста выявлены несколько факторов, которые могут указывать на необходимость профессиональной оценки развития вашего ребёнка. Это не диагноз — это возможность вовремя получить помощь специалистов и дать ребёнку лучший старт.";
    adminNote = "Рекомендована комплексная диагностика. Множественные факторы риска.";
  } else if (percentage >= 30 || highFactors.length >= 2) {
    level = "consultation";
    title = "Рекомендуем консультацию специалиста";
    description =
      "Мы заметили некоторые особенности, на которые стоит обратить внимание. Консультация специалиста поможет разобраться и определить, нужна ли дополнительная поддержка. Раннее обращение — это всегда плюс.";
    adminNote = "Рекомендована консультация. Есть факторы среднего и высокого риска.";
  } else if (percentage >= 15 || factors.length >= 2) {
    level = "attention";
    title = "Есть признаки, на которые стоит обратить внимание";
    description =
      "В целом развитие вашего ребёнка идёт хорошо, но есть несколько моментов, за которыми стоит понаблюдать. Если что-то вас беспокоит, вы всегда можете обратиться к нам за консультацией.";
    adminNote = "Незначительные факторы. Рекомендовано наблюдение.";
  } else {
    level = "no_risk";
    title = "На данный момент выраженных факторов риска не выявлено";
    description =
      "По результатам теста развитие вашего ребёнка соответствует возрастным нормам. Продолжайте наблюдать за малышом, и если появятся вопросы — мы всегда рады помочь!";
    adminNote = "Факторов риска не выявлено. Наблюдение не требуется.";
  }

  const factorStrings = factors
    .sort((left, right) => right.weight - left.weight)
    .map((factor) => `${factor.questionText}: ${factor.selectedLabels.join(", ")}`);

  const detailedExplanation =
    factors.length > 0
      ? `Основные факторы, повлиявшие на результат:\n${factors
          .sort((left, right) => right.weight - left.weight)
          .map(
            (factor) =>
              `• ${factor.questionText} — ${factor.selectedLabels.join(", ")} (уровень: ${
                factor.level === "high" ? "высокий" : "средний"
              })`
          )
          .join("\n")}\n\nОбщий балл: ${totalScore} из ${maxScore} (${Math.round(percentage)}%)`
      : "Факторов риска не обнаружено. Все ответы указывают на нормативное развитие.";

  return {
    level,
    title,
    description,
    factors: factorStrings,
    totalScore,
    maxScore,
    detailedExplanation,
    adminNote,
  };
}
