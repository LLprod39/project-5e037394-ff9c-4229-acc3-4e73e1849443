const t = (ru, kz) => ({ ru, kz });

const option = (id, ru, kz, meta = {}) => ({
  id,
  label: t(ru, kz),
  deviation: false,
  critical: false,
  exclusive: false,
  hintCodes: [],
  ...meta,
});

export const questionBlocks = [
  {
    id: "perinatal",
    title: t("Беременность и роды", "Жүктілік және босану"),
    shortTitle: t("Беременность и роды", "Жүктілік және босану"),
    description: t(
      "Анамнез беременности, родов и первых дней жизни",
      "Жүктілік, босану және өмірдің алғашқы күндері туралы анамнез"
    ),
  },
  {
    id: "motor",
    title: t("Моторика", "Моторика"),
    shortTitle: t("Моторика", "Моторика"),
    description: t(
      "Ключевые этапы физического и моторного развития в первый год жизни",
      "Өмірдің алғашқы жылындағы негізгі қимыл-қозғалыс кезеңдері"
    ),
  },
  {
    id: "communication",
    title: t("Коммуникация", "Коммуникация"),
    shortTitle: t("Коммуникация", "Коммуникация"),
    description: t(
      "Речь, понимание, коммуникация, игра и особенности поведения",
      "Сөйлеу, түсіну, коммуникация, ойын және мінез-құлық ерекшеліктері"
    ),
  },
];

export const questions = [
  {
    id: "pregnancy_complications",
    blockId: "perinatal",
    text: t("Как протекала беременность?", "Жүктілік қалай өтті?"),
    helperText: t("Можно выбрать несколько вариантов.", "Бірнеше нұсқаны таңдауға болады."),
    type: "multiple",
    options: [
      option("none", "Без осложнений", "Асқынусыз", { exclusive: true }),
      option("toxicosis", "Сильный токсикоз", "Қатты токсикоз", { deviation: true }),
      option("miscarriage", "Угроза прерывания", "Үзілу қаупі", { deviation: true }),
      option("infection", "Инфекционные заболевания", "Жұқпалы аурулар", { deviation: true }),
      option("medications", "Прием сильных лекарств", "Күшті дәрілер қабылдау", { deviation: true }),
      option("stress", "Сильный стресс", "Қатты стресс", { deviation: true }),
    ],
  },
  {
    id: "fetal_hypoxia",
    blockId: "perinatal",
    text: t(
      "Была ли во время беременности диагностирована гипоксия плода?",
      "Жүктілік кезінде ұрық гипоксиясы анықталды ма?"
    ),
    type: "single",
    options: [
      option("yes", "Да", "Иә", {
        deviation: true,
        critical: true,
        hintCodes: ["check-neurology"],
      }),
      option("no", "Нет", "Жоқ"),
      option("unknown", "Не знаю / не ставили", "Білмеймін / қойылмаған"),
    ],
  },
  {
    id: "birth_week",
    blockId: "perinatal",
    text: t("На какой неделе произошли роды?", "Босану қай аптада болды?"),
    type: "single",
    options: [
      option("preterm", "До 36 недели", "36 аптаға дейін", {
        deviation: true,
        hintCodes: ["preterm-history"],
      }),
      option("term", "37-41 неделя", "37-41 апта"),
      option("postterm", "42 недели и позже", "42 апта және кейін", {
        deviation: true,
        hintCodes: ["postterm-history"],
      }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "delivery_type",
    blockId: "perinatal",
    text: t("Тип родоразрешения", "Босандыру түрі"),
    type: "single",
    options: [
      option("natural", "Естественные роды", "Табиғи босану"),
      option("planned_c_section", "Плановое кесарево", "Жоспарлы кесар тілігі", {
        deviation: true,
      }),
      option("emergency_c_section", "Экстренное кесарево", "Шұғыл кесар тілігі", {
        deviation: true,
      }),
      option("vacuum_extraction", "Вакуум-экстракция", "Вакуум-экстракция", {
        deviation: true,
        hintCodes: ["birth-trauma-risk"],
      }),
    ],
  },
  {
    id: "labor_features",
    blockId: "perinatal",
    text: t("Особенности протекания родов", "Босанудың ерекшеліктері"),
    helperText: t("Можно выбрать несколько вариантов.", "Бірнеше нұсқаны таңдауға болады."),
    type: "multiple",
    options: [
      option("none", "Без особенностей", "Ерекшелік болмады", { exclusive: true }),
      option("fast", "Стремительные роды", "Тым жылдам босану", { deviation: true }),
      option("long", "Затяжные роды", "Ұзаққа созылған босану", { deviation: true }),
      option("stimulation", "Стимуляция", "Стимуляция", { deviation: true }),
      option("forceps", "Щипцы / вакуум / выдавливание", "Қысқыш / вакуум / қысыммен шығару", {
        deviation: true,
        hintCodes: ["birth-trauma-risk"],
      }),
      option("cord", "Тугое обвитие пуповиной", "Кіндікке тығыз оралу", { deviation: true }),
    ],
  },
  {
    id: "first_cry",
    blockId: "perinatal",
    text: t("Закричал ли ребенок сразу?", "Бала бірден жылады ма?"),
    illustration: "ivl",
    type: "single",
    options: [
      option("yes", "Да, сразу", "Иә, бірден"),
      option("after_help", "Нет, после манипуляций врачей", "Жоқ, дәрігер көмегінен кейін", {
        deviation: true,
      }),
      option("ventilation", "Был на ИВЛ", "ЖӨЖ-де болды", {
        deviation: true,
        critical: true,
        hintCodes: ["check-cervical-spine"],
      }),
    ],
  },
  {
    id: "apgar",
    blockId: "perinatal",
    text: t("Оценка по шкале Апгар", "Апгар шкаласы бойынша бағасы"),
    helperText: t(
      "Введите только цифры, а / подставится сам. Например: 89 -> 8/9, 108 -> 10/8.",
      "Тек сандарды енгізіңіз, / өзі қойылады. Мысалы: 89 -> 8/9, 108 -> 10/8."
    ),
    type: "single",
    customInput: {
      kind: "apgar",
      inputLabel: t("Введите баллы", "Баллды енгізіңіз"),
      placeholder: t("_/_", "_/_"),
    },
    options: [
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "birth_weight",
    blockId: "perinatal",
    text: t("Вес ребенка при рождении", "Туған кездегі салмағы"),
    type: "single",
    options: [
      option("under_2500", "До 2500 г", "2500 г дейін", {
        deviation: true,
        hintCodes: ["birth-weight-outlier"],
      }),
      option("normal", "2500-4000 г", "2500-4000 г"),
      option("over_4000", "Более 4000 г", "4000 г жоғары", {
        deviation: true,
        hintCodes: ["birth-weight-outlier"],
      }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "jaundice",
    blockId: "perinatal",
    text: t(
      "Была ли затяжная желтушка новорожденных?",
      "Ұзаққа созылған жаңа туғандар сарғаюы болды ма?"
    ),
    type: "single",
    options: [
      option("yes", "Да", "Иә", { deviation: true }),
      option("no", "Нет", "Жоқ"),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "discharge_timing",
    blockId: "perinatal",
    text: t("Когда вас выписали из роддома?", "Перзентханадан қашан шықтыңыздар?"),
    type: "single",
    options: [
      option("normal", "На 3-5 сутки", "3-5 тәулікте"),
      option("late", "Позже из-за состояния", "Жағдайға байланысты кешірек", { deviation: true }),
    ],
  },
  {
    id: "head_control",
    blockId: "motor",
    text: t("Во сколько ребенок начал уверенно держать голову?", "Бала басын қашан нық ұстай бастады?"),
    type: "single",
    options: [
      option("early", "Раньше 1.5 месяцев", "1.5 айдан ерте", {
        deviation: true,
        hintCodes: ["tone-check"],
      }),
      option("normal", "2-3 месяца", "2-3 ай"),
      option("late", "Позже 3.5-4 месяцев", "3.5-4 айдан кеш", { deviation: true }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "roll_over",
    blockId: "motor",
    text: t("Когда ребенок начал переворачиваться?", "Бала қашан аударыла бастады?"),
    type: "single",
    options: [
      option("early", "Ранее 4 месяцев", "4 айдан ерте"),
      option("normal", "4-6 месяцев", "4-6 ай"),
      option("late", "Позже 7 месяцев", "7 айдан кеш", { deviation: true }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "crawling_age",
    blockId: "motor",
    text: t("Во сколько месяцев ребенок начал ползать?", "Бала қашан еңбектей бастады?"),
    type: "single",
    options: [
      option("normal", "6-9 месяцев", "6-9 ай"),
      option("late", "10 месяцев и позже", "10 айдан кейін", {
        deviation: true,
        critical: true,
        hintCodes: ["late-crawling"],
      }),
      option("none", "Не ползал", "Еңбектемеген", {
        deviation: true,
        critical: true,
        hintCodes: ["cross-crawl-missed"],
      }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "crawling_style",
    blockId: "motor",
    text: t("Как ребенок ползал?", "Бала қалай еңбектеді?"),
    illustration: "crawling",
    type: "single",
    options: [
      option("cross", "На четвереньках, перекрестно", "Төрт тағандап, айқас қимылмен"),
      option("belly", "По-пластунски", "Ішімен сырғып", { deviation: true }),
      option("unusual", "Необычно / асимметрично", "Әдеттен тыс / асимметриямен", {
        deviation: true,
        critical: true,
        hintCodes: ["cross-crawl-missed"],
      }),
      option("none", "Не ползал совсем", "Мүлде еңбектемеген", {
        deviation: true,
        critical: true,
        hintCodes: ["cross-crawl-missed"],
      }),
    ],
  },
  {
    id: "sitting_age",
    blockId: "motor",
    text: t("Во сколько месяцев ребенок сел самостоятельно?", "Бала қашан өздігінен отырды?"),
    type: "single",
    options: [
      option("normal", "6-8 месяцев", "6-8 ай"),
      option("late", "Позже 9 месяцев", "9 айдан кеш", { deviation: true }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "walking_age",
    blockId: "motor",
    text: t("Во сколько месяцев ребенок начал ходить?", "Бала қашан жүре бастады?"),
    type: "single",
    options: [
      option("normal", "10-13 месяцев", "10-13 ай"),
      option("borderline", "14-15 месяцев", "14-15 ай", { deviation: true }),
      option("late", "Позже 15 месяцев", "15 айдан кеш", { deviation: true }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "muscle_tone",
    blockId: "motor",
    text: t("Ставили ли врачи диагноз по мышечному тонусу?", "Бұлшықет тонусы бойынша диагноз қойылды ма?"),
    type: "single",
    options: [
      option("normal", "Нет, все было в норме", "Жоқ, бәрі қалыпты болды"),
      option("hyper", "Гипертонус", "Гипертонус", { deviation: true, hintCodes: ["tone-check"] }),
      option("hypo", "Гипотонус", "Гипотонус", { deviation: true, hintCodes: ["tone-check"] }),
      option("dystonia", "Дистония", "Дистония", { deviation: true, hintCodes: ["tone-check"] }),
      option("unknown", "Не помню", "Есімде жоқ"),
    ],
  },
  {
    id: "movement_features",
    blockId: "motor",
    text: t("Замечали ли вы особенности движений?", "Қозғалыс ерекшеліктерін байқадыңыз ба?"),
    helperText: t("Можно выбрать несколько вариантов.", "Бірнеше нұсқаны таңдауға болады."),
    type: "multiple",
    options: [
      option("none", "Нет", "Жоқ", { exclusive: true }),
      option("tiptoes", "Хождение на цыпочках", "Ұшымен жүру", {
        deviation: true,
        hintCodes: ["motor-planning"],
      }),
      option("falls", "Частые падения", "Жиі құлау", {
        deviation: true,
        hintCodes: ["motor-planning"],
      }),
      option("clumsy", "Неловкость", "Ебедейсіздік", {
        deviation: true,
        hintCodes: ["motor-planning"],
      }),
      option("fine_motor", "Трудности с мелкой моторикой", "Ұсақ моторика қиындығы", {
        deviation: true,
        hintCodes: ["fine-motor-support"],
      }),
    ],
  },
  {
    id: "pre_speech",
    blockId: "communication",
    text: t("Как ребенок развивался до года?", "Бала бір жасқа дейін қалай дамыды?"),
    type: "single",
    options: [
      option("normal", "Гуление и лепет были в норме", "Былдырлау мен былдыр сөздері қалыпты болды", {
        exclusive: true,
      }),
      option("pause", "Было затишье", "Дыбыстар біраз уақыт тоқтады", { deviation: true }),
      option("quiet", "Звуков почти не было", "Дыбыс аз болды", { deviation: true }),
    ],
  },
  {
    id: "speech_understanding",
    blockId: "communication",
    text: t(
      "Выполняет ли ребенок простые просьбы без жестов?",
      "Бала ымсыз қарапайым өтініштерді орындай ма?"
    ),
    type: "single",
    options: [
      option("yes", "Да, выполняет", "Иә, орындайды"),
      option("with_gesture", "Только если показываю жестом", "Тек ишарамен көрсетсем", {
        deviation: true,
      }),
      option("rarely", "Почти не реагирует", "Дерлік жауап бермейді", { deviation: true }),
    ],
  },
  {
    id: "current_speech",
    blockId: "communication",
    text: t("Что сейчас есть в речи ребенка?", "Қазір баланың сөйлеуінде не бар?"),
    helperText: t("Можно выбрать несколько вариантов.", "Бірнеше нұсқаны таңдауға болады."),
    type: "multiple",
    options: [
      option("few_words", "Есть только отдельные слова", "Тек жеке сөздер бар", { deviation: true }),
      option("no_words", "Нет даже отдельных слов", "Жеке сөздер де жоқ", { deviation: true }),
      option("phrase", "Есть фразовая речь", "Сөз тіркестері бар"),
      option("echolalia", "Есть эхолалия", "Эхолалия бар", {
        deviation: true,
        hintCodes: ["communication-review"],
      }),
      option("jargon", "Есть свой непонятный язык", "Өзіне ғана түсінікті тілі бар", {
        deviation: true,
        hintCodes: ["communication-review"],
      }),
    ],
  },
  {
    id: "pointing_gesture",
    blockId: "communication",
    text: t(
      "Показывает пальцем на что-то, чтобы вы тоже заметили?",
      "Сіз де байқауыңыз үшін бір затқа саусағымен нұсқай ма?"
    ),
    helperText: t("Не путать с просьбой 'дай'.", "'бер' деген өтінішпен шатастырмаңыз."),
    illustration: "pointing",
    type: "single",
    options: [
      option("yes", "Да", "Иә"),
      option("no", "Нет", "Жоқ", {
        deviation: true,
        critical: true,
        hintCodes: ["asd-marker"],
      }),
    ],
  },
  {
    id: "eye_contact",
    blockId: "communication",
    text: t("Смотрит ли ребенок в глаза при общении?", "Қарым-қатынаста көзге қарай ма?"),
    type: "single",
    options: [
      option("yes", "Да", "Иә"),
      option("unstable", "Нестабильно", "Тұрақсыз", { deviation: true }),
      option("no", "Нет", "Жоқ", {
        deviation: true,
        hintCodes: ["asd-marker"],
      }),
    ],
  },
  {
    id: "name_response",
    blockId: "communication",
    text: t("Откликается ли ребенок на имя?", "Бала есіміне жауап бере ме?"),
    type: "single",
    options: [
      option("yes", "Да", "Иә"),
      option("sometimes", "Через раз", "Кейде ғана", { deviation: true }),
      option("no", "Почти не откликается", "Дерлік жауап бермейді", {
        deviation: true,
        hintCodes: ["asd-marker"],
      }),
    ],
  },
  {
    id: "shared_attention",
    blockId: "communication",
    text: t(
      "Приносит ли ребенок игрушку, чтобы просто показать вам?",
      "Бала ойыншықты тек көрсету үшін әкеле ме?"
    ),
    illustration: "shared-attention",
    type: "single",
    options: [
      option("yes", "Да", "Иә"),
      option("rarely", "Редко", "Сирек", { deviation: true }),
      option("no", "Нет", "Жоқ", { deviation: true, hintCodes: ["shared-attention-risk"] }),
    ],
  },
  {
    id: "play_patterns",
    blockId: "communication",
    text: t("Как ребенок играет?", "Бала қалай ойнайды?"),
    helperText: t("Можно выбрать несколько вариантов.", "Бірнеше нұсқаны таңдауға болады."),
    type: "multiple",
    options: [
      option("functional", "Использует игрушки по назначению", "Ойыншықты мақсатына сай қолданады", {
        exclusive: true,
      }),
      option("story_play", "Сюжетная игра", "Сюжетті ойын"),
      option(
        "manipulative",
        "Манипулятивная игра (бросает игрушки, стучит ими, облизывает или грызет их)",
        "Манипулятивті ойын (ойыншықтарды лақтырады, соғады, жалайды немесе тістейді)",
        {
          deviation: true,
          hintCodes: ["play-patterns"],
        }
      ),
      option("repetitive", "Игры однообразные", "Ойындары бірсарынды", {
        deviation: true,
        hintCodes: ["play-patterns"],
      }),
      option("alone", "Играет только один", "Тек жалғыз ойнайды", {
        deviation: true,
        hintCodes: ["play-patterns"],
      }),
      option("no_imitation", "Нет имитации", "Еліктеу жоқ", {
        deviation: true,
        hintCodes: ["play-patterns"],
      }),
    ],
  },
  {
    id: "sensory_features",
    blockId: "communication",
    text: t("Замечали ли вы особенности в поведении?", "Сіз мінез-құлықта ерекшеліктерді байқадыңыз ба?"),
    helperText: t(
      "Опишите любые особенности в поведении или общении ребёнка, которые вы замечали.",
      "Баланың мінез-құлқы немесе қарым-қатынасындағы байқаған кез келген ерекшеліктерді сипаттаңыз."
    ),
    type: "single",
    customInput: {
      kind: "free_text",
      inputLabel: t("Ваш комментарий", "Сіздің пікіріңіз"),
      placeholder: t("Напишите своими словами", "Өз сөзіңізбен жазыңыз"),
      multiline: true,
    },
    options: [],
  },
];

const playPatternsQuestion = questions.find((question) => question.id === "play_patterns");
const functionalPlayOption = playPatternsQuestion?.options.find((option) => option.id === "functional");

if (functionalPlayOption) {
  functionalPlayOption.exclusive = false;
}

export const questionsById = Object.fromEntries(questions.map((question) => [question.id, question]));

export const questionsByBlock = questionBlocks.reduce((accumulator, block) => {
  accumulator[block.id] = questions.filter((question) => question.blockId === block.id);
  return accumulator;
}, {});

export default {
  questionBlocks,
  questions,
  questionsById,
  questionsByBlock,
};
