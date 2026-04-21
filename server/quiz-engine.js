import { z } from "zod";
import quizDefinition from "../src/data/quiz-definition.js";

const { questionBlocks, questions, questionsById } = quizDefinition;

const DOMAIN_TITLES = {
  perinatal: "Перинатальный риск",
  motor: "Моторный фундамент",
  speech: "Речевой профиль",
  communication: "Коммуникативный профиль",
  sensory: "Сенсорный профиль",
  play: "Игровые и регуляторные особенности",
};

const DOMAIN_QUESTION_IDS = {
  perinatal: [
    "pregnancy_complications",
    "fetal_hypoxia",
    "birth_week",
    "delivery_type",
    "labor_features",
    "first_cry",
    "apgar",
    "birth_weight",
    "jaundice",
    "discharge_timing",
  ],
  motor: [
    "head_control",
    "roll_over",
    "crawling_age",
    "crawling_style",
    "sitting_age",
    "walking_age",
    "muscle_tone",
    "movement_features",
  ],
  speech: ["pre_speech", "speech_understanding", "current_speech"],
  communication: ["pointing_gesture", "eye_contact", "name_response", "shared_attention"],
  sensory: ["sensory_features"],
  play: ["play_patterns"],
};

const userInfoSchema = z.object({
  childName: z.string({ required_error: "Укажите имя ребенка" }).trim().min(1).max(160),
  birthDate: z
    .string({ required_error: "Укажите дату рождения ребенка" })
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Укажите корректную дату рождения ребенка.",
    }),
  ageNote: z.string().trim().max(160).optional().default(""),
  parentName: z.string({ required_error: "Укажите имя родителя" }).trim().min(1).max(160),
  phone: z.string({ required_error: "Укажите телефон" }).trim().min(6).max(40),
  consentGiven: z.boolean({ required_error: "Необходима галочка согласия" }).refine((value) => value === true, {
    message: "Необходимо согласие на обработку данных.",
  }),
});

const submissionInputSchema = z.object({
  locale: z.enum(["ru", "kz"]).default("ru"),
  userInfo: userInfoSchema,
  answers: z.record(z.any()),
});

export class SubmissionValidationError extends Error {
  constructor(issues) {
    super("Некорректные данные анкеты.");
    this.name = "SubmissionValidationError";
    this.issues = issues;
  }
}

function normalizeAnswer(question, rawValue) {
  if (question.customInput?.kind === "apgar") {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (Array.isArray(rawValue) && rawValue.length !== 1) {
      throw new Error(`Для вопроса "${question.text.ru}" нужен один вариант ответа.`);
    }

    if (value === "unknown") {
      return value;
    }

    const normalized = String(value ?? "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^\d/]/g, "");
    const match = normalized.match(/^(\d{1,2})\/(\d{1,2})$/);

    if (!match) {
      throw new Error(`В вопросе "${question.text.ru}" укажите два числа через /, например 8/9.`);
    }

    const first = Number(match[1]);
    const second = Number(match[2]);

    if (![first, second].every((score) => Number.isInteger(score) && score >= 0 && score <= 10)) {
      throw new Error(`В вопросе "${question.text.ru}" каждая оценка должна быть от 0 до 10.`);
    }

    return `${first}/${second}`;
  }

  if (question.customInput?.kind === "free_text") {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (Array.isArray(rawValue) && rawValue.length !== 1) {
      throw new Error(`Для вопроса "${question.text.ru}" нужен один текстовый ответ.`);
    }

    const normalized = String(value ?? "").trim();

    if (!normalized) {
      throw new Error(`В вопросе "${question.text.ru}" напишите комментарий своими словами.`);
    }

    return normalized;
  }

  if (question.type === "single") {
    if (Array.isArray(rawValue)) {
      if (rawValue.length !== 1) {
        throw new Error(`Для вопроса "${question.text.ru}" нужен один вариант ответа.`);
      }

      return rawValue[0];
    }

    return rawValue;
  }

  const answerValues = Array.isArray(rawValue) ? rawValue : [rawValue];
  const uniqueValues = [...new Set(answerValues)];
  const exclusiveOption = question.options.find((option) => option.exclusive && uniqueValues.includes(option.id));
  return exclusiveOption ? [exclusiveOption.id] : uniqueValues;
}

export function parseSubmissionInput(payload) {
  const parsed = submissionInputSchema.safeParse(payload);

  if (!parsed.success) {
    throw new SubmissionValidationError(parsed.error.issues.map((issue) => issue.message));
  }

  const { locale, userInfo, answers } = parsed.data;
  const issues = [];
  const normalizedAnswers = {};

  for (const questionId of Object.keys(answers)) {
    if (!questionsById[questionId]) {
      issues.push(`Неизвестный вопрос: ${questionId}`);
    }
  }

  for (const question of questions) {
    const rawValue = answers[question.id];

    if (rawValue === undefined) {
      issues.push(`Нет ответа на вопрос: ${question.text.ru}`);
      continue;
    }

    let normalizedValue;

    try {
      normalizedValue = normalizeAnswer(question, rawValue);
    } catch (error) {
      issues.push(error.message);
      continue;
    }

    const allowedOptionIds = new Set(question.options.map((option) => option.id));
    const valuesToCheck = Array.isArray(normalizedValue) ? normalizedValue : [normalizedValue];
    const invalidOptionIds = valuesToCheck.filter((optionId) => !allowedOptionIds.has(optionId));
    const hasCustomAnswer =
      Boolean(question.customInput) &&
      valuesToCheck.length === 1 &&
      valuesToCheck[0] !== "unknown";

    if (invalidOptionIds.length > 0 && !hasCustomAnswer) {
      issues.push(
        `В вопросе "${question.text.ru}" переданы неизвестные варианты: ${invalidOptionIds.join(", ")}.`
      );
      continue;
    }

    normalizedAnswers[question.id] = normalizedValue;
  }

  if (issues.length > 0) {
    throw new SubmissionValidationError(issues);
  }

  return {
    locale,
    userInfo: {
      ...userInfo,
      ageNote: userInfo.ageNote || "",
    },
    answers: normalizedAnswers,
  };
}

function getSelectedIds(question, answers) {
  const value = answers[question.id];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function getSelectedOptions(question, answers) {
  if (question.customInput?.kind === "apgar") {
    const rawValue = answers[question.id];
    const normalizedValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (!normalizedValue) return [];

    if (normalizedValue === "unknown") {
      const unknownOption = question.options.find((option) => option.id === "unknown");
      return unknownOption ? [unknownOption] : [];
    }

    const match = String(normalizedValue).match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!match) return [];

    const first = Number(match[1]);
    const second = Number(match[2]);
    const minScore = Math.min(first, second);
    const optionId = minScore <= 6 ? "0_6" : minScore === 7 ? "7" : "8_10";

    return [
      {
        id: optionId,
        label: {
          ru: `${first}/${second}`,
          kz: `${first}/${second}`,
        },
        deviation: minScore <= 7,
        critical: minScore <= 7,
        exclusive: false,
        hintCodes: minScore <= 7 ? ["check-cervical-spine"] : [],
      },
    ];
  }

  if (question.customInput?.kind === "free_text") {
    return [];
  }

  return getSelectedIds(question, answers)
    .map((selectedId) => question.options.find((option) => option.id === selectedId))
    .filter(Boolean);
}

function getBlockLevel(deviations) {
  if (deviations >= 4) return "high";
  if (deviations >= 2) return "medium";
  return "low";
}

function levelFromCount(count, { medium = 1, high = 3 } = {}) {
  if (count >= high) return "high";
  if (count >= medium) return "medium";
  return "low";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function pushIf(list, condition, value) {
  if (condition) list.push(value);
}

function createEvidenceLine(question, option) {
  return `${question.text.ru}: ${option.label.ru}`;
}

function createFacts(answers) {
  const blockAssessments = questionBlocks.map((block) => ({
    blockId: block.id,
    deviations: 0,
    level: "low",
  }));
  const blockAssessmentById = Object.fromEntries(
    blockAssessments.map((assessment) => [assessment.blockId, assessment])
  );
  const criticalFlags = new Set();
  const unknownAnswers = [];
  const evidenceByQuestionId = {};
  const questionOptionIds = {};

  for (const question of questions) {
    const selectedOptions = getSelectedOptions(question, answers);
    questionOptionIds[question.id] = selectedOptions.map((option) => option.id);
    evidenceByQuestionId[question.id] = selectedOptions.map((option) =>
      createEvidenceLine(question, option)
    );

    for (const option of selectedOptions) {
      if (option.id === "unknown") unknownAnswers.push(question.id);
      if (option.deviation) blockAssessmentById[question.blockId].deviations += 1;
      if (option.critical) criticalFlags.add(`${question.id}:${option.id}`);
    }
  }

  for (const assessment of blockAssessments) {
    assessment.level = getBlockLevel(assessment.deviations);
  }

  const totalDeviations = blockAssessments.reduce((sum, assessment) => sum + assessment.deviations, 0);
  const blocksWithTwoOrMore = blockAssessments.filter((assessment) => assessment.deviations >= 2).length;
  const hasHighBlock = blockAssessments.some((assessment) => assessment.deviations >= 4);

  let status = "green";
  if (criticalFlags.size > 0 || hasHighBlock || blocksWithTwoOrMore >= 2) {
    status = "red";
  } else if (blockAssessments.some((assessment) => assessment.deviations >= 2)) {
    status = "yellow";
  }

  const facts = {
    status,
    totalDeviations,
    blockAssessments,
    blockAssessmentById,
    criticalFlags: [...criticalFlags],
    unknownAnswers: unique(unknownAnswers),
    evidenceByQuestionId,
    questionOptionIds,
    has(questionId, optionIds) {
      const selectedIds = questionOptionIds[questionId] || [];
      const expectedIds = Array.isArray(optionIds) ? optionIds : [optionIds];
      return expectedIds.some((optionId) => selectedIds.includes(optionId));
    },
    getEvidence(questionIds) {
      return unique(questionIds.flatMap((questionId) => evidenceByQuestionId[questionId] || []));
    },
    countDomainDeviations(questionIds) {
      return questionIds.reduce((sum, questionId) => {
        const question = questionsById[questionId];
        if (!question) return sum;
        return sum + getSelectedOptions(question, answers).filter((option) => option.deviation).length;
      }, 0);
    },
  };

  facts.hasPerinatalLoad =
    facts.has("fetal_hypoxia", "yes") ||
    facts.has("first_cry", ["after_help", "ventilation"]) ||
    facts.has("apgar", ["7", "0_6"]) ||
    facts.has("delivery_type", ["emergency_c_section", "vacuum_extraction"]) ||
    facts.has("labor_features", ["forceps", "cord"]);
  facts.hasLateCrawling = facts.has("crawling_age", ["late", "none"]);
  facts.missedCrossCrawl = facts.has("crawling_style", ["belly", "unusual", "none"]);
  facts.hasMotorCoordinationSigns = facts.has("movement_features", ["tiptoes", "falls", "clumsy", "fine_motor"]);
  facts.hasSpeechDelay =
    facts.has("pre_speech", ["pause", "quiet"]) ||
    facts.has("current_speech", ["few_words", "no_words", "echolalia", "jargon"]);
  facts.hasUnderstandingDifficulty = facts.has("speech_understanding", ["with_gesture", "rarely"]);
  facts.hasCommunicationDifficulty =
    facts.has("pointing_gesture", "no") ||
    facts.has("eye_contact", ["unstable", "no"]) ||
    facts.has("name_response", ["sometimes", "no"]) ||
    facts.has("shared_attention", ["rarely", "no"]);
  facts.hasSensoryDifficulty = facts.has("sensory_features", ["sound", "food", "stimming", "clothes"]);
  facts.hasPlayDifficulty = facts.has("play_patterns", ["manipulative", "repetitive", "alone", "no_imitation"]);
  facts.hasAutisticStyleMarkers =
    facts.has("pointing_gesture", "no") &&
    (facts.has("name_response", ["sometimes", "no"]) ||
      facts.has("shared_attention", ["rarely", "no"]) ||
      facts.has("eye_contact", ["unstable", "no"]));

  return facts;
}

function buildBlockProfiles(facts) {
  const perinatalCount = facts.countDomainDeviations(DOMAIN_QUESTION_IDS.perinatal);
  const motorCount = facts.countDomainDeviations(DOMAIN_QUESTION_IDS.motor);
  const speechCount = facts.countDomainDeviations(DOMAIN_QUESTION_IDS.speech);
  const communicationCount = facts.countDomainDeviations(DOMAIN_QUESTION_IDS.communication);
  const sensoryCount = facts.countDomainDeviations(DOMAIN_QUESTION_IDS.sensory);
  const playCount = facts.countDomainDeviations(DOMAIN_QUESTION_IDS.play);

  const profiles = [];

  const perinatalLevel =
    facts.hasPerinatalLoad || perinatalCount >= 3 ? "high" : levelFromCount(perinatalCount, { medium: 1, high: 3 });
  const perinatalConcerns = [];
  pushIf(perinatalConcerns, facts.has("fetal_hypoxia", "yes"), "В анамнезе есть гипоксия плода.");
  pushIf(perinatalConcerns, facts.has("first_cry", ["after_help", "ventilation"]), "Старт жизни сопровождался трудностями сразу после родов.");
  pushIf(perinatalConcerns, facts.has("apgar", ["7", "0_6"]), "Есть сниженные стартовые показатели по шкале Апгар.");
  pushIf(
    perinatalConcerns,
    facts.has("delivery_type", ["emergency_c_section", "vacuum_extraction"]) || facts.has("labor_features", ["forceps", "cord"]),
    "Есть маркеры родовой нагрузки или возможной травматизации."
  );
  pushIf(
    perinatalConcerns,
    facts.has("birth_week", ["preterm", "postterm"]) || facts.has("birth_weight", ["under_2500", "over_4000"]),
    "Стартовые биологические параметры выходили за типичный диапазон."
  );

  profiles.push({
    domain: "perinatal",
    title: DOMAIN_TITLES.perinatal,
    level: perinatalLevel,
    summary:
      perinatalLevel === "high"
        ? "Блок старта жизни показывает выраженную биологическую нагрузку на нервную систему."
        : perinatalLevel === "medium"
          ? "Есть биологические факторы риска, которые могли повлиять на темп и качество развития."
          : "Выраженной биологической нагрузки по анкете не видно, но очная диагностика уточнит детали старта жизни.",
    concerns: unique(perinatalConcerns),
    evidenceQuestionIds: DOMAIN_QUESTION_IDS.perinatal.filter((questionId) => (facts.evidenceByQuestionId[questionId] || []).length > 0),
  });

  const motorLevel =
    facts.hasLateCrawling || facts.missedCrossCrawl || motorCount >= 4
      ? "high"
      : levelFromCount(motorCount, { medium: 1, high: 3 });
  const motorConcerns = [];
  pushIf(motorConcerns, facts.hasLateCrawling, "Ползание началось поздно или этап был пропущен.");
  pushIf(motorConcerns, facts.missedCrossCrawl, "Перекрестное ползание не сформировалось типично.");
  pushIf(motorConcerns, facts.hasMotorCoordinationSigns, "Есть признаки трудностей координации и моторного планирования.");
  pushIf(motorConcerns, facts.has("muscle_tone", ["hyper", "hypo", "dystonia"]), "В анамнезе отмечались особенности мышечного тонуса.");

  profiles.push({
    domain: "motor",
    title: DOMAIN_TITLES.motor,
    level: motorLevel,
    summary:
      motorLevel === "high"
        ? "Моторный фундамент требует приоритетной очной проверки и старта коррекции через тело."
        : motorLevel === "medium"
          ? "Есть отклонения в моторных этапах, которые могут влиять на внимание, координацию и регуляцию."
          : "Грубых моторных дефицитов по анкете не видно, но качество движений важно проверить очно.",
    concerns: unique(motorConcerns),
    evidenceQuestionIds: DOMAIN_QUESTION_IDS.motor.filter((questionId) => (facts.evidenceByQuestionId[questionId] || []).length > 0),
  });

  const speechLevel =
    (facts.has("current_speech", "no_words") && facts.hasUnderstandingDifficulty) || speechCount >= 3
      ? "high"
      : levelFromCount(speechCount, { medium: 1, high: 3 });
  const speechConcerns = [];
  pushIf(speechConcerns, facts.has("pre_speech", ["pause", "quiet"]), "Были особенности доречевого этапа.");
  pushIf(speechConcerns, facts.hasUnderstandingDifficulty, "Есть трудности понимания речи без жестовой опоры.");
  pushIf(
    speechConcerns,
    facts.has("current_speech", ["few_words", "no_words", "echolalia", "jargon"]),
    "Текущий речевой профиль требует дополнительного разбора."
  );

  profiles.push({
    domain: "speech",
    title: DOMAIN_TITLES.speech,
    level: speechLevel,
    summary:
      speechLevel === "high"
        ? "Речевой профиль указывает на выраженные трудности, требующие поэтапной очной диагностики."
        : speechLevel === "medium"
          ? "Есть особенности речи и понимания, которые важно разбирать вместе с коммуникативным профилем."
          : "По анкете речь выглядит относительно устойчиво, но очно важно проверить понимание и качество контакта.",
    concerns: unique(speechConcerns),
    evidenceQuestionIds: DOMAIN_QUESTION_IDS.speech.filter((questionId) => (facts.evidenceByQuestionId[questionId] || []).length > 0),
  });

  const communicationLevel =
    facts.hasAutisticStyleMarkers || communicationCount >= 3
      ? "high"
      : levelFromCount(communicationCount, { medium: 1, high: 3 });
  const communicationConcerns = [];
  pushIf(communicationConcerns, facts.has("pointing_gesture", "no"), "Нет указательного жеста как средства разделенного внимания.");
  pushIf(communicationConcerns, facts.has("eye_contact", ["unstable", "no"]), "Глазной контакт нестабилен или снижен.");
  pushIf(communicationConcerns, facts.has("name_response", ["sometimes", "no"]), "Реакция на имя нестабильна.");
  pushIf(communicationConcerns, facts.has("shared_attention", ["rarely", "no"]), "Есть трудности разделенного внимания и инициативы контакта.");

  profiles.push({
    domain: "communication",
    title: DOMAIN_TITLES.communication,
    level: communicationLevel,
    summary:
      communicationLevel === "high"
        ? "Коммуникативный профиль содержит маркеры, которые нельзя оставлять только на уровне онлайн-анкеты."
        : communicationLevel === "medium"
          ? "Есть признаки незрелости социальных и коммуникативных функций."
          : "Коммуникативный блок по анкете выглядит относительно устойчиво, но нуждается в очном подтверждении.",
    concerns: unique(communicationConcerns),
    evidenceQuestionIds: DOMAIN_QUESTION_IDS.communication.filter((questionId) => (facts.evidenceByQuestionId[questionId] || []).length > 0),
  });

  const sensoryLevel =
    (facts.has("sensory_features", "stimming") && sensoryCount >= 2) || sensoryCount >= 3
      ? "high"
      : levelFromCount(sensoryCount, { medium: 1, high: 3 });
  const sensoryConcerns = [];
  pushIf(sensoryConcerns, facts.has("sensory_features", "sound"), "Есть чувствительность к резким звукам.");
  pushIf(sensoryConcerns, facts.has("sensory_features", "food"), "Есть сенсорная избирательность в еде.");
  pushIf(sensoryConcerns, facts.has("sensory_features", "stimming"), "Есть самостимулирующие двигательные паттерны.");
  pushIf(sensoryConcerns, facts.has("sensory_features", "clothes"), "Есть чувствительность к одежде и тактильным раздражителям.");

  profiles.push({
    domain: "sensory",
    title: DOMAIN_TITLES.sensory,
    level: sensoryLevel,
    summary:
      sensoryLevel === "high"
        ? "Сенсорный профиль выраженно влияет на поведение, включение в контакт и переносимость нагрузки."
        : sensoryLevel === "medium"
          ? "Есть сенсорные особенности, которые важно учитывать при очной работе."
          : "Явных сенсорных трудностей по анкете немного, но они могут проявляться только на очной встрече.",
    concerns: unique(sensoryConcerns),
    evidenceQuestionIds: DOMAIN_QUESTION_IDS.sensory.filter((questionId) => (facts.evidenceByQuestionId[questionId] || []).length > 0),
  });

  const playLevel = facts.hasPlayDifficulty && playCount >= 2 ? "high" : levelFromCount(playCount, { medium: 1, high: 2 });
  const playConcerns = [];
  pushIf(playConcerns, facts.has("play_patterns", "manipulative"), "Игра может оставаться на манипулятивном уровне.");
  pushIf(playConcerns, facts.has("play_patterns", "repetitive"), "Есть однообразные игровые паттерны.");
  pushIf(playConcerns, facts.has("play_patterns", "alone"), "Ребенок предпочитает игру в одиночку.");
  pushIf(playConcerns, facts.has("play_patterns", "no_imitation"), "Есть трудности с имитацией и повторением действий.");

  profiles.push({
    domain: "play",
    title: DOMAIN_TITLES.play,
    level: playLevel,
    summary:
      playLevel === "high"
        ? "Игровой профиль указывает на выраженную незрелость имитации, сюжета или регуляции."
        : playLevel === "medium"
          ? "Есть игровые особенности, которые помогут точнее понять уровень развития на очной встрече."
          : "Игровой блок по анкете выглядит относительно устойчиво, но очно важно проверить инициативу и гибкость игры.",
    concerns: unique(playConcerns),
    evidenceQuestionIds: DOMAIN_QUESTION_IDS.play.filter((questionId) => (facts.evidenceByQuestionId[questionId] || []).length > 0),
  });

  return profiles;
}

function createCollector() {
  return {
    priorityMarkers: new Map(),
    clinicalHypotheses: new Map(),
    sessionFocus: new Map(),
    inSessionRecommendations: new Map(),
    homeGuidance: new Map(),
    whatToCheckInPerson: new Map(),
    contraNotes: new Set(),
    ruleTrace: [],
  };
}

function addRuleResult(collector, rule) {
  const {
    code,
    title,
    domain,
    severity,
    triggeredBy,
    priorityMarker,
    clinicalHypothesis,
    sessionFocus,
    inSessionRecommendation,
    homeGuidance,
    checks,
    contraNotes,
  } = rule;

  if (priorityMarker) collector.priorityMarkers.set(priorityMarker.code, priorityMarker);
  if (clinicalHypothesis) collector.clinicalHypotheses.set(clinicalHypothesis.code, clinicalHypothesis);
  if (sessionFocus) collector.sessionFocus.set(sessionFocus.code, sessionFocus);
  if (inSessionRecommendation) collector.inSessionRecommendations.set(inSessionRecommendation.code, inSessionRecommendation);
  if (homeGuidance) collector.homeGuidance.set(homeGuidance.code, homeGuidance);
  for (const check of checks || []) collector.whatToCheckInPerson.set(check.code, check);
  for (const note of contraNotes || []) collector.contraNotes.add(note);

  const outputs = [
    priorityMarker?.title,
    clinicalHypothesis?.title,
    sessionFocus?.title,
    inSessionRecommendation?.title,
    homeGuidance?.title,
    ...(checks || []).map((check) => check.title),
    ...(contraNotes || []),
  ].filter(Boolean);

  collector.ruleTrace.push({
    code,
    title,
    domain,
    severity,
    triggeredBy,
    outputs,
  });
}

function evaluateRules(facts, blockProfiles) {
  const collector = createCollector();
  const profileByDomain = Object.fromEntries(blockProfiles.map((profile) => [profile.domain, profile]));
  const nonLowDomains = blockProfiles.filter((profile) => profile.level !== "low");

  if (profileByDomain.perinatal.level !== "low") {
    addRuleResult(collector, {
      code: "perinatal-load",
      title: "Биологическая нагрузка старта жизни",
      domain: "perinatal",
      severity: profileByDomain.perinatal.level === "high" ? "high" : "medium",
      triggeredBy: facts.getEvidence(DOMAIN_QUESTION_IDS.perinatal),
      priorityMarker: {
        code: "perinatal-load",
        domain: "perinatal",
        severity: profileByDomain.perinatal.level === "high" ? "high" : "medium",
        title: "Перинатальный анамнез требует очной расшифровки",
        summary: "Старт жизни мог задать фоновую нагрузку на регуляцию, тонус, выносливость и обучаемость.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.perinatal),
      },
      clinicalHypothesis: {
        code: "perinatal-load",
        title: "Вероятна ранняя нейрофизиологическая нагрузка",
        summary: "Перинатальные факторы могли повлиять на базовую регуляцию, сенсомоторный старт и адаптацию к нагрузке.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.perinatal),
      },
      sessionFocus: {
        code: "perinatal-regulation",
        title: "Сначала стабилизировать регуляцию и ресурсность",
        description: "На старте работы смотреть не только на навык, но и на утомляемость, качество контакта и переносимость нагрузки.",
      },
      inSessionRecommendation: {
        code: "perinatal-regulation",
        title: "Щадящий старт и опора на сенсомоторную базу",
        goal: "Снизить перегрузку и понять, как ребенок выдерживает структурированную деятельность.",
        startModule: "Наблюдение, базовая сенсомоторика, постуральный контроль, качество тонуса и переключаемость.",
        watchFor: "Быстрая истощаемость, дискомфорт при новой задаче, нестабильность внимания.",
        useStrengths: "Опирайтесь на задания с понятной структурой и коротким циклом успеха.",
        contactStyle: "Короткие блоки, мягкое наращивание требований, без длинных речевых инструкций на старте.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.perinatal),
      },
      homeGuidance: {
        code: "perinatal-regulation",
        title: "Бережный ритм дома",
        description: "Поддерживать предсказуемый режим, дозировать перегрузку и чередовать активность с восстановлением.",
      },
      checks: [
        {
          code: "perinatal-check",
          title: "Проверить стартовую сенсомоторную базу",
          reason: "Оценить тонус, ось тела, постуральный контроль, устойчивость к нагрузке и качество переключения.",
        },
      ],
      contraNotes: [
        "Не начинать работу с длинных когнитивно-речевых задач без оценки базовой регуляции.",
      ],
    });
  }

  if (facts.hasLateCrawling || facts.missedCrossCrawl) {
    addRuleResult(collector, {
      code: "cross-crawl-deficit",
      title: "Незрелость сенсомоторного фундамента",
      domain: "motor",
      severity: "critical",
      triggeredBy: facts.getEvidence(["crawling_age", "crawling_style"]),
      priorityMarker: {
        code: "cross-crawl-deficit",
        domain: "motor",
        severity: "critical",
        title: "Пропущен или нарушен этап ползания",
        summary: "Это один из ключевых маркеров для проверки межполушарного взаимодействия, схемы тела и моторного планирования.",
        evidence: facts.getEvidence(["crawling_age", "crawling_style"]),
      },
      clinicalHypothesis: {
        code: "cross-crawl-deficit",
        title: "Возможна слабость межполушарного взаимодействия",
        summary: "Нужно проверить схему тела, двустороннюю координацию, пересечение средней линии и моторное планирование.",
        evidence: facts.getEvidence(["crawling_age", "crawling_style"]),
      },
      sessionFocus: {
        code: "sensorimotor-base",
        title: "Начать с сенсомоторной базы",
        description: "Первые занятия строить через крупную моторику, схему тела и координационные паттерны.",
      },
      inSessionRecommendation: {
        code: "sensorimotor-base",
        title: "Работа через тело и перекрестные паттерны",
        goal: "Собрать базовый моторный фундамент до усложнения когнитивных и речевых задач.",
        startModule: "Крупная моторика, перекрестные движения, баланс, опора на корпус и ориентировка в теле.",
        watchFor: "Ассиметрию, уход от сложных движений, трудности последовательности и пересечения средней линии.",
        useStrengths: "Использовать игровые двигательные маршруты и простые повторяющиеся серии.",
        contactStyle: "Минимум длинных объяснений, максимум наглядного показа и совместного действия.",
        evidence: facts.getEvidence(["crawling_age", "crawling_style"]),
      },
      homeGuidance: {
        code: "sensorimotor-base",
        title: "Дома поддерживать тело и координацию",
        description: "Давать игровые задания на крупную моторику, баланс и совместные движения без давления на результат.",
      },
      checks: [
        {
          code: "cross-crawl-check",
          title: "Проверить схему тела и двустороннюю координацию",
          reason: "Оценить пересечение средней линии, моторное планирование и организацию движения.",
        },
      ],
      contraNotes: [
        "Не перегружать речевыми задачами, пока не проверен базовый сенсомоторный фундамент.",
      ],
    });
  }

  if (facts.hasMotorCoordinationSigns) {
    addRuleResult(collector, {
      code: "motor-planning",
      title: "Трудности моторного планирования",
      domain: "motor",
      severity: profileByDomain.motor.level === "high" ? "high" : "medium",
      triggeredBy: facts.getEvidence(["movement_features", "muscle_tone", "walking_age"]),
      priorityMarker: {
        code: "motor-planning",
        domain: "motor",
        severity: profileByDomain.motor.level === "high" ? "high" : "medium",
        title: "Есть признаки координационной незрелости",
        summary: "Важно проверить не только сроки моторных этапов, но и качество движения, точность и планирование.",
        evidence: facts.getEvidence(["movement_features", "muscle_tone", "walking_age"]),
      },
      sessionFocus: {
        code: "motor-planning",
        title: "Выстраивать движение через простые последовательности",
        description: "Начинать с устойчивых, ритмичных и понятных двигательных шаблонов.",
      },
      inSessionRecommendation: {
        code: "motor-planning",
        title: "Разбирать движение по шагам",
        goal: "Повысить качество моторного ответа и снизить хаотичность движения.",
        startModule: "Баланс, ритм, целенаправленные движения, простые серийные действия, координация рук и ног.",
        watchFor: "Импульсивный старт, потерю программы, неловкость на переходах и в мелких манипуляциях.",
        useStrengths: "Опирайтесь на ритм, повтор и зрительный образ движения.",
        contactStyle: "Одна задача за раз, короткая инструкция, показ перед выполнением.",
        evidence: facts.getEvidence(["movement_features", "muscle_tone", "walking_age"]),
      },
      homeGuidance: {
        code: "motor-planning",
        title: "Поддержка координации через игру",
        description: "Выбирать бытовые и игровые задания на точность, ритм и последовательность движений без критики ошибок.",
      },
      checks: [
        {
          code: "motor-planning-check",
          title: "Проверить моторное планирование",
          reason: "Оценить серийную организацию движения, переключение, точность и устойчивость программы действия.",
        },
      ],
    });
  }

  if (facts.hasSpeechDelay) {
    addRuleResult(collector, {
      code: "speech-delay",
      title: "Речевой профиль требует отдельной очной оценки",
      domain: "speech",
      severity: profileByDomain.speech.level === "high" ? "high" : "medium",
      triggeredBy: facts.getEvidence(["pre_speech", "speech_understanding", "current_speech"]),
      priorityMarker: {
        code: "speech-delay",
        domain: "speech",
        severity: profileByDomain.speech.level === "high" ? "high" : "medium",
        title: "Есть признаки речевой незрелости",
        summary: "Важно отделить собственно речевую трудность от проблем контакта, понимания и сенсомоторной базы.",
        evidence: facts.getEvidence(["pre_speech", "speech_understanding", "current_speech"]),
      },
      clinicalHypothesis: {
        code: "speech-delay",
        title: "Нужно различить языковой дефицит и вторичное снижение речи",
        summary: "На очной диагностике важно понять, что первично: понимание, контакт, моторная база или собственно речь.",
        evidence: facts.getEvidence(["pre_speech", "speech_understanding", "current_speech"]),
      },
      sessionFocus: {
        code: "speech-support",
        title: "Сначала оценить понимание и доступность инструкции",
        description: "Работу со словом строить после проверки контакта, реакции на обращение и способности удерживать совместную задачу.",
      },
      inSessionRecommendation: {
        code: "speech-support",
        title: "Не гнаться за количеством слов на старте",
        goal: "Понять, за счет чего тормозится речь, и подобрать опорный вход в работу.",
        startModule: "Понимание речи, подражание, совместное действие, звукоподражание, простые словесные модели в действии.",
        watchFor: "Уход от инструкции, слабую инициативу, непонимание слов вне жеста, эхолаличные ответы.",
        useStrengths: "Опирайтесь на интересы ребенка, игровые ритуалы и наглядную ситуацию.",
        contactStyle: "Короткие речевые стимулы, повтор, пауза на ответ, минимум перегрузки вопросами.",
        evidence: facts.getEvidence(["pre_speech", "speech_understanding", "current_speech"]),
      },
      homeGuidance: {
        code: "speech-support",
        title: "Дома поддерживать речь через совместные действия",
        description: "Больше коротких повторяющихся игровых эпизодов с простыми словами в действии, без давления на повторение.",
      },
      checks: [
        {
          code: "speech-check",
          title: "Проверить понимание, подражание и речевую инициативу",
          reason: "Нужно увидеть, на каком уровне сейчас доступен контакт со словом и как ребенок использует речь в коммуникации.",
        },
      ],
    });
  }

  if (facts.hasUnderstandingDifficulty || profileByDomain.communication.level !== "low") {
    addRuleResult(collector, {
      code: "communication-support",
      title: "Приоритет контакта и совместного внимания",
      domain: "communication",
      severity: facts.hasAutisticStyleMarkers ? "critical" : "high",
      triggeredBy: facts.getEvidence(DOMAIN_QUESTION_IDS.communication.concat(["speech_understanding"])),
      priorityMarker: {
        code: "communication-support",
        domain: "communication",
        severity: facts.hasAutisticStyleMarkers ? "critical" : "high",
        title: facts.hasAutisticStyleMarkers
          ? "Есть значимые социально-коммуникативные маркеры"
          : "Коммуникативный профиль требует усиленного внимания",
        summary: "На очной встрече важно разложить по отдельности контакт, понимание, инициативу и разделенное внимание.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.communication.concat(["speech_understanding"])),
      },
      clinicalHypothesis: {
        code: "communication-support",
        title: "Вероятна незрелость базовых коммуникативных функций",
        summary: "Нужно проверить совместное внимание, отклик на имя, инициативу контакта и использование жеста.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.communication.concat(["speech_understanding"])),
      },
      sessionFocus: {
        code: "communication-support",
        title: "Сначала выстраивать контакт и совместное внимание",
        description: "До усложнения задач важно добиться устойчивого включения во взаимодействие со взрослым.",
      },
      inSessionRecommendation: {
        code: "communication-support",
        title: "Работать через контакт, совместный интерес и предсказуемость",
        goal: "Усилить включенность ребенка во взаимодействие и сделать взрослого значимым партнером.",
        startModule: "Совместные игровые ритуалы, разделенное внимание, имитация, очередность, простые просьбы в ситуации успеха.",
        watchFor: "Уход в предмет, слабый отклик, отсутствие запроса взрослого, трудности переключения на партнера.",
        useStrengths: "Использовать сильные интересы как мост к контакту, а не бороться с ними напрямую.",
        contactStyle: "Очень короткие циклы взаимодействия, высокая наглядность, четкое начало и конец действия.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.communication.concat(["speech_understanding"])),
      },
      homeGuidance: {
        code: "communication-support",
        title: "Поддержка контакта дома",
        description: "Делать акцент на совместной игре, очередности, показе и разделенной радости, а не только на обучающих заданиях.",
      },
      checks: [
        {
          code: "communication-check",
          title: "Проверить совместное внимание и инициативу контакта",
          reason: "Важно понять, как ребенок подключается к партнеру и что мешает устойчивому взаимодействию.",
        },
      ],
      contraNotes: [
        "Не строить первые занятия только вокруг академических или словесных задач без опоры на контакт.",
      ],
    });
  }

  if (facts.hasSensoryDifficulty) {
    addRuleResult(collector, {
      code: "sensory-regulation",
      title: "Сенсорная регуляция влияет на поведение",
      domain: "sensory",
      severity: profileByDomain.sensory.level === "high" ? "high" : "medium",
      triggeredBy: facts.getEvidence(["sensory_features"]),
      priorityMarker: {
        code: "sensory-regulation",
        domain: "sensory",
        severity: profileByDomain.sensory.level === "high" ? "high" : "medium",
        title: "Сенсорный профиль нужно учитывать уже с первого приема",
        summary: "Сенсорные особенности могут менять контакт, поведение, качество инструкции и переносимость кабинета.",
        evidence: facts.getEvidence(["sensory_features"]),
      },
      sessionFocus: {
        code: "sensory-regulation",
        title: "Сначала помочь телу выдерживать среду",
        description: "Перед сложными заданиями важно подобрать подходящий уровень сенсорной нагрузки и ритма.",
      },
      inSessionRecommendation: {
        code: "sensory-regulation",
        title: "Дозировать сенсорную нагрузку",
        goal: "Снизить перегрузку и создать состояние, в котором ребенок сможет включаться в задачи.",
        startModule: "Наблюдение за реакцией на звук, тактильность, движение, темп и плотность стимулов в кабинете.",
        watchFor: "Закрывание ушей, избегание, самостимуляции, резкие колебания возбуждения и утомления.",
        useStrengths: "Опирайтесь на предпочитаемые ощущения как способ входа в контакт.",
        contactStyle: "Спокойная среда, предсказуемые переходы, без лишнего шума и спешки.",
        evidence: facts.getEvidence(["sensory_features"]),
      },
      homeGuidance: {
        code: "sensory-regulation",
        title: "Дома снижать перегрузку среды",
        description: "Смотреть, какие звуки, ткани, продукты и форматы активности ребенок переносит тяжелее, и мягко подстраивать режим.",
      },
      checks: [
        {
          code: "sensory-check",
          title: "Проверить сенсорные триггеры и способы саморегуляции",
          reason: "Это поможет понять, какие условия нужны для продуктивной работы на занятии.",
        },
      ],
    });
  }

  if (facts.hasPlayDifficulty) {
    addRuleResult(collector, {
      code: "play-regulation",
      title: "Игровой профиль требует отдельной оценки",
      domain: "play",
      severity: profileByDomain.play.level === "high" ? "high" : "medium",
      triggeredBy: facts.getEvidence(["play_patterns"]),
      priorityMarker: {
        code: "play-regulation",
        domain: "play",
        severity: profileByDomain.play.level === "high" ? "high" : "medium",
        title: "Через игру можно лучше понять уровень развития",
        summary: "Игра, имитация и сюжет сейчас выглядят менее зрелыми, чем ожидается, и требуют очного наблюдения.",
        evidence: facts.getEvidence(["play_patterns"]),
      },
      sessionFocus: {
        code: "play-regulation",
        title: "Выстраивать игру как инструмент контакта и развития",
        description: "Переходить от манипуляций и однообразия к совместной, более гибкой игре.",
      },
      inSessionRecommendation: {
        code: "play-regulation",
        title: "Работать через имитацию и совместную игру",
        goal: "Расширить игровые действия и сделать взрослого участником, а не только наблюдателем.",
        startModule: "Имитация действий, очередность, простые сюжеты, совместные короткие игровые сценарии.",
        watchFor: "Застревание на стереотипном действии, уход в одиночную игру, слабую гибкость сюжета.",
        useStrengths: "Входить через любимые предметы и постепенно расширять способ игры с ними.",
        contactStyle: "Не ломать привычный интерес, а достраивать его до совместного действия.",
        evidence: facts.getEvidence(["play_patterns"]),
      },
      homeGuidance: {
        code: "play-regulation",
        title: "Дома развивать совместную игру",
        description: "Добавлять короткие ритуалы с очередностью, простым сюжетом и повтором, где взрослый и ребенок играют вместе.",
      },
      checks: [
        {
          code: "play-check",
          title: "Проверить имитацию, сюжет и гибкость игры",
          reason: "Это поможет понять, насколько игра может быть опорой для речи, контакта и обучения.",
        },
      ],
    });
  }

  if (profileByDomain.perinatal.level !== "low" && profileByDomain.motor.level !== "low") {
    addRuleResult(collector, {
      code: "combined-perinatal-motor",
      title: "Перинатальные факторы сочетаются с моторной незрелостью",
      domain: "motor",
      severity: "critical",
      triggeredBy: facts.getEvidence(DOMAIN_QUESTION_IDS.perinatal.concat(DOMAIN_QUESTION_IDS.motor)),
      priorityMarker: {
        code: "combined-perinatal-motor",
        domain: "motor",
        severity: "critical",
        title: "Сочетанный перинатально-моторный риск",
        summary: "Важно не рассматривать двигательную историю изолированно: вероятно, моторный профиль связан со стартовой биологической нагрузкой.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.perinatal.concat(DOMAIN_QUESTION_IDS.motor)),
      },
      clinicalHypothesis: {
        code: "combined-perinatal-motor",
        title: "Моторная незрелость может быть вторична к ранней нагрузке",
        summary: "На очной диагностике важно смотреть регуляцию, тонус, координацию и устойчивость к нагрузке в одной системе.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.perinatal.concat(DOMAIN_QUESTION_IDS.motor)),
      },
      checks: [
        {
          code: "combined-perinatal-motor",
          title: "Проверить связь между регуляцией и моторикой",
          reason: "Важно понять, где первичный дефицит: в базовой нейрофизиологической регуляции, тонусе или моторном планировании.",
        },
      ],
    });
  }

  if (facts.hasAutisticStyleMarkers) {
    addRuleResult(collector, {
      code: "social-communication-markers",
      title: "Выраженные социально-коммуникативные маркеры",
      domain: "communication",
      severity: "critical",
      triggeredBy: facts.getEvidence(DOMAIN_QUESTION_IDS.communication),
      priorityMarker: {
        code: "social-communication-markers",
        domain: "communication",
        severity: "critical",
        title: "Нужно очно проверить социально-коммуникативный профиль",
        summary: "Комбинация жеста, отклика, контакта и разделенного внимания требует очной дифференциации.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.communication),
      },
      clinicalHypothesis: {
        code: "social-communication-markers",
        title: "Нужна дифференциация причин коммуникативных трудностей",
        summary: "Важно не ставить ярлык по анкете, а очно разделить вклад контакта, речи, сенсорики и регуляции.",
        evidence: facts.getEvidence(DOMAIN_QUESTION_IDS.communication),
      },
      checks: [
        {
          code: "social-communication-markers",
          title: "Прицельно проверить совместное внимание, жест и инициативу контакта",
          reason: "Это ключ к пониманию природы коммуникативного профиля и выбору маршрута коррекции.",
        },
      ],
      contraNotes: [
        "Не делать окончательных диагностических выводов только по анкете без очной дифференциации.",
      ],
    });
  }

  if (facts.hasSpeechDelay && facts.hasSensoryDifficulty && facts.hasUnderstandingDifficulty) {
    addRuleResult(collector, {
      code: "speech-sensory-combo",
      title: "Речь, понимание и сенсорика взаимно усиливают трудности",
      domain: "speech",
      severity: "high",
      triggeredBy: facts.getEvidence(["speech_understanding", "current_speech", "sensory_features"]),
      priorityMarker: {
        code: "speech-sensory-combo",
        domain: "speech",
        severity: "high",
        title: "Речевой дефицит лучше рассматривать в связке с сенсорикой и пониманием",
        summary: "Если сразу работать только над словом, можно пропустить реальные причины трудностей.",
        evidence: facts.getEvidence(["speech_understanding", "current_speech", "sensory_features"]),
      },
      checks: [
        {
          code: "speech-sensory-combo",
          title: "Проверить, что первично тормозит речь",
          reason: "Важно отличить языковой дефицит от перегрузки, слабого понимания и трудностей контакта.",
        },
      ],
      contraNotes: [
        "Не форсировать речевой ответ без учета сенсорной и коммуникативной нагрузки.",
      ],
    });
  }

  if (facts.status === "green" && nonLowDomains.length === 0) {
    addRuleResult(collector, {
      code: "preventive-route",
      title: "Профилактический маршрут",
      domain: "motor",
      severity: "medium",
      triggeredBy: ["Анкета не показывает выраженных зон дефицита."],
      sessionFocus: {
        code: "preventive-route",
        title: "Подтвердить сильные стороны и тонкие зоны роста",
        description: "Очная встреча нужна скорее для настройки маршрута наблюдения и профилактики, чем для срочной коррекции.",
      },
      homeGuidance: {
        code: "preventive-route",
        title: "Сохранять игровую и двигательную насыщенность дня",
        description: "Поддерживать активную игру, контакт со взрослым и разнообразие сенсомоторного опыта в спокойном режиме.",
      },
      checks: [
        {
          code: "preventive-route",
          title: "Подтвердить профиль очно",
          reason: "Важно увидеть ребенка в реальном взаимодействии и не упустить тонкие дефициты, которые анкета не ловит.",
        },
      ],
    });
  }

  return {
    priorityMarkers: [...collector.priorityMarkers.values()],
    clinicalHypotheses: [...collector.clinicalHypotheses.values()],
    sessionFocus: [...collector.sessionFocus.values()],
    inSessionRecommendations: [...collector.inSessionRecommendations.values()],
    homeGuidance: [...collector.homeGuidance.values()],
    whatToCheckInPerson: [...collector.whatToCheckInPerson.values()],
    contraNotes: [...collector.contraNotes.values()],
    ruleTrace: collector.ruleTrace,
  };
}

function buildClinicalSummary(facts, blockProfiles, ruleResults) {
  const dominantProfiles = blockProfiles
    .filter((profile) => profile.level !== "low")
    .sort((left, right) => {
      const score = { high: 2, medium: 1, low: 0 };
      return score[right.level] - score[left.level];
    })
    .slice(0, 3);

  if (facts.status === "green" && dominantProfiles.length === 0) {
    return "По анкете грубых дефицитов не видно. Очная встреча нужна для подтверждения сильных сторон и настройки профилактического маршрута.";
  }

  const domainsText =
    dominantProfiles.length > 0
      ? `В приоритете очной оценки: ${dominantProfiles.map((profile) => profile.title.toLowerCase()).join(", ")}.`
      : "Есть сочетание факторов риска, которое требует очной диагностики.";
  const criticalText =
    facts.criticalFlags.length > 0
      ? "Анкета содержит красные флаги, поэтому маршрут лучше строить без отсрочки."
      : "Выраженных одиночных красных флагов немного, но сочетание признаков уже влияет на профиль развития.";
  const sessionText =
    ruleResults.sessionFocus.length > 0
      ? `Старт работы: ${ruleResults.sessionFocus[0].title.toLowerCase()}.`
      : "";

  return [domainsText, criticalText, sessionText].filter(Boolean).join(" ");
}

export function calculateResult(answers, options = {}) {
  const fullPrice = Number(options.fullPrice || process.env.DIAGNOSTIC_FULL_PRICE || 30000);
  const createdAt = new Date(options.createdAt || Date.now());
  const facts = createFacts(answers);
  const blockProfiles = buildBlockProfiles(facts);
  const ruleResults = evaluateRules(facts, blockProfiles);

  return {
    status: facts.status,
    riskStatus: facts.status,
    totalDeviations: facts.totalDeviations,
    blockAssessments: facts.blockAssessments,
    criticalFlags: facts.criticalFlags,
    unknownAnswers: facts.unknownAnswers,
    offer: {
      discountPercent: 20,
      fullPrice,
      discountedPrice: Math.round(fullPrice * 0.8),
      expiresAt: new Date(createdAt.getTime() + 72 * 60 * 60 * 1000).toISOString(),
    },
    reportVersion: 3,
    clinicalSummary: buildClinicalSummary(facts, blockProfiles, ruleResults),
    blockProfiles,
    priorityMarkers: ruleResults.priorityMarkers,
    clinicalHypotheses: ruleResults.clinicalHypotheses,
    sessionFocus: ruleResults.sessionFocus,
    inSessionRecommendations: ruleResults.inSessionRecommendations,
    homeGuidance: ruleResults.homeGuidance,
    whatToCheckInPerson: ruleResults.whatToCheckInPerson,
    contraNotes: ruleResults.contraNotes,
    ruleTrace: ruleResults.ruleTrace,
  };
}
