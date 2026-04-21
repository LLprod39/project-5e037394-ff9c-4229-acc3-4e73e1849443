import {
  BlockProfile,
  CheckInPersonItem,
  ClinicalHypothesis,
  InSessionRecommendation,
  MarkerSeverity,
  PriorityMarker,
  QuizAnswerValue,
  QuizResult,
  RiskDomain,
  RuleTraceEntry,
  SessionFocusItem,
  Submission,
} from "@/types/quiz";

type LegacyResult = Partial<QuizResult> & {
  smartHints?: string[];
};

export interface NormalizedAdminResult {
  clinicalSummary: string;
  summary: string[];
  alerts: PriorityMarker[];
  concerns: string[];
  checks: string[];
  sessionStart: string[];
  blockProfiles: BlockProfile[];
  priorityMarkers: PriorityMarker[];
  clinicalHypotheses: ClinicalHypothesis[];
  whatToCheckInPerson: CheckInPersonItem[];
  contraNotes: string[];
  sessionFocus: SessionFocusItem[];
  inSessionRecommendations: InSessionRecommendation[];
  ruleTrace: RuleTraceEntry[];
}

const DOMAIN_TITLES: Record<RiskDomain, string> = {
  perinatal: "Перинатальный риск",
  motor: "Моторика",
  speech: "Речь",
  communication: "Коммуникация",
  sensory: "Сенсорика",
  play: "Игра и поведение",
};

const DOMAIN_ORDER: RiskDomain[] = [
  "perinatal",
  "motor",
  "speech",
  "communication",
  "sensory",
  "play",
];

const SEVERITY_ORDER: Record<MarkerSeverity, number> = {
  medium: 0,
  high: 1,
  critical: 2,
};

const LEVEL_ORDER: Record<BlockProfile["level"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function looksBrokenText(text?: string) {
  if (!text) return false;
  return (text.match(/[РС][А-Яа-яA-Za-z]/g)?.length ?? 0) >= 3;
}

function simplifyText(text?: string) {
  if (!text) return "";
  if (looksBrokenText(text)) return "";

  const replacements: Array<[string, string]> = [
    ["дифференциации", "уточнения"],
    ["дифференцировать", "точно понять"],
    ["коммуникативный профиль", "общение"],
    ["коммуникативного профиля", "общения"],
    ["сенсомоторной базы", "тела, движения и устойчивости"],
    ["сенсомоторную базу", "тело, движение и устойчивость"],
    ["сенсомоторная база", "тело, движение и устойчивость"],
    ["нейропсихологические гипотезы", "рабочие гипотезы"],
    ["маршрут коррекции", "план работы"],
    ["маршрут занятий", "план занятий"],
  ];

  let next = text.replace(/\s+/g, " ").trim();
  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to);
  }
  return next;
}

function pushUnique(items: string[], value?: string) {
  const normalized = simplifyText(value);
  if (!normalized) return;
  if (!items.includes(normalized)) {
    items.push(normalized);
  }
}

function maxLevel(
  current: BlockProfile["level"],
  next: BlockProfile["level"]
): BlockProfile["level"] {
  return LEVEL_ORDER[next] > LEVEL_ORDER[current] ? next : current;
}

function getSelectedIds(answers: Submission["answers"], questionId: string) {
  const rawValue = answers[questionId] as QuizAnswerValue | undefined;
  if (!rawValue) return [];

  if (questionId === "apgar" && !Array.isArray(rawValue) && rawValue !== "unknown") {
    const match = rawValue.match(/^(\d{1,2})\/(\d{1,2})$/);

    if (match) {
      const first = Number(match[1]);
      const second = Number(match[2]);
      const minScore = Math.min(first, second);

      return [minScore <= 6 ? "0_6" : minScore === 7 ? "7" : "8_10"];
    }
  }

  return Array.isArray(rawValue) ? rawValue : [rawValue];
}

function hasAnswer(
  answers: Submission["answers"],
  questionId: string,
  optionIds: string | string[]
) {
  const selectedIds = getSelectedIds(answers, questionId);
  const expectedIds = Array.isArray(optionIds) ? optionIds : [optionIds];
  return expectedIds.some((optionId) => selectedIds.includes(optionId));
}

function getDomainTitle(domain: RiskDomain) {
  return DOMAIN_TITLES[domain];
}

function createEmptyProfile(domain: RiskDomain): BlockProfile {
  return {
    domain,
    title: DOMAIN_TITLES[domain],
    level: "low",
    summary: "По анкете здесь нет явных рисков, но блок все равно стоит быстро сверить очно.",
    concerns: [],
    evidenceQuestionIds: [],
  };
}

function sortProfiles(blockProfiles: BlockProfile[]) {
  return [...blockProfiles].sort((left, right) => {
    const levelDelta = LEVEL_ORDER[right.level] - LEVEL_ORDER[left.level];
    if (levelDelta !== 0) return levelDelta;
    return DOMAIN_ORDER.indexOf(left.domain) - DOMAIN_ORDER.indexOf(right.domain);
  });
}

function sortMarkers(priorityMarkers: PriorityMarker[]) {
  return [...priorityMarkers].sort((left, right) => {
    const severityDelta = SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity];
    if (severityDelta !== 0) return severityDelta;
    return DOMAIN_ORDER.indexOf(left.domain) - DOMAIN_ORDER.indexOf(right.domain);
  });
}

function createMarker(marker: PriorityMarker): PriorityMarker {
  return {
    ...marker,
    title: simplifyText(marker.title),
    summary: simplifyText(marker.summary),
    evidence: marker.evidence.map((item) => simplifyText(item)).filter(Boolean),
  };
}

function createHypothesis(hypothesis: ClinicalHypothesis): ClinicalHypothesis {
  return {
    ...hypothesis,
    title: simplifyText(hypothesis.title),
    summary: simplifyText(hypothesis.summary),
    evidence: hypothesis.evidence.map((item) => simplifyText(item)).filter(Boolean),
  };
}

function createCheck(item: CheckInPersonItem): CheckInPersonItem {
  return {
    ...item,
    title: simplifyText(item.title),
    reason: simplifyText(item.reason),
  };
}

function createSessionFocus(item: SessionFocusItem): SessionFocusItem {
  return {
    ...item,
    title: simplifyText(item.title),
    description: simplifyText(item.description),
  };
}

function createInSession(item: InSessionRecommendation): InSessionRecommendation {
  return {
    ...item,
    title: simplifyText(item.title),
    goal: simplifyText(item.goal),
    startModule: simplifyText(item.startModule),
    watchFor: simplifyText(item.watchFor),
    useStrengths: simplifyText(item.useStrengths),
    contactStyle: simplifyText(item.contactStyle),
    evidence: item.evidence.map((value) => simplifyText(value)).filter(Boolean),
  };
}

function createTrace(item: RuleTraceEntry): RuleTraceEntry {
  return {
    ...item,
    title: simplifyText(item.title),
    triggeredBy: item.triggeredBy.map((value) => simplifyText(value)).filter(Boolean),
    outputs: item.outputs.map((value) => simplifyText(value)).filter(Boolean),
  };
}

function createProfile(profile: BlockProfile): BlockProfile {
  const concerns = profile.concerns.map((value) => simplifyText(value)).filter(Boolean);

  return {
    ...profile,
    title: simplifyText(profile.title) || DOMAIN_TITLES[profile.domain],
    summary: simplifyText(profile.summary),
    concerns,
  };
}

function summarizeProfile(profile: BlockProfile) {
  if (profile.level === "high") {
    return "Этот блок лучше проверить одним из первых.";
  }

  if (profile.level === "medium") {
    return "Здесь есть сигналы, которые лучше уточнить очно.";
  }

  return "По анкете здесь без явных рисков, но блок стоит быстро сверить очно.";
}

function buildLegacyBlockProfiles(submission: Submission) {
  const result = submission.result as LegacyResult;
  const answers = submission.answers;
  const profiles = new Map<RiskDomain, BlockProfile>(
    DOMAIN_ORDER.map((domain) => [domain, createEmptyProfile(domain)])
  );

  for (const assessment of result.blockAssessments ?? []) {
    if (assessment.blockId === "perinatal") {
      profiles.get("perinatal")!.level = assessment.level;
    }

    if (assessment.blockId === "motor") {
      profiles.get("motor")!.level = assessment.level;
    }

    if (assessment.blockId === "communication") {
      profiles.get("communication")!.level = assessment.level;
      profiles.get("speech")!.level = maxLevel(profiles.get("speech")!.level, assessment.level);
    }
  }

  if (hasAnswer(answers, "fetal_hypoxia", "yes")) {
    profiles.get("perinatal")!.level = maxLevel(profiles.get("perinatal")!.level, "high");
    pushUnique(
      profiles.get("perinatal")!.concerns,
      "В анкете есть указание на гипоксию плода."
    );
  }

  if (
    hasAnswer(answers, "apgar", ["7", "0_6"]) ||
    hasAnswer(answers, "first_cry", ["after_help", "ventilation"])
  ) {
    profiles.get("perinatal")!.level = maxLevel(profiles.get("perinatal")!.level, "high");
    pushUnique(
      profiles.get("perinatal")!.concerns,
      "Старт жизни был с нагрузкой: нужен очный разбор ранней адаптации."
    );
  }

  if (hasAnswer(answers, "pregnancy_course", ["toxicosis", "threat", "infection", "medication", "stress"])) {
    profiles.get("perinatal")!.level = maxLevel(profiles.get("perinatal")!.level, "medium");
    pushUnique(
      profiles.get("perinatal")!.concerns,
      "Во время беременности были факторы риска, которые стоит учесть на приеме."
    );
  }

  if (hasAnswer(answers, "crawling_age", ["late", "none"])) {
    profiles.get("motor")!.level = maxLevel(profiles.get("motor")!.level, "high");
    pushUnique(
      profiles.get("motor")!.concerns,
      "Ползание началось поздно или этот этап был пропущен."
    );
  }

  if (hasAnswer(answers, "crawling_style", ["belly", "unusual", "none"])) {
    profiles.get("motor")!.level = maxLevel(profiles.get("motor")!.level, "high");
    pushUnique(
      profiles.get("motor")!.concerns,
      "Перекрестное ползание не сформировалось типично."
    );
  }

  if (
    hasAnswer(answers, "movement_features", ["tiptoes", "falls", "clumsy", "fine_motor"]) ||
    hasAnswer(answers, "muscle_tone", ["hyper", "hypo", "dystonia"])
  ) {
    profiles.get("motor")!.level = maxLevel(profiles.get("motor")!.level, "medium");
    pushUnique(
      profiles.get("motor")!.concerns,
      "Есть признаки моторной неловкости, тонусных особенностей или трудностей координации."
    );
  }

  if (hasAnswer(answers, "sitting_age", "late") || hasAnswer(answers, "walking_age", "late")) {
    profiles.get("motor")!.level = maxLevel(profiles.get("motor")!.level, "medium");
    pushUnique(
      profiles.get("motor")!.concerns,
      "Некоторые моторные этапы сформировались позже ожидаемого срока."
    );
  }

  if (hasAnswer(answers, "current_speech", ["few_words", "no_words"])) {
    profiles.get("speech")!.level = maxLevel(profiles.get("speech")!.level, "high");
    pushUnique(
      profiles.get("speech")!.concerns,
      "Речевой запас выглядит ниже ожидаемого уровня."
    );
  }

  if (hasAnswer(answers, "current_speech", ["echolalia", "jargon"])) {
    profiles.get("speech")!.level = maxLevel(profiles.get("speech")!.level, "high");
    pushUnique(
      profiles.get("speech")!.concerns,
      "Речь есть, но ее качество и функция требуют очного уточнения."
    );
  }

  if (hasAnswer(answers, "speech_understanding", ["with_gesture", "rarely"])) {
    profiles.get("speech")!.level = maxLevel(profiles.get("speech")!.level, "medium");
    pushUnique(
      profiles.get("speech")!.concerns,
      "Есть трудности понимания речи без дополнительных подсказок."
    );
  }

  if (hasAnswer(answers, "pointing_gesture", "no")) {
    profiles.get("communication")!.level = maxLevel(profiles.get("communication")!.level, "high");
    pushUnique(
      profiles.get("communication")!.concerns,
      "Нет указательного жеста как способа разделить внимание со взрослым."
    );
  }

  if (
    hasAnswer(answers, "eye_contact", ["unstable", "no"]) ||
    hasAnswer(answers, "name_response", ["sometimes", "no"]) ||
    hasAnswer(answers, "shared_attention", ["sometimes", "no"])
  ) {
    profiles.get("communication")!.level = maxLevel(profiles.get("communication")!.level, "medium");
    pushUnique(
      profiles.get("communication")!.concerns,
      "Есть трудности отклика, контакта или совместного внимания."
    );
  }

  if (hasAnswer(answers, "sensory_features", ["sound", "food", "stimming", "clothes"])) {
    profiles.get("sensory")!.level = "medium";
    pushUnique(
      profiles.get("sensory")!.concerns,
      "Сенсорные особенности могут влиять на контакт, поведение и включение в задания."
    );
  }

  if (hasAnswer(answers, "play_patterns", ["manipulative", "repetitive", "alone", "no_imitation"])) {
    profiles.get("play")!.level = "medium";
    pushUnique(
      profiles.get("play")!.concerns,
      "Игра, имитация или гибкость поведения требуют очного наблюдения."
    );
  }

  for (const profile of profiles.values()) {
    profile.summary = summarizeProfile(profile);
  }

  return sortProfiles([...profiles.values()]);
}

function buildLegacyPriorityMarkers(submission: Submission, blockProfiles: BlockProfile[]) {
  const result = submission.result as LegacyResult;
  const markers = new Map<string, PriorityMarker>();

  const addMarker = (marker: PriorityMarker) => {
    if (!markers.has(marker.code)) {
      markers.set(marker.code, marker);
    }
  };

  for (const flag of result.criticalFlags ?? []) {
    const [questionId] = flag.split(":");

    if (questionId === "fetal_hypoxia") {
      addMarker(
        createMarker({
          code: "legacy-hypoxia",
          domain: "perinatal",
          severity: "critical",
          title: "Нужен приоритетный разбор перинатального анамнеза",
          summary: "В анкете есть гипоксия. На первой встрече лучше сразу связать это с текущим состоянием ребенка.",
          evidence: ["В ответах отмечена гипоксия плода."],
        })
      );
    }

    if (questionId === "apgar" || questionId === "first_cry") {
      addMarker(
        createMarker({
          code: "legacy-birth-start",
          domain: "perinatal",
          severity: "critical",
          title: "Старт жизни был с дополнительной нагрузкой",
          summary: "Нужно очно понять, как ранняя адаптация могла повлиять на тонус, регуляцию и выносливость.",
          evidence: ["В ответах есть критический сигнал по Апгар или первому крику."],
        })
      );
    }

    if (questionId === "crawling_age" || questionId === "crawling_style") {
      addMarker(
        createMarker({
          code: "legacy-crawling",
          domain: "motor",
          severity: "critical",
          title: "Моторный фундамент лучше брать в работу сразу",
          summary: "Позднее или нетипичное ползание часто требует начать с тела, движения и координации.",
          evidence: ["В анкете есть критический сигнал по ползанию."],
        })
      );
    }

    if (questionId === "pointing_gesture") {
      addMarker(
        createMarker({
          code: "legacy-pointing",
          domain: "communication",
          severity: "critical",
          title: "Общение нужно разбирать в приоритете",
          summary: "Отсутствие указательного жеста лучше очно проверять вместе с контактом, откликом и пониманием речи.",
          evidence: ["В анкете отмечено отсутствие указательного жеста."],
        })
      );
    }
  }

  for (const profile of blockProfiles.filter((item) => item.level === "high")) {
    addMarker(
      createMarker({
        code: `legacy-domain-${profile.domain}`,
        domain: profile.domain,
        severity: "high",
        title: `${profile.title} требует приоритета`,
        summary:
          profile.concerns[0] ||
          "По этому блоку уже есть выраженные сигналы, и его лучше разбирать одним из первых.",
        evidence: profile.concerns.length > 0 ? profile.concerns : ["Есть выраженные сигналы по анкете."],
      })
    );
  }

  return sortMarkers([...markers.values()]);
}

function buildLegacyHypotheses(blockProfiles: BlockProfile[]) {
  const hypotheses: ClinicalHypothesis[] = [];

  if (blockProfiles.some((item) => item.domain === "perinatal" && item.level !== "low")) {
    hypotheses.push(
      createHypothesis({
        code: "legacy-perinatal",
        title: "Ранняя биологическая нагрузка могла повлиять на темп развития",
        summary: "На приеме важно сопоставить анамнез с текущей регуляцией, тонусом и выносливостью ребенка.",
        evidence: ["В анкете есть перинатальные факторы риска."],
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "motor" && item.level !== "low")) {
    hypotheses.push(
      createHypothesis({
        code: "legacy-motor",
        title: "Опора на тело и координацию может быть незрелой",
        summary: "План занятий лучше начинать с проверки схемы тела, баланса, ритма и моторного планирования.",
        evidence: ["В анкете есть сигналы по моторным этапам."],
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "communication" && item.level !== "low")) {
    hypotheses.push(
      createHypothesis({
        code: "legacy-communication",
        title: "Причину трудностей общения нужно уточнить очно",
        summary: "Важно отделить вклад контакта, понимания речи, инициативы и сенсорной нагрузки.",
        evidence: ["В анкете есть сигналы по общению и отклику."],
      })
    );
  }

  return hypotheses;
}

function buildLegacyChecks(blockProfiles: BlockProfile[]) {
  const checks: CheckInPersonItem[] = [];

  if (blockProfiles.some((item) => item.domain === "perinatal" && item.level !== "low")) {
    checks.push(
      createCheck({
        code: "legacy-check-perinatal",
        title: "Сверить анамнез с текущей регуляцией ребенка",
        reason: "На приеме стоит посмотреть, как ранняя нагрузка могла отразиться на тонусе, поведении и выносливости.",
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "motor" && item.level !== "low")) {
    checks.push(
      createCheck({
        code: "legacy-check-motor",
        title: "Проверить тело, координацию и моторное планирование",
        reason: "Это поможет понять, с чего безопаснее и эффективнее стартовать в коррекционной работе.",
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "communication" && item.level !== "low")) {
    checks.push(
      createCheck({
        code: "legacy-check-communication",
        title: "Прицельно посмотреть на контакт, жест и совместное внимание",
        reason: "Эти наблюдения сразу покажут, как лучше строить взаимодействие и речевые задачи.",
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "speech" && item.level !== "low")) {
    checks.push(
      createCheck({
        code: "legacy-check-speech",
        title: "Сверить понимание речи и качество речевого ответа",
        reason: "Важно понять, чего больше: дефицита понимания, контакта или именно речевой трудности.",
      })
    );
  }

  return checks;
}

function buildLegacySessionFocus(blockProfiles: BlockProfile[]) {
  const focus: SessionFocusItem[] = [];

  if (blockProfiles.some((item) => item.domain === "motor" && item.level !== "low")) {
    focus.push(
      createSessionFocus({
        code: "legacy-focus-motor",
        title: "Начать с тела, движения и устойчивости",
        description: "На первых встречах лучше опираться на баланс, координацию, ритм и перенос нагрузки.",
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "communication" && item.level !== "low")) {
    focus.push(
      createSessionFocus({
        code: "legacy-focus-communication",
        title: "Сначала выстроить контакт и совместное внимание",
        description: "Стабильный контакт и понятная совместная деятельность должны стать опорой для дальнейшей работы.",
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "speech" && item.level !== "low")) {
    focus.push(
      createSessionFocus({
        code: "legacy-focus-speech",
        title: "Речь подключать на готовой базе",
        description: "Речевые задачи лучше усиливать после проверки понимания, контакта и выносливости к нагрузке.",
      })
    );
  }

  return focus;
}

function buildLegacyInSession(blockProfiles: BlockProfile[]) {
  const recommendations: InSessionRecommendation[] = [];

  if (blockProfiles.some((item) => item.domain === "motor" && item.level !== "low")) {
    recommendations.push(
      createInSession({
        code: "legacy-session-motor",
        title: "Работать через крупную моторику и схему тела",
        goal: "Дать ребенку более устойчивую телесную опору для следующих задач.",
        startModule: "Баланс, координация, двусторонние движения и ритм.",
        watchFor: "Утомление, потерю программы действия, асимметрию и трудности переключения.",
        useStrengths: "Использовать интересные ребенку материалы как вход в движение и взаимодействие.",
        contactStyle: "Короткие понятные блоки с постепенным наращиванием сложности.",
        evidence: ["В анкете есть сигналы моторной незрелости."],
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "communication" && item.level !== "low")) {
    recommendations.push(
      createInSession({
        code: "legacy-session-communication",
        title: "Выстраивать контакт через совместную деятельность",
        goal: "Сделать взрослого значимым партнером, а не только источником инструкций.",
        startModule: "Совместное внимание, очередность, взгляд, жест и короткие игровые ритуалы.",
        watchFor: "Уход из контакта, слабую инициативу и опору только на предмет, а не на человека.",
        useStrengths: "Заходить через интерес ребенка и постепенно расширять взаимодействие вокруг него.",
        contactStyle: "Мягкий вход, короткие задачи и минимум перегруза на старте.",
        evidence: ["В анкете есть коммуникативные сигналы."],
      })
    );
  }

  if (blockProfiles.some((item) => item.domain === "speech" && item.level !== "low")) {
    recommendations.push(
      createInSession({
        code: "legacy-session-speech",
        title: "Не форсировать речь с первых минут",
        goal: "Сначала укрепить понимание, контакт и функциональную коммуникацию.",
        startModule: "Понимание инструкции, жестовая поддержка, звукоподражание и простые коммуникативные цепочки.",
        watchFor: "Эхолалию без понимания, отказ от ответа и речевую перегрузку.",
        contactStyle: "Короткая речь взрослого с опорой на действие, предмет и понятный контекст.",
        evidence: ["В анкете есть речевые сигналы."],
      })
    );
  }

  return recommendations;
}

function buildLegacyTrace(
  priorityMarkers: PriorityMarker[],
  clinicalHypotheses: ClinicalHypothesis[],
  sessionFocus: SessionFocusItem[]
) {
  return [
    createTrace({
      code: "legacy-import",
      title: "Вывод собран из архивной анкеты старого формата",
      domain: priorityMarkers[0]?.domain ?? "communication",
      severity: priorityMarkers[0]?.severity ?? "medium",
      triggeredBy:
        priorityMarkers.length > 0
          ? priorityMarkers.map((item) => item.title)
          : ["По анкете видны рабочие сигналы, которые требуют очной расшифровки."],
      outputs: [
        ...clinicalHypotheses.map((item) => item.title),
        ...sessionFocus.map((item) => item.title),
      ],
    }),
  ] satisfies RuleTraceEntry[];
}

function deriveSummary(
  status: QuizResult["status"] | undefined,
  blockProfiles: BlockProfile[],
  priorityMarkers: PriorityMarker[]
) {
  const items: string[] = [];
  const activeProfiles = blockProfiles.filter((item) => item.level !== "low");
  const criticalCount = priorityMarkers.filter((item) => item.severity === "critical").length;

  if (criticalCount > 0) {
    items.push("Есть сигналы, лучше звать на очную встречу без отсрочки.");
  } else if (status === "yellow" || activeProfiles.length > 0) {
    items.push("В анкете есть зоны, которые лучше уточнить на очной встрече.");
  } else {
    items.push("По анкете грубых сигналов не видно, но очная встреча все равно полезна.");
  }

  if (activeProfiles.length > 0) {
    const domains = activeProfiles.slice(0, 3).map((item) => item.title.toLowerCase());
    items.push(`Главное посмотреть: ${domains.join(", ")}.`);
  }

  if (activeProfiles.some((item) => item.domain === "motor" && item.level !== "low")) {
    items.push("Отдельно проверить тело, движение и выносливость.");
  }

  if (activeProfiles.some((item) => item.domain === "communication" && item.level !== "low")) {
    items.push("Отдельно посмотреть на контакт и совместное внимание.");
  }

  if (items.length < 3 && activeProfiles.some((item) => item.domain === "speech" && item.level !== "low")) {
    items.push("Речь смотреть вместе с пониманием инструкции и контактом.");
  }

  return items.slice(0, 4);
}

function deriveConcerns(blockProfiles: BlockProfile[], priorityMarkers: PriorityMarker[]) {
  const items: string[] = [];

  for (const marker of priorityMarkers) {
    pushUnique(items, marker.title);
  }

  for (const profile of blockProfiles.filter((item) => item.level !== "low")) {
    if (profile.concerns.length > 0) {
      for (const concern of profile.concerns.slice(0, 2)) {
        pushUnique(items, concern);
      }
    } else {
      pushUnique(items, `${profile.title}: ${profile.summary}`);
    }
  }

  if (items.length === 0) {
    items.push("По анкете нет явных сигналов, которые требуют срочного внимания.");
  }

  return items.slice(0, 6);
}

function deriveChecks(
  whatToCheckInPerson: CheckInPersonItem[],
  blockProfiles: BlockProfile[],
  priorityMarkers: PriorityMarker[]
) {
  const items: string[] = [];

  for (const check of whatToCheckInPerson) {
    pushUnique(items, check.title);
  }

  if (items.length === 0 && blockProfiles.some((item) => item.domain === "motor" && item.level !== "low")) {
    items.push("Проверить тело, координацию, баланс и моторное планирование.");
  }

  if (
    items.length < 3 &&
    blockProfiles.some((item) => item.domain === "communication" && item.level !== "low")
  ) {
    items.push("Посмотреть на контакт, отклик на имя, жест и совместное внимание.");
  }

  if (items.length < 3 && blockProfiles.some((item) => item.domain === "speech" && item.level !== "low")) {
    items.push("Сверить понимание речи с качеством речевого ответа и инициативы.");
  }

  if (
    items.length < 3 &&
    priorityMarkers.some((item) => item.domain === "perinatal")
  ) {
    items.push("Сопоставить ранний анамнез с текущим состоянием ребенка.");
  }

  if (items.length === 0) {
    items.push("Провести базовое очное наблюдение за контактом, движением и пониманием инструкции.");
  }

  return items.slice(0, 6);
}

function deriveSessionStart(
  sessionFocus: SessionFocusItem[],
  inSessionRecommendations: InSessionRecommendation[],
  blockProfiles: BlockProfile[]
) {
  const items: string[] = [];

  for (const focus of sessionFocus) {
    pushUnique(items, focus.title);
  }

  for (const item of inSessionRecommendations) {
    pushUnique(items, item.title);
    pushUnique(items, `На старте идти через ${item.startModule.toLowerCase()}`);
  }

  if (items.length === 0 && blockProfiles.some((item) => item.domain === "motor" && item.level !== "low")) {
    items.push("Сначала опереться на тело, движение и устойчивость.");
  }

  if (
    items.length < 3 &&
    blockProfiles.some((item) => item.domain === "communication" && item.level !== "low")
  ) {
    items.push("Сначала выстроить контакт, совместное внимание и короткие задания.");
  }

  if (items.length < 3 && blockProfiles.some((item) => item.domain === "speech" && item.level !== "low")) {
    items.push("Речь подключать после контакта и понимания инструкции.");
  }

  if (items.length === 0) {
    items.push("Старт делать через спокойный контакт и короткие задания.");
  }

  return items.slice(0, 6);
}

function normalizeRichResult(submission: Submission, result: LegacyResult) {
  const blockProfiles = sortProfiles((result.blockProfiles ?? []).map(createProfile));
  const priorityMarkers = sortMarkers((result.priorityMarkers ?? []).map(createMarker));
  const clinicalHypotheses = (result.clinicalHypotheses ?? []).map(createHypothesis);
  const whatToCheckInPerson = (result.whatToCheckInPerson ?? []).map(createCheck);
  const contraNotes = (result.contraNotes ?? []).map((item) => simplifyText(item)).filter(Boolean);
  const sessionFocus = (result.sessionFocus ?? []).map(createSessionFocus);
  const inSessionRecommendations = (result.inSessionRecommendations ?? []).map(createInSession);
  const ruleTrace = (result.ruleTrace ?? []).map(createTrace);
  const summary = deriveSummary(result.status, blockProfiles, priorityMarkers);
  const concerns = deriveConcerns(blockProfiles, priorityMarkers);
  const checks = deriveChecks(whatToCheckInPerson, blockProfiles, priorityMarkers);
  const sessionStart = deriveSessionStart(sessionFocus, inSessionRecommendations, blockProfiles);

  const clinicalSummary =
    summary[0] ??
    simplifyText(result.clinicalSummary) ??
    "По анкете есть рабочие сигналы, которые лучше уточнить на очной встрече.";

  return {
    clinicalSummary,
    summary,
    alerts: priorityMarkers.filter((item) => item.severity !== "medium"),
    concerns,
    checks,
    sessionStart,
    blockProfiles,
    priorityMarkers,
    clinicalHypotheses,
    whatToCheckInPerson,
    contraNotes,
    sessionFocus,
    inSessionRecommendations,
    ruleTrace,
  } satisfies NormalizedAdminResult;
}

function normalizeLegacyResult(submission: Submission) {
  const blockProfiles = buildLegacyBlockProfiles(submission);
  const priorityMarkers = buildLegacyPriorityMarkers(submission, blockProfiles);
  const clinicalHypotheses = buildLegacyHypotheses(blockProfiles);
  const whatToCheckInPerson = buildLegacyChecks(blockProfiles);
  const contraNotes = [
    "Не делать окончательных выводов только по анкете без очного наблюдения.",
  ];
  const sessionFocus = buildLegacySessionFocus(blockProfiles);
  const inSessionRecommendations = buildLegacyInSession(blockProfiles);
  const ruleTrace = buildLegacyTrace(priorityMarkers, clinicalHypotheses, sessionFocus);
  const summary = deriveSummary(submission.result.status, blockProfiles, priorityMarkers);
  const concerns = deriveConcerns(blockProfiles, priorityMarkers);
  const checks = deriveChecks(whatToCheckInPerson, blockProfiles, priorityMarkers);
  const sessionStart = deriveSessionStart(sessionFocus, inSessionRecommendations, blockProfiles);

  return {
    clinicalSummary: summary[0],
    summary,
    alerts: priorityMarkers.filter((item) => item.severity !== "medium"),
    concerns,
    checks,
    sessionStart,
    blockProfiles,
    priorityMarkers,
    clinicalHypotheses,
    whatToCheckInPerson,
    contraNotes,
    sessionFocus,
    inSessionRecommendations,
    ruleTrace,
  } satisfies NormalizedAdminResult;
}

export function normalizeAdminResult(submission: Submission): NormalizedAdminResult {
  const result = submission.result as LegacyResult;
  const canUseRichResult =
    Boolean(result.reportVersion) &&
    (result.blockProfiles?.length ?? 0) > 0 &&
    (result.priorityMarkers?.length ?? 0) >= 0 &&
    !looksBrokenText(result.clinicalSummary);

  return canUseRichResult ? normalizeRichResult(submission, result) : normalizeLegacyResult(submission);
}
