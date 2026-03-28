import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  LockKeyhole,
  PhoneCall,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import QuestionCard from "@/components/QuestionCard";
import StepProgress from "@/components/StepProgress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getQuestionsByBlock, questionBlocks } from "@/data/questionsConfig";
import { createSubmission } from "@/lib/submissions-api";
import { QuizAnswers, Submission, SubmissionInput, UserInfo } from "@/types/quiz";

type Phase = "userInfo" | "questions";

const intakeCards = [
  { icon: UserRound, title: "Имя ребёнка", text: "Чтобы анкета не потерялась и администратор сразу видел, о ком речь." },
  { icon: PhoneCall, title: "Контакт родителя", text: "Чтобы после теста можно было связаться и предложить следующий шаг." },
  { icon: LockKeyhole, title: "Конфиденциально", text: "Данные используются только для сохранения анкеты." },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("userInfo");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    childName: "",
    childAge: "",
    parentName: "",
    phone: "",
    consentGiven: false,
  });
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const createSubmissionMutation = useMutation({
    mutationFn: (payload: SubmissionInput) => createSubmission(payload),
    onSuccess: (submission) => {
      queryClient.setQueryData(["submission", submission.id], submission);
      queryClient.setQueryData(["submissions"], (current: Submission[] | undefined) =>
        current ? [submission, ...current.filter((item) => item.id !== submission.id)] : [submission]
      );
      navigate(`/result/${submission.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Не удалось отправить анкету.");
    },
  });

  const currentBlock = questionBlocks[currentBlockIndex];
  const blockQuestions = useMemo(
    () => (currentBlock ? getQuestionsByBlock(currentBlock.id) : []),
    [currentBlock]
  );
  const currentQuestion = blockQuestions[currentQuestionIndex];
  const totalQuestions = questionBlocks.reduce(
    (sum, block) => sum + getQuestionsByBlock(block.id).length,
    0
  );
  const answeredQuestionsCount = Object.values(answers).filter((value) => value.length > 0).length;
  const currentQuestionNumber =
    questionBlocks
      .slice(0, currentBlockIndex)
      .reduce((sum, block) => sum + getQuestionsByBlock(block.id).length, 0) +
    currentQuestionIndex +
    1;

  const isUserInfoValid =
    userInfo.childName.trim() &&
    userInfo.childAge.trim() &&
    userInfo.parentName.trim() &&
    userInfo.phone.trim() &&
    userInfo.consentGiven;

  const isCurrentQuestionAnswered = currentQuestion
    ? (answers[currentQuestion.id]?.length ?? 0) > 0
    : false;
  const isSubmitting = createSubmissionMutation.isPending;
  const isLastQuestion =
    currentBlockIndex === questionBlocks.length - 1 &&
    currentQuestionIndex === blockQuestions.length - 1;

  const handleSelect = (questionId: string, optionId: string) => {
    const question = blockQuestions.find((item) => item.id === questionId);
    if (!question) return;

    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (question.type === "single") {
        return { ...prev, [questionId]: [optionId] };
      }
      if (optionId === "no_complications" || optionId === "no") {
        return { ...prev, [questionId]: [optionId] };
      }

      const filtered = current.filter((id) => id !== "no_complications" && id !== "no");
      return {
        ...prev,
        [questionId]: filtered.includes(optionId)
          ? filtered.filter((id) => id !== optionId)
          : [...filtered, optionId],
      };
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < blockQuestions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      return;
    }

    if (currentBlockIndex < questionBlocks.length - 1) {
      setCurrentBlockIndex((index) => index + 1);
      setCurrentQuestionIndex(0);
      return;
    }

    createSubmissionMutation.mutate({
      userInfo,
      answers,
    });
  };

  const handleBack = () => {
    if (isSubmitting) return;

    if (phase === "userInfo") {
      navigate("/");
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((index) => index - 1);
      return;
    }

    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((index) => index - 1);
      const previousBlockQuestions = getQuestionsByBlock(questionBlocks[currentBlockIndex - 1].id);
      setCurrentQuestionIndex(previousBlockQuestions.length - 1);
      return;
    }

    setPhase("userInfo");
  };

  return (
    <div className="inner-page">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inner-nav"
      >
        <div className="inner-nav-inner">
          <button onClick={handleBack} className="inner-nav-back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="inner-nav-center">
            <span className="inner-nav-title">
              {phase === "userInfo" ? "Данные ребёнка" : "Онлайн-тест"}
            </span>
            <span className="inner-nav-subtitle">
              {phase === "userInfo"
                ? "Подготовим рекомендацию"
                : `${answeredQuestionsCount} из ${totalQuestions}`}
            </span>
          </div>
          <div style={{ width: 40 }} />
        </div>
      </motion.nav>

      {/* Content */}
      <div className="quiz-content">
        <AnimatePresence mode="wait">
          {phase === "userInfo" ? (
            <motion.div
              key="user-info"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="quiz-intake"
            >
              {/* Left: info cards */}
              <section className="quiz-intake-info">
                <div className="section-chip-new" style={{ marginBottom: 16 }}>
                  <ClipboardList className="h-3.5 w-3.5" />
                  Перед началом теста
                </div>
                <h1 className="quiz-intake-title">
                  Расскажите немного о ребёнке
                </h1>
                <p className="quiz-intake-desc">
                  Эти данные нужны, чтобы анкета была полной, а после теста
                  администратор видел всю картину и мог быстро связаться.
                </p>

                <div className="intake-cards-list">
                  {intakeCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="intake-card">
                        <div className="intake-card-icon">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="intake-card-title">{item.title}</p>
                          <p className="intake-card-text">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Right: form */}
              <section className="quiz-intake-form">
                <div className="quiz-form-card">
                  <div className="quiz-form-grid">
                    <Field
                      id="childName"
                      label="Имя ребёнка"
                      placeholder="Например, Артём"
                      value={userInfo.childName}
                      onChange={(value) => setUserInfo((prev) => ({ ...prev, childName: value }))}
                    />
                    <Field
                      id="childAge"
                      label="Возраст ребёнка"
                      placeholder="Например, 2 года 3 месяца"
                      value={userInfo.childAge}
                      onChange={(value) => setUserInfo((prev) => ({ ...prev, childAge: value }))}
                    />
                    <Field
                      id="parentName"
                      label="Ваше имя"
                      placeholder="Имя родителя"
                      value={userInfo.parentName}
                      onChange={(value) => setUserInfo((prev) => ({ ...prev, parentName: value }))}
                    />
                    <Field
                      id="phone"
                      label="Телефон"
                      placeholder="+7 (___) ___-__-__"
                      type="tel"
                      value={userInfo.phone}
                      onChange={(value) => setUserInfo((prev) => ({ ...prev, phone: value }))}
                    />
                  </div>

                  <label className="quiz-consent">
                    <Checkbox
                      id="consent"
                      checked={userInfo.consentGiven}
                      onCheckedChange={(checked) =>
                        setUserInfo((prev) => ({ ...prev, consentGiven: checked === true }))
                      }
                      className="mt-0.5 rounded-md"
                    />
                    <div>
                      <p className="quiz-consent-title">Согласие на обработку данных</p>
                      <p className="quiz-consent-text">
                        Я соглашаюсь на обработку персональных данных для
                        сохранения анкеты и получения рекомендации.
                      </p>
                    </div>
                  </label>
                </div>

                <Button
                  onClick={() => setPhase("questions")}
                  disabled={!isUserInfoValid}
                  className="quiz-next-btn"
                  size="lg"
                >
                  Перейти к вопросам
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key={`question-${currentBlockIndex}-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="quiz-question-layout"
            >
              {/* Sidebar (desktop) */}
              <aside className="quiz-sidebar">
                <div className="quiz-sidebar-sticky">
                  <StepProgress
                    currentBlockIndex={currentBlockIndex}
                    currentQuestionInBlock={currentQuestionIndex}
                    totalQuestionsInBlock={blockQuestions.length}
                    layout="sidebar"
                  />

                  <div className="quiz-sidebar-info">
                    <p className="section-chip-new" style={{ fontSize: 11 }}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Навигация
                    </p>
                    <p className="quiz-sidebar-q">
                      Вопрос {currentQuestionNumber} из {totalQuestions}
                    </p>
                    <div className="quiz-sidebar-score">
                      <p className="quiz-sidebar-score-label">Пройдено</p>
                      <p className="quiz-sidebar-score-value">
                        {answeredQuestionsCount} / {totalQuestions}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentQuestionAnswered || isSubmitting}
                    className="quiz-next-btn"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        Сохраняем анкету...
                      </>
                    ) : isLastQuestion ? (
                      "Завершить тест"
                    ) : (
                      "Следующий вопрос"
                    )}
                  </Button>
                </div>
              </aside>

              {/* Question area */}
              <div className="quiz-question-area">
                <div className="quiz-mobile-progress">
                  <StepProgress
                    currentBlockIndex={currentBlockIndex}
                    currentQuestionInBlock={currentQuestionIndex}
                    totalQuestionsInBlock={blockQuestions.length}
                  />
                </div>

                {currentQuestion ? (
                  <QuestionCard
                    question={currentQuestion}
                    selectedOptions={answers[currentQuestion.id] || []}
                    onSelect={handleSelect}
                  />
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile bottom button */}
      <div className="quiz-mobile-bottom">
        {phase === "userInfo" ? (
          <Button
            onClick={() => setPhase("questions")}
            disabled={!isUserInfoValid}
            className="quiz-next-btn"
            size="lg"
          >
            Перейти к вопросам
            <ArrowRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered || isSubmitting}
            className="quiz-next-btn"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Сохраняем...
              </>
            ) : isLastQuestion ? (
              "Завершить тест"
            ) : (
              "Следующий вопрос"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}

function Field({ id, label, placeholder, value, onChange, type = "text" }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="quiz-field-input"
      />
    </div>
  );
}
