import { Submission } from '@/types/quiz';

const STORAGE_KEY = 'quiz_submissions';

export function saveSubmission(submission: Submission): void {
  const existing = getSubmissions();
  existing.push(submission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getSubmissions(): Submission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSubmissionById(id: string): Submission | undefined {
  return getSubmissions().find(s => s.id === id);
}

// Generate mock data for admin demo
export function generateMockData(): void {
  const existing = getSubmissions();
  if (existing.length > 0) return;

  const mockSubmissions: Submission[] = [
    {
      id: 'mock-1',
      date: '2026-03-25T10:30:00Z',
      userInfo: {
        childName: 'Артём',
        childAge: '2 года 4 месяца',
        parentName: 'Елена Смирнова',
        phone: '+7 (999) 123-45-67',
        consentGiven: true,
      },
      answers: {
        pregnancy_course: ['toxicosis', 'stress'],
        hypoxia: ['yes'],
        birth_type: ['cesarean_emergency'],
        head_holding: ['5_6m'],
        sitting: ['10_12m'],
        walking: ['15_18m'],
        first_words: ['18_24m'],
        eye_contact: ['sometimes'],
        social_interaction: ['observes'],
      },
      result: {
        level: 'diagnosis',
        title: 'Рекомендуем пройти диагностику',
        description: '',
        factors: ['Гипоксия плода: Да', 'Роды: Экстренное кесарево сечение'],
        totalScore: 28,
        maxScore: 60,
        detailedExplanation: 'Множественные факторы риска в анамнезе.',
        adminNote: 'Рекомендована комплексная диагностика.',
      },
    },
    {
      id: 'mock-2',
      date: '2026-03-26T14:15:00Z',
      userInfo: {
        childName: 'Мария',
        childAge: '1 год 8 месяцев',
        parentName: 'Ольга Иванова',
        phone: '+7 (916) 987-65-43',
        consentGiven: true,
      },
      answers: {
        pregnancy_course: ['no_complications'],
        hypoxia: ['no'],
        birth_type: ['natural_normal'],
        head_holding: ['before_3m'],
        sitting: ['before_7m'],
        walking: ['12_15m'],
        first_words: ['12_18m'],
        eye_contact: ['yes_always'],
        social_interaction: ['active'],
      },
      result: {
        level: 'no_risk',
        title: 'Выраженных факторов риска не выявлено',
        description: '',
        factors: [],
        totalScore: 3,
        maxScore: 60,
        detailedExplanation: 'Все показатели в норме.',
        adminNote: 'Факторов риска не выявлено.',
      },
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSubmissions));
}
