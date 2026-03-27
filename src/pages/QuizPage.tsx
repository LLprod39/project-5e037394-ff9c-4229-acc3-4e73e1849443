import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import QuestionCard from '@/components/QuestionCard';
import StepProgress from '@/components/StepProgress';
import { questionBlocks, getQuestionsByBlock } from '@/data/questionsConfig';
import { calculateResult } from '@/utils/calculateResult';
import { saveSubmission } from '@/utils/storage';
import { UserInfo, QuizAnswers, Submission } from '@/types/quiz';
import { ArrowLeft } from 'lucide-react';

type Phase = 'userInfo' | 'questions' | 'submitting';

export default function QuizPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('userInfo');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    childName: '',
    childAge: '',
    parentName: '',
    phone: '',
    consentGiven: false,
  });
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentBlock = questionBlocks[currentBlockIndex];
  const blockQuestions = useMemo(
    () => (currentBlock ? getQuestionsByBlock(currentBlock.id) : []),
    [currentBlock]
  );
  const currentQuestion = blockQuestions[currentQuestionIndex];

  const isUserInfoValid =
    userInfo.childName.trim() &&
    userInfo.childAge.trim() &&
    userInfo.parentName.trim() &&
    userInfo.phone.trim() &&
    userInfo.consentGiven;

  const isCurrentQuestionAnswered = currentQuestion
    ? (answers[currentQuestion.id]?.length ?? 0) > 0
    : false;

  const handleSelect = (questionId: string, optionId: string) => {
    const question = blockQuestions.find(q => q.id === questionId);
    if (!question) return;

    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (question.type === 'single') {
        return { ...prev, [questionId]: [optionId] };
      }
      // multiple: toggle
      if (optionId === 'no_complications' || optionId === 'no') {
        return { ...prev, [questionId]: [optionId] };
      }
      const filtered = current.filter(id => id !== 'no_complications' && id !== 'no');
      return {
        ...prev,
        [questionId]: filtered.includes(optionId)
          ? filtered.filter(id => id !== optionId)
          : [...filtered, optionId],
      };
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < blockQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else if (currentBlockIndex < questionBlocks.length - 1) {
      setCurrentBlockIndex(i => i + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Done — calculate and save
      const result = calculateResult(answers);
      const submission: Submission = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        userInfo,
        answers,
        result,
      };
      saveSubmission(submission);
      navigate(`/result/${submission.id}`);
    }
  };

  const handleBack = () => {
    if (phase === 'userInfo') {
      navigate('/');
      return;
    }
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
    } else if (currentBlockIndex > 0) {
      setCurrentBlockIndex(i => i - 1);
      const prevBlockQuestions = getQuestionsByBlock(questionBlocks[currentBlockIndex - 1].id);
      setCurrentQuestionIndex(prevBlockQuestions.length - 1);
    } else {
      setPhase('userInfo');
    }
  };

  const isLastQuestion =
    currentBlockIndex === questionBlocks.length - 1 &&
    currentQuestionIndex === blockQuestions.length - 1;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-muted active:bg-muted/80">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {phase === 'userInfo' ? 'Данные ребёнка' : 'Тест'}
        </span>
      </div>

      {phase === 'questions' && (
        <StepProgress
          currentBlockIndex={currentBlockIndex}
          currentQuestionInBlock={currentQuestionIndex}
          totalQuestionsInBlock={blockQuestions.length}
        />
      )}

      {/* Content */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {phase === 'userInfo' ? (
            <motion.div
              key="userInfo"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Расскажите о ребёнке
                </h2>
                <p className="text-sm text-muted-foreground">Эти данные помогут нам подготовить персональную рекомендацию</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="childName" className="text-sm font-semibold">Имя ребёнка</Label>
                  <Input
                    id="childName"
                    value={userInfo.childName}
                    onChange={e => setUserInfo(prev => ({ ...prev, childName: e.target.value }))}
                    placeholder="Например, Артём"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAge" className="text-sm font-semibold">Возраст ребёнка</Label>
                  <Input
                    id="childAge"
                    value={userInfo.childAge}
                    onChange={e => setUserInfo(prev => ({ ...prev, childAge: e.target.value }))}
                    placeholder="Например, 2 года 3 месяца"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentName" className="text-sm font-semibold">Ваше имя</Label>
                  <Input
                    id="parentName"
                    value={userInfo.parentName}
                    onChange={e => setUserInfo(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Имя родителя"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userInfo.phone}
                    onChange={e => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+7 (___) ___-__-__"
                    className="h-12 rounded-xl text-base"
                  />
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="consent"
                    checked={userInfo.consentGiven}
                    onCheckedChange={(checked) =>
                      setUserInfo(prev => ({ ...prev, consentGiven: checked === true }))
                    }
                    className="mt-0.5"
                  />
                  <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Я даю согласие на обработку персональных данных в соответствии с политикой конфиденциальности
                  </Label>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`q-${currentBlockIndex}-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestion && (
                <QuestionCard
                  question={currentQuestion}
                  selectedOptions={answers[currentQuestion.id] || []}
                  onSelect={handleSelect}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky bottom button */}
      <div className="sticky bottom-0 px-5 py-4 bg-background/95 backdrop-blur-sm border-t border-border/50 safe-bottom">
        {phase === 'userInfo' ? (
          <Button
            onClick={() => setPhase('questions')}
            disabled={!isUserInfoValid}
            className="w-full h-14 text-base font-bold rounded-2xl"
            size="lg"
          >
            Далее
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered}
            className="w-full h-14 text-base font-bold rounded-2xl"
            size="lg"
          >
            {isLastQuestion ? 'Завершить тест' : 'Далее'}
          </Button>
        )}
      </div>
    </div>
  );
}
