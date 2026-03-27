import { QuizAnswers, QuizResult, RecommendationLevel } from '@/types/quiz';
import { questions } from '@/data/questionsConfig';

interface RiskFactor {
  questionText: string;
  selectedLabels: string[];
  weight: number;
  level: 'medium' | 'high';
}

export function calculateResult(answers: QuizAnswers): QuizResult {
  let totalScore = 0;
  let maxScore = 0;
  const factors: RiskFactor[] = [];

  for (const question of questions) {
    const selectedIds = answers[question.id] || [];
    const maxOptionWeight = Math.max(...question.options.map(o => o.riskWeight));
    maxScore += question.type === 'multiple'
      ? question.options.reduce((sum, o) => sum + o.riskWeight, 0)
      : maxOptionWeight;

    for (const optionId of selectedIds) {
      const option = question.options.find(o => o.id === optionId);
      if (option) {
        totalScore += option.riskWeight;
        if (option.riskLevel !== 'low' && option.riskWeight > 0) {
          const existing = factors.find(f => f.questionText === question.text);
          if (existing) {
            existing.selectedLabels.push(option.label);
            existing.weight += option.riskWeight;
            if (option.riskLevel === 'high') existing.level = 'high';
          } else {
            factors.push({
              questionText: question.text,
              selectedLabels: [option.label],
              weight: option.riskWeight,
              level: option.riskLevel as 'medium' | 'high',
            });
          }
        }
      }
    }
  }

  const highFactors = factors.filter(f => f.level === 'high');
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  let level: RecommendationLevel;
  let title: string;
  let description: string;
  let adminNote: string;

  if (percentage >= 45 || highFactors.length >= 3) {
    level = 'diagnosis';
    title = 'Рекомендуем пройти диагностику';
    description = 'По результатам теста выявлены несколько факторов, которые могут указывать на необходимость профессиональной оценки развития вашего ребёнка. Это не диагноз — это возможность вовремя получить помощь специалистов и дать ребёнку лучший старт.';
    adminNote = 'Рекомендована комплексная диагностика. Множественные факторы риска.';
  } else if (percentage >= 30 || highFactors.length >= 2) {
    level = 'consultation';
    title = 'Рекомендуем консультацию специалиста';
    description = 'Мы заметили некоторые особенности, на которые стоит обратить внимание. Консультация специалиста поможет разобраться и определить, нужна ли дополнительная поддержка. Раннее обращение — это всегда плюс.';
    adminNote = 'Рекомендована консультация. Есть факторы среднего и высокого риска.';
  } else if (percentage >= 15 || factors.length >= 2) {
    level = 'attention';
    title = 'Есть признаки, на которые стоит обратить внимание';
    description = 'В целом развитие вашего ребёнка идёт хорошо, но есть несколько моментов, за которыми стоит понаблюдать. Если что-то вас беспокоит, вы всегда можете обратиться к нам за консультацией.';
    adminNote = 'Незначительные факторы. Рекомендовано наблюдение.';
  } else {
    level = 'no_risk';
    title = 'На данный момент выраженных факторов риска не выявлено';
    description = 'По результатам теста развитие вашего ребёнка соответствует возрастным нормам. Продолжайте наблюдать за малышом, и если появятся вопросы — мы всегда рады помочь!';
    adminNote = 'Факторов риска не выявлено. Наблюдение не требуется.';
  }

  const factorStrings = factors
    .sort((a, b) => b.weight - a.weight)
    .map(f => `${f.questionText}: ${f.selectedLabels.join(', ')}`);

  const detailedExplanation = factors.length > 0
    ? `Основные факторы, повлиявшие на результат:\n${factors
        .sort((a, b) => b.weight - a.weight)
        .map(f => `• ${f.questionText} — ${f.selectedLabels.join(', ')} (уровень: ${f.level === 'high' ? 'высокий' : 'средний'})`)
        .join('\n')}\n\nОбщий балл: ${totalScore} из ${maxScore} (${Math.round(percentage)}%)`
    : 'Факторов риска не обнаружено. Все ответы указывают на нормативное развитие.';

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
