import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, LoaderCircle, LockKeyhole, PhoneCall, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import QuestionCard from "@/components/QuestionCard";
import PublicControls from "@/components/PublicControls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getQuestionsByBlock, questionBlocks, questionsById } from "@/data/questionsConfig";
import { useLocale } from "@/lib/i18n";
import { createSubmission } from "@/lib/submissions-api";
import { CreateSubmissionResponse, Question, QuizAnswerValue, QuizAnswers, SubmissionInput, UserInfo } from "@/types/quiz";

type Phase = "userInfo" | "questions";

const DRAFT_KEY = "umay-quiz-draft-v2";

function isAnswered(value: QuizAnswerValue | undefined) {
  if (!value) return false;
  return Array.isArray(value) ? value.length > 0 : value.trim().length > 0;
}

function normalizeApgarInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (!digits) return "";

  if (digits.startsWith("10")) {
    if (digits.length === 1) return "1";
    if (digits.length === 2) return "10/";
    return `10/${digits.slice(2, 4)}`;
  }

  if (digits.length === 1) {
    return `${digits}/`;
  }

  return `${digits.slice(0, 1)}/${digits.slice(1, 3)}`;
}

function isValidApgarAnswer(value: QuizAnswerValue | undefined) {
  if (!value || Array.isArray(value)) return false;
  if (value === "unknown") return true;

  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return false;

  const first = Number(match[1]);
  const second = Number(match[2]);

  return Number.isInteger(first) && Number.isInteger(second) && first >= 0 && first <= 10 && second >= 0 && second <= 10;
}

function isQuestionAnswered(question: Question, value: QuizAnswerValue | undefined) {
  if (question.customInput?.kind === "apgar") {
    return isValidApgarAnswer(value);
  }

  if (question.customInput?.kind === "free_text") {
    return typeof value === "string" && value.trim().length > 0;
  }

  return isAnswered(value);
}

function getSelectedIds(value: QuizAnswerValue | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getCurrentQuestionNumber(currentBlockIndex: number, currentQuestionIndex: number) {
  return (
    questionBlocks
      .slice(0, currentBlockIndex)
      .reduce((sum, block) => sum + getQuestionsByBlock(block.id).length, 0) +
    currentQuestionIndex +
    1
  );
}

export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { locale, t } = useLocale();
  const draftFromStorage =
    typeof window !== "undefined" ? window.localStorage.getItem(DRAFT_KEY) : null;
  const parsedDraft = draftFromStorage ? JSON.parse(draftFromStorage) : null;

  const [phase, setPhase] = useState<Phase>(parsedDraft?.phase || "userInfo");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    childName: parsedDraft?.userInfo?.childName || "",
    birthDate: parsedDraft?.userInfo?.birthDate || "",
    ageNote: parsedDraft?.userInfo?.ageNote || "",
    parentName: parsedDraft?.userInfo?.parentName || "",
    phone: parsedDraft?.userInfo?.phone || "",
    consentGiven:
      parsedDraft?.userInfo?.consentGiven ||
      Boolean(location.state?.prefillConsent),
  });
  const [answers, setAnswers] = useState<QuizAnswers>(parsedDraft?.answers || {});
  const [currentBlockIndex, setCurrentBlockIndex] = useState(parsedDraft?.currentBlockIndex || 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(parsedDraft?.currentQuestionIndex || 0);
  const [draftNoticeShown, setDraftNoticeShown] = useState(false);

  useEffect(() => {
    if (parsedDraft && !draftNoticeShown) {
      toast.success(t({ ru: "Черновик восстановлен", kz: "Қаралама қалпына келтірілді" }));
      setDraftNoticeShown(true);
    }
  }, [draftNoticeShown, parsedDraft, t]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        phase,
        userInfo,
        answers,
        currentBlockIndex,
        currentQuestionIndex,
      })
    );
  }, [phase, userInfo, answers, currentBlockIndex, currentQuestionIndex]);

  const createSubmissionMutation = useMutation({
    mutationFn: (payload: SubmissionInput) => createSubmission(payload),
    onSuccess: (submission: CreateSubmissionResponse) => {
      window.localStorage.removeItem(DRAFT_KEY);
      queryClient.setQueryData(["public-submission", submission.id, submission.publicToken], submission);
      navigate(`/result/${submission.id}?token=${submission.publicToken}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t({ ru: "Не удалось отправить анкету.", kz: "Анкетаны жіберу мүмкін болмады." }));
    },
  });

  const totalQuestions = useMemo(() => questionBlocks.reduce((sum, block) => sum + getQuestionsByBlock(block.id).length, 0), []);
  const currentBlock = questionBlocks[currentBlockIndex];
  const blockQuestions = useMemo(() => (currentBlock ? getQuestionsByBlock(currentBlock.id) : []), [currentBlock]);
  const currentQuestion = blockQuestions[currentQuestionIndex];
  const answeredQuestionsCount = questionsById
    ? Object.entries(answers).filter(([questionId, answer]) => {
        const question = questionsById[questionId];
        return question ? isQuestionAnswered(question, answer) : isAnswered(answer);
      }).length
    : 0;
  const isLastQuestion =
    currentBlockIndex === questionBlocks.length - 1 &&
    currentQuestionIndex === blockQuestions.length - 1;
  const currentQuestionNumber = getCurrentQuestionNumber(currentBlockIndex, currentQuestionIndex);
  const isCurrentQuestionAnswered = currentQuestion
    ? isQuestionAnswered(currentQuestion, answers[currentQuestion.id])
    : false;
  const isUserInfoValid =
    userInfo.childName.trim().length > 0 &&
    userInfo.birthDate.trim().length > 0 &&
    userInfo.parentName.trim().length > 0 &&
    userInfo.phone.trim().length >= 6 &&
    userInfo.consentGiven;

  const handleBack = () => {
    if (phase === "userInfo") {
      navigate("/");
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((value) => value - 1);
      return;
    }

    if (currentBlockIndex > 0) {
      const previousBlockIndex = currentBlockIndex - 1;
      const previousBlockQuestions = getQuestionsByBlock(questionBlocks[previousBlockIndex].id);
      setCurrentBlockIndex(previousBlockIndex);
      setCurrentQuestionIndex(previousBlockQuestions.length - 1);
      return;
    }

    setPhase("userInfo");
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (currentQuestionIndex < blockQuestions.length - 1) {
      setCurrentQuestionIndex((value) => value + 1);
      return;
    }

    if (currentBlockIndex < questionBlocks.length - 1) {
      setCurrentBlockIndex((value) => value + 1);
      setCurrentQuestionIndex(0);
      return;
    }

    createSubmissionMutation.mutate({
      locale,
      userInfo,
      answers,
    });
  };

  const handleToggleOption = (question: Question, optionId: string) => {
    const option = question.options.find((item) => item.id === optionId);

    if (!option) return;

    setAnswers((previous) => {
      const currentValue = previous[question.id];
      const selectedIds = getSelectedIds(currentValue);

      if (question.type === "single") {
        return {
          ...previous,
          [question.id]: optionId,
        };
      }

      if (option.exclusive) {
        return {
          ...previous,
          [question.id]: [optionId],
        };
      }

      const exclusiveIds = question.options.filter((item) => item.exclusive).map((item) => item.id);
      const filteredSelected = selectedIds.filter((id) => !exclusiveIds.includes(id));
      const nextSelected = filteredSelected.includes(optionId)
        ? filteredSelected.filter((id) => id !== optionId)
        : [...filteredSelected, optionId];

      return {
        ...previous,
        [question.id]: nextSelected,
      };
    });
  };

  const handleCustomInputChange = (question: Question, value: string) => {
    if (!question.customInput) return;

    const normalizedValue =
      question.customInput.kind === "apgar" ? normalizeApgarInput(value) : value;

    setAnswers((previous) => ({
      ...previous,
      [question.id]: normalizedValue,
    }));
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,253,249,1),rgba(247,243,238,1))] dark:bg-[linear-gradient(180deg,rgba(17,22,31,1),rgba(12,18,25,1))]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-foreground shadow-sm dark:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-black text-foreground">{t({ ru: "Онлайн-тест Umay Kids", kz: "Umay Kids онлайн тесті" })}</p>
            <p className="text-xs text-muted-foreground">
              {phase === "userInfo"
                ? t({ ru: "Сначала сохраним данные анкеты", kz: "Алдымен анкетаның деректерін сақтаймыз" })
                : `${currentQuestionNumber} / ${totalQuestions}`}
            </p>
          </div>
          <PublicControls compact />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {phase === "userInfo" ? (
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="glass-card-strong p-6">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-foreground">
                    {t({ ru: "Личные данные", kz: "Жеке деректер" })}
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {t({ ru: "Заполните информацию для связи по результатам теста.", kz: "Тест нәтижелері бойынша байланысу үшін ақпаратты толтырыңыз." })}
                  </p>
                </div>
              </div>

              <div className="glass-card-strong space-y-4 p-6">
                <Field
                  label={t({ ru: "Имя ребенка", kz: "Баланың аты" })}
                  value={userInfo.childName}
                  onChange={(value) => setUserInfo((previous) => ({ ...previous, childName: value }))}
                  placeholder={t({ ru: "Например, Амина", kz: "Мысалы, Амина" })}
                />
                <Field
                  label={t({ ru: "Дата рождения", kz: "Туған күні" })}
                  value={userInfo.birthDate}
                  onChange={(value) => setUserInfo((previous) => ({ ...previous, birthDate: value }))}
                  type="date"
                />
                <Field
                  label={t({ ru: "Имя родителя", kz: "Ата-ананың аты" })}
                  value={userInfo.parentName}
                  onChange={(value) => setUserInfo((previous) => ({ ...previous, parentName: value }))}
                  placeholder={t({ ru: "Ваше имя", kz: "Атыңыз" })}
                />
                <Field
                  label={t({ ru: "Телефон", kz: "Телефон" })}
                  value={userInfo.phone}
                  onChange={(value) => setUserInfo((previous) => ({ ...previous, phone: value }))}
                  placeholder="+7 747 754 97 93"
                  type="tel"
                  error={
                    userInfo.phone.trim().length > 0 && userInfo.phone.trim().length < 6
                      ? t({ ru: "Минимум 6 символов", kz: "Кем дегенде 6 таңба" })
                      : undefined
                  }
                />

                <label className="flex items-start gap-3 rounded-[1.5rem] bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
                  <Checkbox
                    checked={userInfo.consentGiven}
                    onCheckedChange={(checked) =>
                      setUserInfo((previous) => ({ ...previous, consentGiven: checked === true }))
                    }
                    className="mt-1"
                  />
                  <span>
                    {t({
                      ru: "Я даю согласие на обработку персональных данных.",
                      kz: "Жеке деректерді өңдеуге келісім беремін.",
                    })}
                  </span>
                </label>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={!isUserInfoValid}
                  onClick={() => setPhase("questions")}
                >
                  {t({ ru: "Перейти к вопросам", kz: "Сұрақтарға өту" })}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

              <div className="glass-card-strong space-y-5 p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-primary/12 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-foreground">
                    {t({ ru: "Важные детали", kz: "Маңызды мәліметтер" })}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {t({
                      ru: "Если вы отвлечетесь или закроете страницу, ответы не пропадут: мы сохраним черновик прямо на этом устройстве.",
                      kz: "Егер алаңдап қалсаңыз немесе бетті жапсаңыз, жауаптар жоғалмайды: біз қараламаны осы құрылғыда сақтаймыз.",
                    })}
                  </p>
                </div>

                <div className="space-y-3">
                  {[{
                    icon: CalendarDays,
                    title: t({ ru: "Дата рождения", kz: "Туған күні" }),
                    text: t({ ru: "Необходима для корректного анализа возрастных этапов.", kz: "Жас ерекшеліктерін дұрыс талдау үшін қажет." }),
                  }, {
                    icon: PhoneCall,
                    title: t({ ru: "Контакт родителя", kz: "Ата-ана байланысы" }),
                    text: t({ ru: "Нужен только для связи после результата.", kz: "Нәтижеден кейін байланысу үшін ғана қажет." }),
                  }, {
                    icon: LockKeyhole,
                    title: t({ ru: "Конфиденциально", kz: "Құпия түрде" }),
                    text: t({ ru: "Данные используются для анкеты и записи в центр.", kz: "Деректер анкета мен орталыққа жазылу үшін пайдаланылады." }),
                  }].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-[1.25rem] bg-muted/65 p-4">
                        <div className="flex items-start gap-3">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-primary dark:bg-white/5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{item.title}</p>
                            <p className="mt-1 text-[0.8rem] leading-5 text-muted-foreground">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="space-y-4">
                {currentQuestion ? (
                  <QuestionCard
                    question={currentQuestion}
                    selectedOptions={getSelectedIds(answers[currentQuestion.id])}
                    answerValue={answers[currentQuestion.id]}
                    onToggle={(optionId) => handleToggleOption(currentQuestion, optionId)}
                    onCustomInputChange={(value) => handleCustomInputChange(currentQuestion, value)}
                  />
                ) : null}

                <div className="sticky bottom-0 z-20 rounded-[1.75rem] border border-white/70 bg-white/80 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-black/20">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" size="lg" onClick={handleBack} className="sm:flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t({ ru: "Назад", kz: "Артқа" })}
                    </Button>
                    <Button
                      size="lg"
                      className="sm:flex-[1.4]"
                      disabled={!isCurrentQuestionAnswered || createSubmissionMutation.isPending}
                      onClick={handleNext}
                    >
                      {createSubmissionMutation.isPending ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          {t({ ru: "Сохраняем...", kz: "Сақталуда..." })}
                        </>
                      ) : isLastQuestion ? (
                        t({ ru: "Завершить тест", kz: "Тесті аяқтау" })
                      ) : (
                        <>
                          {t({ ru: "Следующий вопрос", kz: "Келесі сұрақ" })}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <Input 
        type={type} 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        placeholder={placeholder} 
        className={error ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}
      />
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  );
}
