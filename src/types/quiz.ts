export type Locale = "ru" | "kz";

export interface LocalizedText {
  ru: string;
  kz: string;
}

export type QuestionType = "single" | "multiple";

export type IllustrationKey = "pointing" | "crawling" | "ivl" | "shared-attention";

export interface QuestionCustomInput {
  kind: "apgar" | "free_text";
  inputLabel: LocalizedText;
  placeholder: LocalizedText;
  multiline?: boolean;
}

export interface QuestionOption {
  id: string;
  label: LocalizedText;
  deviation?: boolean;
  critical?: boolean;
  exclusive?: boolean;
  hintCodes?: string[];
}

export interface Question {
  id: string;
  blockId: string;
  text: LocalizedText;
  helperText?: LocalizedText;
  type: QuestionType;
  illustration?: IllustrationKey;
  customInput?: QuestionCustomInput;
  options: QuestionOption[];
}

export interface QuestionBlock {
  id: string;
  title: LocalizedText;
  shortTitle: LocalizedText;
  description: LocalizedText;
}

export interface UserInfo {
  childName: string;
  birthDate: string;
  ageNote?: string;
  parentName: string;
  phone: string;
  consentGiven: boolean;
}

export type QuizAnswerValue = string | string[];

export interface QuizAnswers {
  [questionId: string]: QuizAnswerValue;
}

export type RiskStatus = "green" | "yellow" | "red";
export type RiskDomain =
  | "perinatal"
  | "motor"
  | "speech"
  | "communication"
  | "sensory"
  | "play";
export type MarkerSeverity = "medium" | "high" | "critical";

export interface BlockAssessment {
  blockId: string;
  deviations: number;
  level: "low" | "medium" | "high";
}

export interface BlockProfile {
  domain: RiskDomain;
  title: string;
  level: "low" | "medium" | "high";
  summary: string;
  concerns: string[];
  evidenceQuestionIds: string[];
}

export interface PriorityMarker {
  code: string;
  domain: RiskDomain;
  severity: MarkerSeverity;
  title: string;
  summary: string;
  evidence: string[];
}

export interface ClinicalHypothesis {
  code: string;
  title: string;
  summary: string;
  evidence: string[];
}

export interface SessionFocusItem {
  code: string;
  title: string;
  description: string;
}

export interface InSessionRecommendation {
  code: string;
  title: string;
  goal: string;
  startModule: string;
  watchFor: string;
  useStrengths?: string;
  contactStyle: string;
  evidence: string[];
}

export interface HomeGuidanceItem {
  code: string;
  title: string;
  description: string;
}

export interface CheckInPersonItem {
  code: string;
  title: string;
  reason: string;
}

export interface RuleTraceEntry {
  code: string;
  title: string;
  domain: RiskDomain;
  severity: MarkerSeverity;
  triggeredBy: string[];
  outputs: string[];
}

export interface OfferDetails {
  discountPercent: number;
  fullPrice: number;
  discountedPrice: number;
  expiresAt: string;
}

export interface QuizResult {
  status: RiskStatus;
  riskStatus: RiskStatus;
  totalDeviations: number;
  blockAssessments: BlockAssessment[];
  criticalFlags: string[];
  unknownAnswers: string[];
  offer: OfferDetails;
  reportVersion: number;
  clinicalSummary: string;
  blockProfiles: BlockProfile[];
  priorityMarkers: PriorityMarker[];
  clinicalHypotheses: ClinicalHypothesis[];
  sessionFocus: SessionFocusItem[];
  inSessionRecommendations: InSessionRecommendation[];
  homeGuidance: HomeGuidanceItem[];
  whatToCheckInPerson: CheckInPersonItem[];
  contraNotes: string[];
  ruleTrace: RuleTraceEntry[];
}

export type PublicQuizResult = Pick<
  QuizResult,
  | "status"
  | "riskStatus"
  | "totalDeviations"
  | "blockAssessments"
  | "offer"
  | "reportVersion"
  | "clinicalSummary"
> & {
  blockProfiles: Array<Pick<BlockProfile, "domain" | "title" | "level" | "summary" | "concerns">>;
};

export type LeadStatus = "new" | "called" | "scheduled" | "completed" | "declined";

export interface SubmissionInput {
  locale: Locale;
  userInfo: UserInfo;
  answers: QuizAnswers;
}

export interface Submission {
  id: string;
  schemaVersion: 2;
  date: string;
  locale: Locale;
  publicToken: string;
  leadStatus: LeadStatus;
  scheduledFor?: string | null;
  userInfo: UserInfo;
  answers: QuizAnswers;
  result: QuizResult;
}

export interface PublicSubmission {
  id: string;
  date: string;
  locale: Locale;
  userInfo: Pick<UserInfo, "childName">;
  result: PublicQuizResult;
}

export interface CreateSubmissionResponse extends PublicSubmission {
  publicToken: string;
}

export interface AdminSession {
  authenticated: boolean;
  username: string;
}
