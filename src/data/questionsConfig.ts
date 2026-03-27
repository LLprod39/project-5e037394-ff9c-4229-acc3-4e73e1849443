import { Question, QuestionBlock } from '@/types/quiz';

export const questionBlocks: QuestionBlock[] = [
  {
    id: 'pregnancy',
    title: 'Беременность и роды',
    icon: '🤰',
    description: 'Вопросы о протекании беременности и родов',
  },
  {
    id: 'motor',
    title: 'Физическое и моторное развитие',
    icon: '👶',
    description: 'Развитие ребёнка в первый год жизни',
  },
  {
    id: 'speech',
    title: 'Речь и коммуникация',
    icon: '💬',
    description: 'Речевое и социальное развитие',
  },
];

export const questions: Question[] = [
  // Block 1: Pregnancy
  {
    id: 'pregnancy_course',
    blockId: 'pregnancy',
    text: 'Как протекала беременность?',
    type: 'multiple',
    options: [
      { id: 'no_complications', label: 'Без осложнений', riskLevel: 'low', riskWeight: 0 },
      { id: 'toxicosis', label: 'Сильный токсикоз', riskLevel: 'medium', riskWeight: 2 },
      { id: 'miscarriage_threat', label: 'Угроза прерывания', riskLevel: 'high', riskWeight: 4 },
      { id: 'infections', label: 'Инфекционные заболевания', riskLevel: 'high', riskWeight: 4 },
      { id: 'medications', label: 'Приём лекарственных препаратов', riskLevel: 'medium', riskWeight: 2 },
      { id: 'stress', label: 'Сильный стресс', riskLevel: 'medium', riskWeight: 2 },
    ],
  },
  {
    id: 'hypoxia',
    blockId: 'pregnancy',
    text: 'Была ли диагностирована гипоксия плода (кислородное голодание) во время беременности?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Да', riskLevel: 'high', riskWeight: 5 },
      { id: 'no', label: 'Нет', riskLevel: 'low', riskWeight: 0 },
      { id: 'dont_know', label: 'Не знаю', riskLevel: 'medium', riskWeight: 1 },
      { id: 'not_diagnosed', label: 'Не ставили', riskLevel: 'low', riskWeight: 0 },
    ],
  },
  {
    id: 'birth_type',
    blockId: 'pregnancy',
    text: 'Как прошли роды?',
    type: 'single',
    options: [
      { id: 'natural_normal', label: 'Естественные, без осложнений', riskLevel: 'low', riskWeight: 0 },
      { id: 'natural_complications', label: 'Естественные, с осложнениями', riskLevel: 'medium', riskWeight: 3 },
      { id: 'cesarean_planned', label: 'Плановое кесарево сечение', riskLevel: 'low', riskWeight: 1 },
      { id: 'cesarean_emergency', label: 'Экстренное кесарево сечение', riskLevel: 'high', riskWeight: 4 },
      { id: 'premature', label: 'Преждевременные роды', riskLevel: 'high', riskWeight: 5 },
    ],
  },

  // Block 2: Motor development
  {
    id: 'head_holding',
    blockId: 'motor',
    text: 'Когда ребёнок начал уверенно держать голову?',
    type: 'single',
    options: [
      { id: 'before_3m', label: 'До 3 месяцев', riskLevel: 'low', riskWeight: 0 },
      { id: '3_4m', label: '3–4 месяца', riskLevel: 'low', riskWeight: 1 },
      { id: '5_6m', label: '5–6 месяцев', riskLevel: 'medium', riskWeight: 3 },
      { id: 'after_6m', label: 'После 6 месяцев', riskLevel: 'high', riskWeight: 5 },
      { id: 'dont_remember', label: 'Не помню', riskLevel: 'low', riskWeight: 1 },
    ],
  },
  {
    id: 'sitting',
    blockId: 'motor',
    text: 'Когда ребёнок начал сидеть самостоятельно?',
    type: 'single',
    options: [
      { id: 'before_7m', label: 'До 7 месяцев', riskLevel: 'low', riskWeight: 0 },
      { id: '7_9m', label: '7–9 месяцев', riskLevel: 'low', riskWeight: 1 },
      { id: '10_12m', label: '10–12 месяцев', riskLevel: 'medium', riskWeight: 3 },
      { id: 'after_12m', label: 'После 12 месяцев', riskLevel: 'high', riskWeight: 5 },
      { id: 'dont_remember', label: 'Не помню', riskLevel: 'low', riskWeight: 1 },
    ],
  },
  {
    id: 'walking',
    blockId: 'motor',
    text: 'Когда ребёнок начал ходить?',
    type: 'single',
    options: [
      { id: 'before_12m', label: 'До 12 месяцев', riskLevel: 'low', riskWeight: 0 },
      { id: '12_15m', label: '12–15 месяцев', riskLevel: 'low', riskWeight: 1 },
      { id: '15_18m', label: '15–18 месяцев', riskLevel: 'medium', riskWeight: 3 },
      { id: 'after_18m', label: 'После 18 месяцев', riskLevel: 'high', riskWeight: 5 },
      { id: 'not_yet', label: 'Ещё не ходит', riskLevel: 'high', riskWeight: 4 },
    ],
  },

  // Block 3: Speech & communication
  {
    id: 'first_words',
    blockId: 'speech',
    text: 'Когда появились первые слова?',
    type: 'single',
    options: [
      { id: 'before_12m', label: 'До 12 месяцев', riskLevel: 'low', riskWeight: 0 },
      { id: '12_18m', label: '12–18 месяцев', riskLevel: 'low', riskWeight: 1 },
      { id: '18_24m', label: '18–24 месяца', riskLevel: 'medium', riskWeight: 3 },
      { id: 'after_24m', label: 'После 24 месяцев', riskLevel: 'high', riskWeight: 5 },
      { id: 'no_words', label: 'Слов пока нет', riskLevel: 'high', riskWeight: 6 },
    ],
  },
  {
    id: 'eye_contact',
    blockId: 'speech',
    text: 'Устанавливает ли ребёнок зрительный контакт?',
    type: 'single',
    options: [
      { id: 'yes_always', label: 'Да, хорошо и часто', riskLevel: 'low', riskWeight: 0 },
      { id: 'sometimes', label: 'Иногда, нестабильно', riskLevel: 'medium', riskWeight: 3 },
      { id: 'rarely', label: 'Редко или избегает', riskLevel: 'high', riskWeight: 5 },
      { id: 'not_sure', label: 'Затрудняюсь ответить', riskLevel: 'medium', riskWeight: 2 },
    ],
  },
  {
    id: 'social_interaction',
    blockId: 'speech',
    text: 'Как ребёнок взаимодействует с другими детьми?',
    type: 'single',
    options: [
      { id: 'active', label: 'Активно играет и общается', riskLevel: 'low', riskWeight: 0 },
      { id: 'observes', label: 'Наблюдает, но не включается', riskLevel: 'medium', riskWeight: 2 },
      { id: 'avoids', label: 'Избегает контакта', riskLevel: 'high', riskWeight: 5 },
      { id: 'aggressive', label: 'Проявляет агрессию', riskLevel: 'high', riskWeight: 4 },
      { id: 'no_experience', label: 'Нет опыта общения с детьми', riskLevel: 'low', riskWeight: 1 },
    ],
  },
];

export const getQuestionsByBlock = (blockId: string): Question[] =>
  questions.filter((q) => q.blockId === blockId);
