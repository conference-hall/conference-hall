export type SurveyQuestions = Array<{
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'checkbox' | 'radio';
  required: boolean;
  options?: Array<{ id: string; label: string }>;
}>;

export type SurveyAnswers = Record<string, string | Array<string> | null | undefined>;
